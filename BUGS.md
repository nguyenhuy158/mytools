# Known Bugs

Findings from a production audit on 2026-08-05 (`huyab.click`). Each entry
records how it was verified, so nothing here is a guess. Tick a box only after
the fix is verified **on prod**, not just locally — this project deploys on
push to `main` and tests do not gate the deploy.

Severity: **S1** data exposure or loss · **S2** advertised feature does not
work · **S3** wrong output or visible defect · **S4** SEO/hardening.

---

## [ ] S1 — Notes are shared by everyone, and anyone can edit or delete them

`GET /api/notes` returns **every** note, with content, to any caller. No
authentication anywhere.

**Verified on prod**

```sh
$ curl https://huyab.click/api/notes
[{"id":"de2282bd…","title":"Untitled Note","plainText":"2kfa;sjldkfajslkd",…},
 {"id":…,"title":"what  the help??",…}]
```

**Cause** — `app/routes/api.notes.tsx` keys everything off a single global KV
entry `notes:list`, with no per-user scoping. `grep -niE 'auth|session|cookie|token|user|owner|jwt'`
over `api.notes.tsx` and `api.notes_.$id.tsx` returns nothing, so `PUT`
(edit) and `DELETE` on `/api/notes/:id` are open too — a stranger can wipe
the list.

Only two throwaway test notes exist today, so nothing real has been lost yet.
But `/it/notes` presents itself as "Store and Manage Notes", which reads as
private.

**Needs a decision before coding** — pick one:

1. Scope notes to an anonymous id in an `httpOnly` cookie. No login, each
   browser sees only its own. The two existing notes become orphaned.
2. Real accounts. Most work; only worth it if notes should follow a person
   across devices.
3. Keep it a public scratchpad, but say so on the page so nobody trusts it
   with anything private.

Whichever way, the write endpoints must stop accepting anonymous edits to
arbitrary ids.

---

## [ ] S2 — PWA is broken: no service worker is deployed, so there is no offline support

**Verified on prod**

```sh
$ curl -o /dev/null -w '%{http_code}' https://huyab.click/sw.js
404
$ curl https://huyab.click/registerSW.js
if('serviceWorker' in navigator) { … navigator.serviceWorker.register('/sw.js', …) }
```

**Cause** — `vite-plugin-pwa` writes into `dist/`, but React Router v7 builds
into `build/client/`. From the build log:

```
precache  4 entries (0.00 KiB)
  dist/sw.js
  dist/workbox-daba6f28.js
  One of the glob patterns doesn't match any files.
  globDirectory: /mnt/DATA1T/mytools/dist
```

So `sw.js` and `workbox-*.js` land in `dist/` — which is in `.gitignore` and
never deployed — while `registerSW.js` does end up in `build/client/` and asks
for a file that is not there. The precache manifest is empty either way.

Separately, **no page loads `registerSW.js`** (0 of 26 audited pages reference
it), so registration never even starts.

`README.md` currently claims "PWA Support (Offline ready & Installable)".
Installable is true — the manifest and icons are fine. Offline is not.

**Fix** — point the plugin at the real output directory, confirm `sw.js` is
emitted into `build/client/` with a non-empty precache list, and make sure the
registration script is actually included in the document.

---

## [x] S3 — Ten pages have no `<title>` — fixed

The browser tab shows the URL, and search results have no title. Every one of
these route modules is missing an `export function meta`.

| Route | File |
| --- | --- |
| `/liquid-glass` | `app/routes/liquid-glass.tsx` |
| `/it` | `app/routes/it.tsx` (+ `it-home.tsx`) |
| `/it/markdown-preview` | `app/routes/it/markdown-preview.tsx` |
| `/lifestyle` | `app/routes/lifestyle.tsx` (+ `lifestyle-home.tsx`) |
| `/games` | `app/routes/games.tsx` (+ `games-home.tsx`) |
| `/games/2048` | `app/routes/2048.tsx` |
| `/games/snake` | `app/routes/snake.tsx` |
| `/games/minesweeper` | `app/routes/minesweeper.tsx` |
| `/games/tetris` | `app/routes/games/tetris.tsx` |
| `/games/loto` | `app/routes/games/loto.tsx` |

**Verified on prod** by fetching all 26 routes with a browser User-Agent and
extracting `<title>`; the other 16 routes have one.

**Fixed** — each of the ten got its own `meta` export with a distinct title and
description. `__tests__/routes/meta.test.ts` now walks `app/routes.ts` and
requires every page route to export its own `meta`; only an `index()` route may
inherit its layout's, since it renders at the same URL. A leaf inheriting would
give `/games/snake` and `/games/tetris` the same title, which is not a fix.
Confirmed the test fails when a meta export is removed.

---

## [ ] S3 — `number-to-words` returns nonsense for negatives and decimals

```
toVietnamese(-5)   -> "mươi lăm"             expected "âm năm"
toVietnamese(0.5)  -> "mươi lăm"             expected "không phẩy năm"
toVietnamese(1.5)  -> "một trăm  mươi lăm"   (also a double space)
toEnglish(-5)      -> ""
toEnglish(0.5)     -> "undefined"            the literal string
```

**Not currently reachable from the UI**: `app/routes/it/number-reading.tsx`
strips input with `replace(/[^0-9]/g, "")`, so only non-negative integers get
through. The util is exported though, and `toEnglish` returning the string
`"undefined"` is a trap for the next caller.

`app/utils/number-to-words.ts` has no test file. Fix should come with one.

---

## [ ] S4 — No `sitemap.xml`, no canonical, duplicate content on two hostnames

- `GET /sitemap.xml` → 404, while `/robots.txt` → 200.
- No `<link rel="canonical">` and no `og:` tags on any page.
- `huyab.click` and `case.huyab.click` both serve the identical site with the
  same `<title>`, so search engines see duplicate content. (`www` already
  301s correctly.)

---

## [ ] S4 — No security headers

None of `Content-Security-Policy`, `X-Content-Type-Options`,
`Referrer-Policy`, `X-Frame-Options`, `Strict-Transport-Security` are sent.

---

## Checked and healthy

Recorded so a future audit does not redo the work:

- 26/26 routes return 200. None leak an error boundary, `Unexpected Server
  Error`, or a hidden 404 page.
- All 125 referenced assets (JS, CSS, images, manifest) return 200 — zero
  broken references.
- `/api/holidays` returns valid JSON; `/api/notes/<bad-id>` correctly returns
  404 with `{"error":"Note not found"}`; `POST /api/loto/create-room` returns
  a usable room id; `/api/projects-status` reports 15/16 online.
- Both WebSocket routes answer a plain HTTP request with `400 Expected
  WebSocket` rather than a 500.
- No i18n keys leak into rendered output.
- `manifest.webmanifest` is valid: name, `start_url`, `display`, 3 icons.

## Mobile-first gaps (separate from bugs)

Fixed already in `a02d26d`: history delete unreachable on touch, a restore
button with no `onClick`, and 20px tap targets.

Still open:

- `min-h-screen` / `h-screen` in 19 files with zero uses of `dvh`, so mobile
  browsers size against the address bar.
- No `env(safe-area-inset-*)` handling, so the footer sits under the iPhone
  home indicator.
- `calendar` has a 7-column grid with no `overflow-x-auto`; `calendar` and
  `json-tools` use a fixed `h-[600px]`; `tetris` has `min-w-[300px]`, which
  crowds a 320px screen.
- `/projects` uses `text-xs` in 11 places and a fixed `grid-cols-3` stat row,
  both tight at 320px.

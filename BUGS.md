# Known Bugs

Findings from a production audit on 2026-08-05 (`huyab.click`). Each entry
records how it was verified, so nothing here is a guess. Tick a box only after
the fix is verified **on prod**, not just locally — this project deploys on
push to `main` and tests do not gate the deploy.

Severity: **S1** data exposure or loss · **S2** advertised feature does not
work · **S3** wrong output or visible defect · **S4** SEO/hardening.

---

## [x] S1 — Notes are shared by everyone, and anyone can edit or delete them — fixed

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

**Fixed with option 1** — an anonymous owner id in an `httpOnly`, `Secure`,
`SameSite=Lax` cookie, minted on first contact. No login, so the tool stays as
easy to use as before.

- `app/utils/notes-owner.ts` holds the cookie read/write and the ownership
  check. The cookie value must match a uuid, so a hand-written cookie cannot
  become an owner id or smuggle a KV key.
- Each owner has their own list key, `notes:list:<ownerId>`, and every note
  records its `ownerId`. Listing also re-checks each note's owner, so a
  mismatched entry can never be returned.
- `GET`, `PUT` and `DELETE` on `/api/notes/:id` answer **404** — not 403 — for a
  note belonging to someone else, so ids cannot be probed for existence.
- The two pre-existing notes have no `ownerId` and are therefore unreachable
  by design: handing them to whichever visitor asked first would have been the
  same bug again. Their KV entries were left untouched rather than deleted.
- `/it/notes` now states that notes live in this browser only, so clearing
  cookies does not look like unexplained data loss.

Trade-off accepted: clearing cookies, or another browser/device, starts with an
empty list. Real accounts (option 2) remain open if notes should follow a
person.

27 tests in `__tests__/routes/notes-ownership.test.ts` drive the endpoints
against a fake KV, including the attack that used to work — a stranger
deleting someone's note — and assert the note survives.

---

## [x] S2 — PWA is broken: no service worker is deployed, so there is no offline support — fixed

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

**Fixed** — three separate config mistakes, all in `vite.config.ts`:

1. `build.outDir` was never set, so Vite defaulted to `dist` and
   vite-plugin-pwa (which is not environment-aware and just reads that field)
   emitted there. Set explicitly to `build/client`, matching where React
   Router's own per-environment build already lands. Precache went from 0
   entries to 180.
2. `injectRegister: "auto"` injects a `<script>` into a built `index.html`,
   which never existed (SSR, no static shell). Set `injectRegister: false` and
   call `registerSW()` from `virtual:pwa-register` explicitly in
   `app/entry.client.tsx` instead.
3. The plugin's default `navigateFallback: "index.html"` produced a
   `NavigationRoute` bound to a precache entry that does not exist for the
   same reason. Set `navigateFallback: undefined` and added a `NetworkFirst`
   runtime-caching rule for `request.mode === "navigate"` instead — so a page
   already visited is cached as itself and stays reachable offline, rather
   than everything falling back to one static shell that was never real.
   `clientsClaim: true` was added alongside so a freshly installed worker
   starts controlling the current tab instead of waiting for a future reload.

Also required `workbox-window` as an explicit dependency (`virtual:pwa-register`
needs it at build time; it isn't hoisted by pnpm otherwise) and added
`"vite-plugin-pwa/client"` to `tsconfig.cloudflare.json`'s `types`, since
without it `import { registerSW } from "virtual:pwa-register"` doesn't
typecheck.

**Verified with a real browser, not just build output** — headless Chrome
driven directly over the DevTools Protocol (no Puppeteer/Playwright
installed, so a small script talked to the CDP WebSocket directly):

- Service worker installs and reaches `activated` within ~2s of first load.
- `caches.keys()` shows `workbox-precache-v2-...` (177 entries) plus
  `pages-cache` after a second navigation.
- Killed the wrangler dev server outright (not CDP's network-conditions
  emulation — see the note below on why) and reloaded: a previously visited
  page (`/calendar`) rendered its real content from cache with zero backend
  running. A never-visited page (`/games/sudoku`) correctly showed the
  browser's own "can't be reached" error — no crash, no false promise of
  full-site offline support, exactly the honest behavior for an SSR app with
  no static app shell.

One dead end worth recording: the first pass tested "offline" using CDP's
`Network.emulateNetworkConditions({ offline: true })`, and a page that had
never been visited before *still* rendered correctly. That looked like a
bug in the fix — until re-checking with the dev server actually killed
reproduced the correct (failing) behavior instead. CDP's network emulation
is scoped to the page's own target; a service worker runs on a separate
target and its own `fetch()` calls were not affected by that flag, so that
first result was a false positive from the test method, not from the code.
Actually cutting the network is what caught it.

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
  `json-tools` use a fixed `h-[600px]`, which crowds a 320px screen.
- `/projects` uses `text-xs` in 11 places and a fixed `grid-cols-3` stat row,
  both tight at 320px.

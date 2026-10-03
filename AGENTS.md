# Repository Guidelines

## Project Structure & Module Organization

ToolHub (`huyab.click`, `case.huyab.click`) is a collection of online tools
(JSON, Text Diff, Pomodoro, Notes, games, ...) built with React Router v7 in
SSR mode, Tailwind CSS v4 and TypeScript, served by one Cloudflare Worker.
Fully internationalized (English/Vietnamese); slogan "Your Hub for Essential
Tools" / "Trung tâm công cụ thiết yếu của bạn".

```text
app/                           # React Router app (SSR)
  root.tsx                     #   HTML shell, theme bootstrap (.dark on <html>), providers
  routes.ts                    #   Route table: UI sections + /api/* resource routes
  routes/                      #   Route modules; it/ and games/ hold nested tools
    api.*.tsx                  #   Server resource routes (notes, loto, holidays, ...)
  components/                  #   Shared UI components (PascalCase)
  utils/                       #   Pure helpers + small clients (text-case, notes, sudoku, ...)
  workers/                     #   Web Workers (sentiment.worker.ts)
  locales/{en,vi}/             #   i18next translation.json files
  data/                        #   Static data (projects showcase)
  app.css                      #   Tailwind entry + shared component classes
workers/                       # Cloudflare Worker entry
  app.ts                       #   fetch handler: CLI responder, then React Router
  cli.ts                       #   Plain-text interface for curl/wget clients
  loto-room.ts                 #   Durable Object LotoGameRoom (LOTO_ROOMS)
  online-counter.ts            #   Durable Object OnlineCounter (ONLINE_COUNTER)
__tests__/                     # Vitest suites (components, routes, utils, workers)
public/                        # Static assets, PWA icons, project screenshots
scripts/refresh-project-shots.mjs  # Regenerate public/projects/*.png
wrangler.jsonc                 # Worker config: KV, D1, Durable Objects, routes
pnpm-workspace.yaml            # pnpm 10/11 compatibility (see Deploy & CI)
```

Long-form docs: `README.md` (architecture and flows), `ROUTES.md`,
`STYLE_GUIDE.md`, `TESTING.md` (manual checklist), `BUGS.md`, `ROADMAP.md`.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies (runs `wrangler types` on postinstall).
- `pnpm dev`: start the React Router dev server with HMR.
- `pnpm typecheck`: generate Worker and route types, then `tsc -b`.
- `pnpm build`: production build into `build/client` and `build/server`.
- `pnpm test`: Vitest in watch mode; `pnpm test:run` runs once,
  `pnpm test:coverage` adds coverage, `pnpm test:ui` opens the Vitest UI.
- `pnpm preview`: build, then serve the production build locally.
- `pnpm shots`: refresh the project screenshots in `public/projects/`.

Use `pnpm` for all package commands, never `npm`.

## Coding Style & Naming Conventions

- TypeScript with strict settings; avoid `any`, type props and event handlers
  explicitly (e.g. `React.MouseEvent`).
- Two-space indentation, double quotes, semicolons.
- PascalCase for components and interfaces, camelCase for functions and
  variables. ES imports, relative paths for internals (`~/` aliases `app/`).
- Styling is Tailwind CSS only; no new CSS files. Mobile-first
  (`block md:flex`). Dark mode is mandatory and class-based (`.dark` on
  `<html>`): every color needs its `dark:` counterpart. Avoid arbitrary values.
  See `STYLE_GUIDE.md`.
- Localization: use the `useTranslation` hook and add keys to both
  `app/locales/en/translation.json` and `app/locales/vi/translation.json`.
- Async work uses try/catch with toast notifications (`sonner`) for user
  feedback.
- Privacy-first: tools process data in the browser; do not send user input to
  the server unless the feature is explicitly server-backed (Notes, Loto).

## Testing Guidelines

Tests use Vitest with `happy-dom` and Testing Library, configured in
`vitest.config.ts` / `vitest.setup.ts`. Suites live under `__tests__/`,
mirroring the source folder (`__tests__/utils/text-case.test.ts` covers
`app/utils/text-case.ts`). D1-backed routes use `__tests__/utils/d1-fixture.ts`.
Run `pnpm test:run` before pushing; manual UI checks are listed in `TESTING.md`.

## Commit & Pull Request Guidelines

Use Conventional Commits with an emoji prefix, for example
`✨ feat: add pdf merge tool` or `🐛 fix: keep sudoku notes on undo`. Pull
requests should include a short summary, typecheck/test/build results, a linked
issue if available, and screenshots (light and dark) for visible UI changes.

## Deploy & CI

Deploys are automatic. Pushing to `main` is the whole release process — never
run `wrangler deploy` by hand unless CI is broken and you have said so out loud.

- **Trigger**: push to `main` → Cloudflare Workers Builds → live in ~2.5 min.
  Only `main` deploys (`branch_includes: ["main"]`); previews are disabled, so
  feature branches and PRs build nothing.
- **Pipeline**: `pnpm install --frozen-lockfile` → `pnpm run build` →
  `npx wrangler deploy --config build/server/wrangler.json`
- **Worker name is `case-converter`** — a legacy name from when this was only a
  case converter. Do **not** rename it. Renaming creates a *new* Worker and
  orphans the Durable Object state in `LOTO_ROOMS` and `ONLINE_COUNTER`.
- **Rollback**: `npx wrangler rollback --name case-converter`. Cloudflare
  retains every version, so rollback never needs a local checkout.

### Traps that have already caused outages

**Commit `pnpm-lock.yaml` with every `package.json` change.** CI installs with
`--frozen-lockfile`; local `pnpm install` does not. A lockfile that drifts from
`package.json` fails in CI while working perfectly on your machine. This exact
mistake silently broke production for six months (2026-02-02 → 2026-08-04):
every push failed with `ERR_PNPM_OUTDATED_LOCKFILE` while prod sat on stale code.

**Do not remove `packages: [.]` from `pnpm-workspace.yaml`.** CI runs pnpm 10.11,
which treats the file as a workspace root and aborts with
`ERROR packages field missing or empty`. Local pnpm 11 does not need it, so
deleting it looks harmless and breaks only CI.

**Keep both build-allowlist keys in `pnpm-workspace.yaml`.** pnpm 10 reads
`onlyBuiltDependencies`, pnpm 11 reads `allowBuilds`. Both must list `esbuild`,
`protobufjs`, `sharp`, `workerd` — these fetch platform binaries in postinstall,
and without them `pnpm build` dies on `ERR_PNPM_IGNORED_BUILDS`.

**Keep `routes` in `wrangler.jsonc` matching the real custom domains**,
currently `huyab.click` (apex) and `case.huyab.click`. A route pointing at a
zone outside the `nguyenhuy158` account fails the deploy. The config referenced
the long-dead `huycode.click` for months.

**Verify a version change with asset hashes, not HTTP 200.** Diff the
`/assets/*` filenames in the served HTML, or md5 a changed file against
`build/client/assets/`. A 200 only proves the old version is still serving.

### Two known gaps

- **Build failures are silent** — no email, no notification. A failed build
  leaves production on the previous version (safe) but you will not be told.
  Check Deployments in the dashboard after pushing, or query
  `GET /accounts/{account_id}/builds/workers/{script_tag}/builds`.
- **Tests do not gate deploys.** `build_command` is `pnpm run build` only. A
  build error (TypeScript, bad import) blocks the deploy; logic that compiles
  but is wrong ships straight to production. Run `pnpm test:run` before pushing.

## Agent-Specific Instructions

Keep responses short and focused. If a requirement is unclear, ask before making
assumptions. Always run `pnpm typecheck` and `pnpm build` after changes.
Design UI/UX to fit inside a single viewport by default. Avoid page-level
scrolling; use compact layouts, tabs, panes, or contained internal lists when
content can overflow.

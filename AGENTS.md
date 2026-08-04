<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# ToolHub Agent Guidelines

**Project Overview:** ToolHub is a collection of essential online tools (JSON, Text Diff, Pomodoro, Games, etc.) built with React Router v7, Tailwind CSS v4, and TypeScript. Fully internationalized (English/Vietnamese) with slogan: "Your Hub for Essential Tools" / "Trung tâm công cụ thiết yếu của bạn".

## Build & Test
- **Build**: `pnpm build` (Production build)
- **Type Check**: `pnpm typecheck` (TypeScript validation)
- **Dev Server**: `pnpm dev` (HMR development)
- **Tests**: Vitest. `pnpm test` (watch), `pnpm test:run` (once), `pnpm test:coverage`, `pnpm test:ui`. Note these do **not** gate deploys — see Deploy & CI.

## Code Style Guidelines
- **Stack**: React Router v7, Tailwind CSS v4, TypeScript, i18next for localization.
- **Formatting**: 2 spaces indent, double quotes, semicolons required.
- **Naming**: PascalCase for components/interfaces, camelCase for functions/variables.
- **Imports**: ES imports, relative paths for internals (e.g., `./Button`).
- **Styling**: STRICTLY Tailwind CSS only. No new CSS files. Mobile-first (`block md:flex`). Dark mode mandatory (`bg-white dark:bg-gray-950`, `text-gray-900 dark:text-gray-100`).
- **Types**: Explicit props/event handlers (e.g., `React.MouseEvent`). Avoid `any`.
- **Localization**: Use `useTranslation` hook. Add keys to `public/locales/{en,vi}/translation.json`.
- **Error Handling**: Use try/catch for async ops, toast notifications for user feedback.
- **AI Guidelines**: Follow STYLE_GUIDE.md AI_GUIDELINES: Tailwind-only, dark mode compliance, mobile-first, simplicity (avoid arbitrary values).

## Deploy & CI

Deploys are automatic. Pushing to `main` is the whole release process — never run
`wrangler deploy` by hand unless CI is broken and you have said so out loud.

- **Trigger**: push to `main` → Cloudflare Workers Builds → live in ~2.5 min.
  Only `main` deploys (`branch_includes: ["main"]`); previews are disabled, so
  feature branches and PRs build nothing.
- **Pipeline**: `pnpm install --frozen-lockfile` → `pnpm run build` →
  `npx wrangler deploy --config build/server/wrangler.json`
- **Worker name is `case-converter`** — a legacy name from when this was only a
  case converter. Do **not** rename it. Renaming creates a *new* Worker and
  orphans the Durable Object state in `LOTO_ROOMS` and `ONLINE_COUNTER`.
- **Rollback**: `npx wrangler rollback --name case-converter`. Cloudflare retains
  every version, so rollback never needs a local checkout.

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

**Keep `routes` in `wrangler.jsonc` matching the real custom domains**, currently
`huyab.click` (apex) and `case.huyab.click`. A route pointing at a zone outside
the `nguyenhuy158` account fails the deploy. The config referenced the long-dead
`huycode.click` for months.

**Verify a version change with asset hashes, not HTTP 200.** Diff the
`/assets/*` filenames in the served HTML, or md5 a changed file against
`build/client/assets/`. A 200 only proves the old version is still serving.

### Two known gaps

- **Build failures are silent** — no email, no notification. A failed build leaves
  production on the previous version (safe) but you will not be told. Check
  Deployments in the dashboard after pushing, or query
  `GET /accounts/{account_id}/builds/workers/{script_tag}/builds`.
- **Tests do not gate deploys.** `build_command` is `pnpm run build` only. A build
  error (TypeScript, bad import) blocks the deploy; logic that compiles but is
  wrong ships straight to production. Run `pnpm test:run` before pushing.

## Additional Rules
- Always run `pnpm typecheck` and `pnpm build` after changes.
- For new features, create OpenSpec proposals if significant.
- Privacy-first: No server-side data transmission.

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: Bash("openskills read <skill-name>")
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>algorithmic-art</name>
<description>Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations.</description>
<location>project</location>
</skill>

<skill>
<name>brand-guidelines</name>
<description>Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.</description>
<location>project</location>
</skill>

<skill>
<name>canvas-design</name>
<description>Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations.</description>
<location>project</location>
</skill>

<skill>
<name>dev-browser</name>
<description>Browser automation with persistent page state. Use when users ask to navigate websites, fill forms, take screenshots, extract web data, test web apps, or automate browser workflows. Trigger phrases include "go to [url]", "click on", "fill out the form", "take a screenshot", "scrape", "automate", "test the website", "log into", or any browser interaction request.</description>
<location>project</location>
</skill>

<skill>
<name>doc-coauthoring</name>
<description>Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This workflow helps users efficiently transfer context, refine content through iteration, and verify the doc works for readers. Trigger when user mentions writing docs, creating proposals, drafting specs, or similar documentation tasks.</description>
<location>project</location>
</skill>

<skill>
<name>docx</name>
<description>"Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. When Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks"</description>
<location>project</location>
</skill>

<skill>
<name>frontend-design</name>
<description>Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.</description>
<location>project</location>
</skill>

<skill>
<name>gastown</name>
<description>Multi-agent orchestrator for Claude Code. Use when user mentions gastown, gas town, gt commands, bd commands, convoys, polecats, crew, rigs, slinging work, multi-agent coordination, beads, hooks, molecules, workflows, the witness, the mayor, the refinery, the deacon, dogs, escalation, or wants to run multiple AI agents on projects simultaneously. Handles installation, workspace setup, work tracking, agent lifecycle, crash recovery, and all gt/bd CLI operations.</description>
<location>project</location>
</skill>

<skill>
<name>internal-comms</name>
<description>A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.).</description>
<location>project</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).</description>
<location>project</location>
</skill>

<skill>
<name>orchestration</name>
<description>Multi-agent orchestration for complex tasks. Use when tasks require parallel work, multiple agents, or sophisticated coordination. Triggers include requests for features, reviews, refactoring, testing, documentation, or any work that benefits from decomposition into parallel subtasks. This skill defines how to orchestrate work using cc-mirror tasks for persistent dependency tracking and TodoWrite for real-time session visibility.</description>
<location>project</location>
</skill>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale.</description>
<location>project</location>
</skill>

<skill>
<name>pptx</name>
<description>"Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"</description>
<location>project</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.</description>
<location>project</location>
</skill>

<skill>
<name>slack-gif-creator</name>
<description>Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like "make me a GIF of X doing Y for Slack."</description>
<location>project</location>
</skill>

<skill>
<name>template</name>
<description>Replace with description of the skill and when Claude should use it.</description>
<location>project</location>
</skill>

<skill>
<name>theme-factory</name>
<description>Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly.</description>
<location>project</location>
</skill>

<skill>
<name>web-artifacts-builder</name>
<description>Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.</description>
<location>project</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.</description>
<location>project</location>
</skill>

<skill>
<name>xlsx</name>
<description>"Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. When Claude needs to work with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modify existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas"</description>
<location>project</location>
</skill>

<skill>
<name>zai-cli</name>
<description>|</description>
<location>project</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>

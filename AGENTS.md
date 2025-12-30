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
- **Tests**: No test runner. Verify manually via build or browser testing. No single test commands available.

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

## Additional Rules
- Always run `pnpm typecheck` and `pnpm build` after changes.
- For new features, create OpenSpec proposals if significant.
- Privacy-first: No server-side data transmission.

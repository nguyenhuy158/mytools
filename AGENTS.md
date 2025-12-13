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

# Build & Test
- **Build**: `npm run build` (Builds for production)
- **Type Check**: `npm run typecheck` (Runs TypeScript validation)
- **Dev Server**: `npm run dev` (Starts HMR server)
- **Tests**: No test runner configured. Verify changes manually or via `npm run build`.

# Code Style Guidelines
- **Stack**: React Router v7, Tailwind CSS v4, TypeScript.
- **Formatting**: 2 spaces indent, double quotes for strings, semicolons required.
- **Naming**: `PascalCase` for components/interfaces, `camelCase` for functions/variables.
- **Imports**: Standard ES imports. Use relative paths for internal files (e.g., `./Button`).
- **Styling**: **STRICTLY** use Tailwind CSS. No new CSS files. Mobile-first approach (`class="block md:flex"`).
- **Dark Mode**: Mandatory. Default: `bg-white text-gray-900` / `dark:bg-gray-950 dark:text-gray-100`.
- **Types**: Explicitly type props and event handlers (e.g., `React.MouseEvent`). Avoid `any`.
- **Localization**: Use `useTranslation` hook. Add keys to `public/locales/{en,vi}/translation.json`.

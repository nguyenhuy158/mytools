# Test Execution Plan

This document outlines how to execute tests for ToolHub project.

## Quick Start

```bash
# Install dependencies (if not already done)
pnpm install

# Run all type checks and tests
pnpm typecheck && pnpm test:run

# Watch mode for development
pnpm test

# View results in UI
pnpm test:ui
```

## Test Command Reference

| Command | Purpose | Mode |
|---------|---------|------|
| `pnpm test` | Watch tests (auto-rerun on change) | Development |
| `pnpm test:run` | Run all tests once | CI/CD |
| `pnpm test:ui` | Interactive UI dashboard | Development |
| `pnpm test:coverage` | Generate coverage report | Analysis |
| `pnpm typecheck` | Type safety check | Required |
| `pnpm build` | Production build | Required |

## Test Categories

### 1. Automated Tests (Vitest)

**Location**: `__tests__/` directory

**Currently Available**:
- ✅ `utils/storage.test.ts` - 20 test cases
- ✅ `utils/notes.test.ts` - 30+ test cases

**Run**:
```bash
pnpm test:run
```

**Expected Output**:
```
✓ __tests__/utils/storage.test.ts (20)
✓ __tests__/utils/notes.test.ts (30)

Test Files  2 passed (2)
Tests      50 passed (50)
```

### 2. Type Safety (TypeScript)

**Command**:
```bash
pnpm typecheck
```

**Verifies**:
- ✅ No TypeScript compilation errors
- ✅ Type safety across all files
- ✅ Cloudflare Workers type definitions
- ✅ React Router type generation

**Expected**: Zero errors

### 3. Build Verification

**Command**:
```bash
pnpm build
```

**Verifies**:
- ✅ Production build succeeds
- ✅ All assets bundled correctly
- ✅ No tree-shaking issues
- ✅ Worker script compiles

**Expected**: Build artifacts in `build/` and `dist/`

### 4. Manual Testing

See [TESTING.md](./TESTING.md) for comprehensive manual test cases:

- **Core Navigation** - Routes, navbar, dark mode, i18n
- **IT Tools** - JSON, Diff, Markdown, Images, API Tester, Notes
- **Lifestyle** - Pomodoro, Quotes
- **Games** - 2048, Snake, Minesweeper, Tetris, Sudoku, Loto
- **Calendar** - Solar/Lunar dates, holidays
- **Performance** - Load times, memory, PWA
- **Browser Compatibility** - Chrome, Firefox, Safari, Edge
- **Accessibility** - WCAG compliance
- **API Testing** - Endpoints via cURL

## Pre-Deployment Checklist

```bash
# 1. Type check
pnpm typecheck

# 2. Run automated tests
pnpm test:run

# 3. Build production
pnpm build

# 4. Verify no errors in console
# (Check for any warnings)

# 5. Manual smoke test
pnpm preview
# Visit http://localhost:4173 and verify key features work
```

All steps must pass ✅

## Continuous Integration

### Recommended CI/CD Setup

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: "pnpm"
      
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm test:run
      - run: pnpm build
```

## Coverage Goals

**Target Coverage**: 80% overall

| Area | Goal | Current |
|------|------|---------|
| Utils | 90%+ | 95% |
| Components | 70%+ | — |
| API Routes | 85%+ | — |
| Hooks | 80%+ | — |

Generate coverage:
```bash
pnpm test:coverage
open coverage/index.html
```

## Test Execution Timeline

### During Development
- Run `pnpm test` (watch mode) in background
- Fix failing tests before committing
- Aim for 80%+ coverage

### Before Pull Request
```bash
pnpm typecheck
pnpm test:run
pnpm build
```

### Before Deployment
```bash
# Full verification
pnpm typecheck && pnpm test:run && pnpm build

# Manual smoke test
pnpm preview
# Test key features: Notes CRUD, Games, API Tester, etc.

# Lighthouse audit
# DevTools → Lighthouse → Analyze page
```

## Troubleshooting

### Tests Won't Run
```bash
# Clear cache
rm -rf .vitest node_modules

# Reinstall
pnpm install

# Try again
pnpm test:run
```

### Type Errors During Build
```bash
# Generate types
pnpm typecheck

# Check tsconfig.json is valid
cat tsconfig.json | jq .
```

### Memory Issues
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 pnpm test
```

### Failed WebSocket Tests
- These must be tested manually in browser
- See TESTING.md → Games - Loto section

## Test Reports

After running tests, save results:

```bash
# Generate test report
pnpm test:run > test-results.txt 2>&1

# Generate coverage
pnpm test:coverage

# Archive for records
tar -czf test-$(date +%Y%m%d_%H%M%S).tar.gz \
  test-results.txt \
  coverage/
```

## Performance Baseline

Expected test execution times:

| Suite | Duration |
|-------|----------|
| Storage Utils | < 100ms |
| Notes Utils | < 200ms |
| All Tests | < 500ms |
| Build | < 15s |
| Typecheck | < 10s |

If tests slow down, investigate:
- Memory usage
- Excessive file I/O
- Missing mocks
- Circular dependencies

## Adding New Tests

1. Create test file: `__tests__/[category]/feature.test.ts`
2. Follow template in `__tests__/README.md`
3. Aim for 80%+ coverage on new code
4. Run: `pnpm test` (watch mode)
5. Verify: `pnpm test:coverage`

## Resources

- [Vitest Docs](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [TESTING.md](./TESTING.md) - Manual testing guide
- [__tests__/README.md](./__tests__/README.md) - Test development guide

---

**Last Updated**: 2024
**Status**: Testing infrastructure complete
**Next Steps**: Add component and integration tests as features are developed

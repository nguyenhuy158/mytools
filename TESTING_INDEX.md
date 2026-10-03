# ToolHub Testing Index

Complete testing documentation for ToolHub project.

## 📚 Testing Documentation Files

### 1. **[TESTING.md](./TESTING.md)** - Manual Testing Guide
   - **Length**: 450+ lines
   - **Purpose**: Comprehensive manual testing procedures
   - **Contains**:
     - 25+ feature test categories
     - Step-by-step test instructions
     - Test data & expected results
     - Browser & performance testing
     - Accessibility & API testing
     - Debugging tips & pre-release checklist
   - **When to Use**: During development, before deployment, QA testing

### 2. **[TEST_EXECUTION.md](./TEST_EXECUTION.md)** - Test Execution Guide
   - **Length**: 250+ lines
   - **Purpose**: How to run tests and CI/CD setup
   - **Contains**:
     - Quick start commands
     - Test command reference
     - Pre-deployment checklist
     - CI/CD pipeline setup
     - Coverage goals & timeline
     - Troubleshooting guide
   - **When to Use**: Running tests, setting up CI/CD, debugging test issues

### 3. **[__tests__/README.md](./__tests__/README.md)** - Test Development Guide
   - **Length**: 300+ lines
   - **Purpose**: Writing and maintaining tests
   - **Contains**:
     - Test structure & organization
     - Test file naming conventions
     - Writing templates & best practices
     - Common assertions reference
     - Component & API testing examples
     - Coverage requirements
   - **When to Use**: Writing new tests, expanding test suite

---

## 🗂️ Test Files Structure

```
__tests__/
├── README.md                    # Test development guide
├── utils/
│   ├── storage.test.ts          # 20 test cases
│   └── notes.test.ts            # 30+ test cases
├── components/                  # (Future)
│   └── [component].test.tsx
└── routes/                      # (Future)
    └── [route].test.ts
```

---

## ⚡ Quick Start

### Run Tests
```bash
pnpm test              # Watch mode (development)
pnpm test:run          # Run once (CI/CD)
pnpm test:ui           # Interactive dashboard
pnpm test:coverage     # Coverage report
```

### Type & Build Check
```bash
pnpm check         # TypeScript validation
pnpm build             # Production build
pnpm preview           # Manual testing
```

### Pre-Deployment
```bash
# All-in-one verification
pnpm check && pnpm test:run && pnpm build && pnpm preview
```

---

## 📊 Test Coverage

| Module | Tests | Coverage | Status |
|--------|-------|----------|--------|
| `utils/storage.ts` | 20 | ~100% | ✅ |
| `utils/notes.ts` | 30+ | ~95% | ✅ |
| React Components | — | — | 📋 |
| API Routes | — | — | 📋 |
| Game Logic | — | — | 📋 |

---

## 🎯 Testing by Feature

### Automated Tests (Vitest)
✅ **Ready to Run**:
- Storage utility functions
- Notes utility functions (parsing, creation, conversion)

📋 **Needs Development**:
- React components (Pomodoro, etc.)
- API endpoints (Notes)

### Manual Tests
✅ **Procedures Available** (See TESTING.md):
- Navigation & routing
- JSON tools
- Text diff
- Markdown preview
- Image tools
- API tester
- Pomodoro timer
- Games redirect to games.huyab.click
- Calendar
- Dark mode & i18n
- Performance & browser compatibility

---

## 📝 Test Checklist

### Before Each Commit
- [ ] Run `pnpm test:run` - All tests pass
- [ ] Run `pnpm check` - No type errors
- [ ] Manually test affected features

### Before Pull Request
- [ ] All automated tests pass
- [ ] TypeScript clean
- [ ] Build succeeds
- [ ] Manual smoke test of key features
- [ ] No console errors
- [ ] Code coverage maintained/improved

### Before Deployment
- [ ] All tests pass on CI/CD
- [ ] Production build verified
- [ ] Lighthouse audit > 90
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Mobile tested (375px, 768px)
- [ ] Performance baseline met

---

## 🔧 Configuration Files

### `vitest.config.ts`
- Vitest configuration
- Test environment setup
- Path aliases
- Coverage settings

### `vitest.setup.ts`
- Global test setup
- localStorage mock
- matchMedia mock
- Testing Library configuration

### `package.json` Scripts
```json
{
  "test": "vitest",              // Watch mode
  "test:ui": "vitest --ui",      // UI dashboard
  "test:run": "vitest run",      // Run once
  "test:coverage": "vitest run --coverage"  // Coverage
}
```

---

## 📚 Testing Resources

### Documentation
- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Jest Matchers Reference](https://vitest.dev/api/expect.html)

### This Project
- [TESTING.md](./TESTING.md) - Manual test procedures
- [TEST_EXECUTION.md](./TEST_EXECUTION.md) - How to run tests
- [__tests__/README.md](./__tests__/README.md) - Writing tests
- [Package.json](./package.json) - Test scripts

---

## 🚀 Development Workflow

### 1. During Development
```bash
# Terminal 1: Dev server
pnpm dev

# Terminal 2: Watch tests
pnpm test
```

### 2. Before Commit
```bash
pnpm check
pnpm test:run
# Verify code quality
```

### 3. Before Deployment
```bash
# Full verification
pnpm check && pnpm test:run && pnpm build
pnpm preview
# Manual smoke test in browser
```

---

## 🎓 Learning Path

1. **Start Here**: [TEST_EXECUTION.md](./TEST_EXECUTION.md) - Quick start
2. **Manual Testing**: [TESTING.md](./TESTING.md) - Test all features
3. **Writing Tests**: [__tests__/README.md](./__tests__/README.md) - Add new tests
4. **Advanced**: Vitest & Testing Library docs

---

## 📞 Common Questions

### Q: How do I run just one test file?
```bash
pnpm test utils/storage.test.ts
```

### Q: How do I run tests in CI/CD?
```bash
pnpm test:run
```

### Q: How do I check code coverage?
```bash
pnpm test:coverage
open coverage/index.html
```

### Q: How do I debug a failing test?
```bash
pnpm test utils/storage.test.ts --reporter=verbose
```

### Q: Where do I add new tests?
Create in `__tests__/[category]/feature.test.ts` following the template in `__tests__/README.md`

---

## 📈 Testing Metrics

- **Total Test Cases**: 50+
- **Automated Coverage**: ~95% (on tested modules)
- **Target Coverage**: 80% overall
- **Test Execution Time**: < 500ms
- **Manual Test Categories**: 25+

---

## ✅ Status

- ✅ Manual testing documentation complete
- ✅ Automated test framework setup
- ✅ Example unit tests provided
- ✅ CI/CD guidelines documented
- 📋 Component tests (to be added)
- 📋 API endpoint tests (to be added)
- 📋 Integration tests (to be added)

---

## 📞 Support

For questions about testing:
1. Check relevant documentation above
2. Review example tests in `__tests__/utils/`
3. Check test output with `pnpm test:ui`
4. Consult Vitest/Testing Library docs

---

**Last Updated**: February 2, 2024
**Maintained by**: ToolHub Team
**Status**: Complete & Ready for Use

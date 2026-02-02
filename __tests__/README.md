# ToolHub Test Suite

This directory contains automated tests for ToolHub utilities and components.

## Structure

```
__tests__/
├── utils/              # Utility function tests
│   ├── storage.test.ts
│   └── notes.test.ts
├── components/         # React component tests (future)
└── README.md
```

## Running Tests

### Watch Mode (Development)
```bash
pnpm test
```

### Run Once (CI/CD)
```bash
pnpm test:run
```

### UI Dashboard
```bash
pnpm test:ui
```

### Coverage Report
```bash
pnpm test:coverage
```

## Test Coverage

| Module | Status | Coverage |
|--------|--------|----------|
| `utils/storage.ts` | ✅ | ~100% |
| `utils/notes.ts` | ✅ | ~95% |
| React Components | 📋 | Pending |
| API Endpoints | 📋 | Pending |
| Game Logic | 📋 | Pending |

## Writing New Tests

### File Naming
- Test files should match source files: `file.ts` → `file.test.ts`
- Place in `__tests__/` with same directory structure

### Basic Template
```typescript
import { describe, it, expect } from "vitest";
import { functionToTest } from "~/utils/example";

describe("Example Utils", () => {
  it("should do something", () => {
    const result = functionToTest("input");
    expect(result).toBe("expected");
  });

  it("should handle edge case", () => {
    const result = functionToTest(null);
    expect(result).toBe(fallback);
  });
});
```

### Best Practices

1. **Descriptive Names**: Use clear test names that explain what they test
   ```typescript
   // ✅ Good
   it("should return fallback when JSON is invalid", () => {})
   
   // ❌ Bad
   it("tests parsing", () => {})
   ```

2. **Arrange-Act-Assert (AAA)**
   ```typescript
   it("should convert HTML to markdown", () => {
     // Arrange
     const html = "<h1>Title</h1>";
     
     // Act
     const result = htmlToMarkdown(html);
     
     // Assert
     expect(result).toContain("# Title");
   });
   ```

3. **Test Edge Cases**
   ```typescript
   describe("parsing", () => {
     it("handles valid input", () => {});
     it("handles null input", () => {});
     it("handles empty string", () => {});
     it("handles malformed data", () => {});
   });
   ```

4. **Keep Tests Independent**
   - No test should depend on another test
   - Use `beforeEach`/`afterEach` for setup/cleanup

5. **Mock External Dependencies**
   ```typescript
   import { vi } from "vitest";
   
   it("should call API", () => {
     const mockFetch = vi.fn();
     // ...test...
   });
   ```

## Testing Components (Future)

When adding component tests, use React Testing Library:

```typescript
import { render, screen } from "@testing-library/react";
import { MyComponent } from "~/components/MyComponent";

describe("MyComponent", () => {
  it("should render with title", () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

## Testing API Routes (Future)

For API route testing:

```typescript
import { describe, it, expect } from "vitest";

describe("POST /api/notes", () => {
  it("should create a note", async () => {
    const response = await fetch("/api/notes", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
    });
    expect(response.status).toBe(201);
  });
});
```

## Common Assertions

```typescript
// Equality
expect(value).toBe(expected);           // Strict equality
expect(value).toEqual(expected);        // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Strings
expect(string).toContain("substring");
expect(string).toMatch(/regex/);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty("key");
expect(object).toMatchObject({ key: "value" });

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(Error);

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

## Debugging Tests

### Show Console Output
```typescript
it("should log", () => {
  console.log("Debug info:", data);
  // ...
});
```

### Run Single Test
```bash
# In test file, use `.only`
it.only("should test this", () => {});

pnpm test
```

### Skip Test
```typescript
// Temporarily skip
it.skip("should skip this", () => {});

// Or use `describe.skip()`
describe.skip("Database tests", () => {});
```

### Verbose Output
```bash
pnpm test -- --reporter=verbose
```

## Coverage Requirements

- **Target**: 80% overall coverage
- **Critical Paths**: 100% (auth, data handling)
- **UI Components**: 70%+ (interaction-heavy)

View coverage report:
```bash
pnpm test:coverage
# Opens coverage report in ./coverage/index.html
```

## Continuous Integration

Tests run automatically on:
- Pre-commit (via Git hooks - setup in CI/CD config)
- Push to feature branches
- Pull requests
- Before production deployment

```bash
# Local pre-commit check
pnpm typecheck && pnpm test:run && pnpm build
```

## Troubleshooting

### Tests Not Running
```bash
# Clear cache
rm -rf .vitest

# Reinstall dependencies
pnpm install

# Try again
pnpm test:run
```

### Import Errors
- Ensure `vitest.config.ts` has correct `alias` paths
- Use `~/` for app imports (aliased to `./app`)

### Environment Issues
- Tests run in `happy-dom` environment (see `vitest.setup.ts`)
- localStorage is mocked
- matchMedia is mocked for media queries

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Jest Matchers](https://vitest.dev/api/expect.html)

---

**Last Updated**: 2024
**Maintained by**: ToolHub Team

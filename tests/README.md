# Testing Philosophy

**Comprehensive testing for production-grade desktop apps**

---

## Overview

This project implements **three layers of testing**:

1. **TypeScript Unit Tests** (`bun test`) - Fast, isolated tests
2. **Rust Unit Tests** (`cargo test`) - Backend logic verification
3. **E2E Tests** (Tauri WebDriver) - Full application flow

Each layer serves a specific purpose and catches different types of bugs.

---

## Testing Pyramid

```
        ┌─────────────┐
        │   E2E (few) │  Full application flow
        ├─────────────┤
        │ Integration │  Module boundaries
        ├─────────────┤
        │ Unit (many) │  Individual functions
        └─────────────┘
```

### Why This Structure?

- **Unit tests** are fast and catch logic errors early
- **Integration tests** verify modules work together
- **E2E tests** ensure the entire system works from a user's perspective

More unit tests, fewer E2E tests = faster CI, better developer experience.

---

## TypeScript Tests

### Location

- `tests/unit/*.test.ts` - Unit tests
- `tests/e2e/*.test.ts` - End-to-end tests

### Running Tests

```bash
# Run all TypeScript tests
bun test

# Run specific test file
bun test tests/unit/db.test.ts

# Watch mode
bun test --watch
```

### What to Test

✅ **Do test:**
- Data transformations
- Business logic
- Type correctness
- Schema definitions
- Error handling

❌ **Don't test:**
- Framework internals (React, Drizzle)
- Third-party libraries
- UI styles (use visual regression instead)

### Example

```ts
import { describe, test, expect } from "bun:test";
import { todos } from "@tauri-starter/db/schema";

describe("Todos schema", () => {
  test("should have required fields", () => {
    expect(todos.id).toBeDefined();
    expect(todos.title).toBeDefined();
  });
});
```

---

## Rust Tests

### Location

- `apps/desktop/src-tauri/src/**/*.rs` - Inline tests using `#[cfg(test)]`

### Running Tests

```bash
# Run all Rust tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml

# Run specific module tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml db::tests

# With output
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml -- --nocapture
```

### What to Test

✅ **Do test:**
- Database initialization
- SQL query execution
- Error handling
- Migration logic
- IPC command handlers

❌ **Don't test:**
- Tauri framework internals
- Operating system behavior
- SQLite implementation

### Example

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_initialization() {
        // Test logic here
        assert!(true);
    }

    #[test]
    fn test_query_execution() {
        // Test query handling
        assert!(true);
    }
}
```

---

## End-to-End Tests

### Overview

E2E tests verify the **entire application** from a user's perspective:

1. Launch the app
2. Interact with the UI (click, type, etc.)
3. Verify database state
4. Check persistence across restarts

### Technology

Uses **Tauri WebDriver** (based on Selenium):

```ts
import { initDriver } from "@tauri-apps/webdriver";

const driver = await initDriver();
await driver.findElement("input[type='text']").sendKeys("New todo");
await driver.findElement("button").click();
```

### Running E2E Tests

```bash
# Build the app first
bun run tauri:build

# Run E2E tests
bun test tests/e2e/
```

### What to Test

Focus on **critical user flows**:

1. ✅ Add a todo
2. ✅ Toggle completion
3. ✅ Delete a todo
4. ✅ Persistence across restarts
5. ✅ Error handling (network issues, etc.)

### Performance

E2E tests are **slow** (seconds per test). Keep them:

- **Minimal** (5-10 critical flows)
- **Focused** (one flow per test)
- **Stable** (avoid flaky selectors)

---

## Testing Best Practices

### 1. Test Behavior, Not Implementation

❌ **Don't:**
```ts
test("should call setState with correct args", () => {
  const mock = jest.fn();
  // Testing internal implementation
});
```

✅ **Do:**
```ts
test("should display added todo", () => {
  // Add todo
  // Verify it appears in the list
});
```

### 2. Use Descriptive Test Names

❌ **Don't:**
```ts
test("works", () => { ... });
```

✅ **Do:**
```ts
test("should persist todos after app restart", () => { ... });
```

### 3. Arrange-Act-Assert Pattern

```ts
test("should toggle todo completion", () => {
  // Arrange: Set up test data
  const todo = { id: "1", title: "Test", completed: false };

  // Act: Perform action
  const updated = toggleTodo(todo);

  // Assert: Verify result
  expect(updated.completed).toBe(true);
});
```

### 4. Mock External Dependencies

For unit tests, mock:
- Database calls
- Network requests
- Tauri IPC
- File system access

```ts
import { mock } from "bun:test";

const mockDb = mock(() => Promise.resolve([]));
```

### 5. Keep Tests Independent

Each test should:
- Set up its own data
- Clean up after itself
- Not depend on other tests

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      # TypeScript tests
      - run: bun install
      - run: bun test

      # Rust tests
      - run: cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml

      # E2E tests (on main branch only)
      - if: github.ref == 'refs/heads/main'
        run: |
          bun run tauri:build
          bun test tests/e2e/
```

---

## Test Coverage

### Measuring Coverage

```bash
# TypeScript coverage (bun has built-in coverage)
bun test --coverage

# Rust coverage (requires tarpaulin)
cargo install cargo-tarpaulin
cargo tarpaulin --manifest-path apps/desktop/src-tauri/Cargo.toml
```

### Coverage Goals

Don't obsess over 100% coverage. Instead:

- **Critical paths:** 100% (auth, payments, data loss scenarios)
- **Business logic:** 80-90%
- **UI components:** 60-70%
- **Utilities:** 90%+

**Quality over quantity.** A few good tests > many bad tests.

---

## Common Pitfalls

### 1. Testing Framework Code

❌ **Don't test React, Drizzle, or Tauri:**

```ts
test("React renders components", () => {
  // This tests React, not your code
});
```

✅ **Test your business logic:**

```ts
test("should calculate total correctly", () => {
  // This tests YOUR code
});
```

### 2. Flaky Tests

**Symptoms:**
- Tests pass/fail randomly
- Work locally, fail in CI

**Causes:**
- Race conditions
- Hardcoded waits
- Shared state

**Solutions:**
- Use proper waits (waitForElement)
- Reset state between tests
- Avoid global variables

### 3. Slow Test Suites

**If tests take > 10 seconds:**

1. Move integration tests to separate suite
2. Mock expensive operations
3. Use test databases (in-memory SQLite)
4. Parallelize tests

---

## Debugging Tests

### TypeScript

```bash
# Run with verbose output
bun test --verbose

# Run single test
bun test -t "should add todo"

# Debug with inspector
bun test --inspect
```

### Rust

```bash
# Show println! output
cargo test -- --nocapture

# Run single test
cargo test test_name

# Show backtrace on failure
RUST_BACKTRACE=1 cargo test
```

---

## Testing Tauri-Specific Features

### IPC Commands

Test Tauri commands in isolation:

```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        assert_eq!(greet("World"), "Hello, World!");
    }
}
```

### Database Operations

Use in-memory SQLite for tests:

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_db_operations() {
        // Create in-memory database
        let conn = Connection::open_in_memory().unwrap();
        
        // Run tests
        // ...
    }
}
```

---

## Resources

### Official Docs

- [Tauri Testing Guide](https://v2.tauri.app/develop/tests/)
- [Bun Test Runner](https://bun.sh/docs/cli/test)
- [Rust Testing](https://doc.rust-lang.org/book/ch11-00-testing.html)

### Tools

- [Bun Test](https://bun.sh/docs/cli/test) - Fast TypeScript test runner
- [Cargo Test](https://doc.rust-lang.org/cargo/commands/cargo-test.html) - Rust test runner
- [Tauri WebDriver](https://github.com/tauri-apps/tauri/tree/dev/tooling/webdriver) - E2E testing

### Best Practices

- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

## Future Improvements

This starter includes basic tests. Consider adding:

- **Visual regression tests** (Percy, Chromatic)
- **Performance tests** (Lighthouse, bundle size)
- **Accessibility tests** (axe-core)
- **Security tests** (dependency scanning)

The current architecture supports all of these without major changes.

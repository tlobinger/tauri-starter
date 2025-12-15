# Testing

Keep it simple: unit tests for fast feedback, (optional) E2E tests for critical flows.

### Run tests

```bash
# TypeScript tests (Bun)
bun test

# Rust tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

### Where tests live
- `tests/unit/`: TypeScript unit tests
- `tests/e2e/`: E2E tests (currently a template)

### E2E (optional)
If you wire up Tauri WebDriver, keep E2E to a few “must work” flows:
- add todo
- toggle todo
- delete todo
- persistence across restart

Reference: `https://v2.tauri.app/develop/tests/`

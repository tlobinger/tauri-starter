# Contributing to Tauri + Next.js Starter

Thank you for your interest in contributing! This document provides guidelines and instructions.

---

## Code of Conduct

Be respectful, inclusive, and professional. We're all here to learn and build together.

---

## How to Contribute

### 1. Reporting Issues

Found a bug or have a feature request?

1. Check if an issue already exists
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs. actual behavior
   - Your environment (OS, Bun version, Rust version)

### 2. Submitting Pull Requests

**Before starting:**

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Check existing issues/PRs to avoid duplicate work

**Development workflow:**

```bash
# Install dependencies
bun install

# Run development server
bun run tauri:dev

# Run tests
bun test
bun run test:rust

# Lint and format
bun run lint:fix
bun run format
```

**Before submitting:**

1. ✅ All tests pass
2. ✅ Code is formatted (Biome)
3. ✅ No linting errors
4. ✅ Documentation updated (if needed)
5. ✅ Commit messages are clear

**Submit PR:**

1. Push to your fork
2. Create pull request to `main`
3. Fill out PR template
4. Wait for review

---

## Development Guidelines

### TypeScript

- Use strict TypeScript (`strict: true`)
- Prefer explicit types over `any`
- Use meaningful variable names
- Write tests for new features

### Rust

- Follow Rust conventions (rustfmt)
- Add tests for new commands
- Document public APIs
- Handle errors explicitly

### Git Commits

Use conventional commits:

```
feat: add new feature
fix: resolve bug
docs: update documentation
test: add tests
refactor: improve code structure
chore: update dependencies
```

### Documentation

- Update READMEs when changing architecture
- Add inline comments for complex logic
- Keep examples up to date
- Explain *why*, not just *what*

---

## Testing

### TypeScript Tests

```bash
# Run all tests
bun test

# Run specific test
bun test tests/unit/db.test.ts

# Watch mode
bun test --watch
```

### Rust Tests

```bash
# Run all tests
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml

# With output
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml -- --nocapture
```

### E2E Tests

```bash
# Build app first
bun run tauri:build

# Run E2E tests
bun test tests/e2e/
```

---

## Project Structure

```
tauri-starter/
├── apps/desktop/       # Main application
├── packages/db/        # Database package
├── tests/              # Test files
├── docs/               # Documentation
└── .github/            # CI/CD workflows
```

See [README.md](README.md) for detailed structure.

---

## Review Process

1. **Automated checks** - CI runs tests and linting
2. **Code review** - Maintainer reviews code
3. **Feedback** - Address review comments
4. **Approval** - Once approved, PR is merged

Typical turnaround: 1-3 days.

---

## Release Process

(For maintainers)

1. Update version in `package.json` and `Cargo.toml`
2. Update CHANGELOG.md
3. Create git tag (`v1.0.0`)
4. Push tag to trigger release workflow
5. GitHub Actions builds and publishes release

---

## Questions?

- Open a [Discussion](https://github.com/yourusername/tauri-starter/discussions)
- Join [Tauri Discord](https://discord.gg/tauri)
- Check [Documentation](README.md)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**

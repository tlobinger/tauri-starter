# Quick Start Guide

**Get up and running in 5 minutes**

---

## Prerequisites

Install these tools:

- **[Bun](https://bun.sh/)** (>= 1.1.0) - `curl -fsSL https://bun.sh/install | bash`
- **[Rust](https://rustup.rs/)** (latest stable) - `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **System dependencies** - See [Desktop App Guide](apps/desktop/README.md#prerequisites) for platform-specific setup

---

## Install & Run

```bash
# Clone the repository
git clone <your-repo-url>
cd tauri-starter

# Install dependencies
bun install

# Run the app
bun run tauri:dev
```

**That's it!** You should see a working Todo app.

---

## Build for Production

```bash
bun run tauri:build
```

Find your app in `apps/desktop/src-tauri/target/release/bundle/`.

---

## Next Steps

1. **Read the documentation:**
   - [README.md](README.md) - Complete project overview
   - [Desktop App Guide](apps/desktop/README.md) - Development details
   - [Database Guide](packages/db/README.md) - Database architecture
   - [Architecture Blueprint](docs/STARTER_BLUEPRINT.md) - Deep dive into design decisions

2. **Customize:**
   - Edit `apps/desktop/app/page.tsx` for UI changes
   - Edit `packages/db/schema/todos.ts` for database schema
   - Run `bun run db:generate` after schema changes

3. **Common commands:**
   ```bash
   bun run tauri:dev      # Development
   bun run tauri:build   # Production build
   bun run db:generate   # Generate migrations
   bun test              # Run tests
   bun run lint          # Check code quality
   ```

---

## Troubleshooting

**App won't start?**
- Verify Rust: `rustc --version`
- Verify Bun: `bun --version`
- Try: `rm -rf node_modules && bun install`

**More help:**
- [Full README](README.md)
- [Desktop App Guide](apps/desktop/README.md)
- [Tauri Discord](https://discord.gg/tauri)

---

**Ready to build your desktop app?** See [README.md](README.md) for complete documentation.

# Tauri + Next.js 16 Starter

**A production-grade, local-first desktop app foundation**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-v2-blue)](https://v2.tauri.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## What Is This?

This is **the canonical starter project** for building serious desktop applications with:

- **Tauri v2** - Lightweight, secure desktop app framework
- **Next.js 16** - Modern React framework (App Router, static export)
- **SQLite** - Local-first database
- **Drizzle ORM** - Type-safe database queries
- **Bun** - Fast JavaScript runtime and package manager
- **Biome** - Fast, unified linting and formatting

This starter serves **two roles**:

1. **Zero-friction starting point** - Clone → install → run → working app
2. **Executable how-to guide** - Every decision documented, working example included

---

## Why This Stack?

### Desktop-First

- ✅ **No Node.js server** at runtime
- ✅ **Native performance** via Rust backend
- ✅ **Small bundle size** (~3-5 MB)
- ✅ **Cross-platform** (macOS, Windows, Linux)
- ❌ Not Electron (no Chromium bloat)

### Local-First

- ✅ **Works offline** (no network required)
- ✅ **Fast** (local SQLite database)
- ✅ **Private** (data stays on user's device)
- ✅ **Sync-ready** (designed for future sync features)

### Production-Grade

- ✅ **Type-safe** (TypeScript + Rust)
- ✅ **Tested** (Unit + Integration + E2E)
- ✅ **Documented** (Every major decision explained)
- ✅ **Maintainable** (Clear architecture, no magic)

---

## Quick Start

### Prerequisites

Install these tools:

- [Bun](https://bun.sh/) (>= 1.0.0)
- [Rust](https://rustup.rs/) (latest stable)
- System dependencies (see [Installation Guide](apps/desktop/README.md#prerequisites))

### Install & Run

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

### What’s in the starter (quick map)
- **UI**: `apps/desktop/app/*` + `apps/desktop/src/components/*`
- **DB client + migrations**: `apps/desktop/src/lib/db.ts` + `packages/db/*`
- **State**: `packages/store/*` + `apps/desktop/src/stores/*`
- **IPC helper**: `apps/desktop/src/lib/ipc.ts`
- **Errors**: `apps/desktop/app/error.tsx` + `apps/desktop/src/components/ErrorBoundary.tsx`

### Build for Production

```bash
bun run tauri:build
```

Find your distributable in `apps/desktop/src-tauri/target/release/bundle/`.

---

## What's Included?

### Working To-Do App

This starter includes a **complete, production-ready To-Do application** demonstrating:

- ✅ Create, read, update, delete operations
- ✅ SQLite persistence
- ✅ Database migrations
- ✅ Tauri IPC bridge
- ✅ Type-safe queries (Drizzle ORM)
- ✅ Error handling
- ✅ Tests (TypeScript + Rust)

**This isn't a toy.** It's proof the stack works end-to-end.

### Architecture

```
┌──────────────────────────┐
│        Next.js 16        │  React UI (static export)
│   (Static Export UI)     │  
└─────────────┬────────────┘
              │ Tauri IPC
┌─────────────▼────────────┐
│        Tauri v2          │  Rust backend
│      (Rust Backend)      │  
└─────────────┬────────────┘
              │
┌─────────────▼────────────┐
│         SQLite           │  Local database
│     (Local Database)     │  
└──────────────────────────┘
```

**Key Insight:** Next.js doesn't run a server. Tauri provides the backend.

---

## Project Structure

```
tauri-starter/
├── apps/
│   └── desktop/              # Main desktop app
│       ├── app/              # Next.js pages (App Router)
│       ├── src/              # Components & utilities
│       ├── src-tauri/        # Rust backend
│       └── README.md         # Desktop app guide
│
├── packages/
│   └── db/                   # Database package
│       ├── schema/           # Drizzle schema definitions
│       ├── migrations/       # Generated SQL migrations
│       └── README.md         # Database architecture
│
│   └── store/                # State management (Zustand)
│       └── src/              # Reusable store factory + minimal app store
│
├── tests/
│   ├── unit/                 # TypeScript unit tests
│   ├── e2e/                  # End-to-end tests
│   └── README.md             # Testing philosophy
│
├── docs/
│   └── STARTER_BLUEPRINT.md  # Extended architecture notes
│
├── biome.json                # Linting & formatting config
├── package.json              # Root dependencies
└── README.md                 # This file
```

---

## Technology Decisions

### Why Tauri v2?

- **Lightweight:** ~3-5 MB binaries (vs. Electron's 100+ MB)
- **Secure:** Rust backend, sandboxed frontend
- **Fast:** Native performance, instant startup
- **Modern:** Active development, great docs

### Why Next.js 16?

- **App Router:** Modern routing with layouts
- **Static Export:** No server required (perfect for desktop)
- **React 19:** Latest React features
- **Developer Experience:** Hot reload, TypeScript, fast builds

### Why SQLite?

- **Local-first:** No network required
- **Reliable:** Battle-tested, used by millions
- **Fast:** In-process, no network latency
- **Portable:** Single file, easy to backup

### Why Drizzle ORM?

- **Type-safe:** Full TypeScript inference
- **Lightweight:** Minimal runtime overhead
- **SQL-like:** Write SQL, get TypeScript types
- **Migration-friendly:** Auto-generate migrations

### Why Bun?

- **Fast:** 3-4x faster than npm/yarn
- **All-in-one:** Package manager + test runner + bundler
- **TypeScript:** Native TypeScript support
- **Compatible:** Works with npm packages

### Why Biome?

- **Fast:** 10-100x faster than ESLint + Prettier
- **Unified:** Linting + formatting in one tool
- **Strict:** Catches more errors than ESLint
- **Zero-config:** Works out of the box

---

## Core Principles

This starter follows strict principles:

### 1. Desktop-First

**No server-side features.** Next.js runs in static export mode:

- ❌ No API routes
- ❌ No server actions
- ❌ No SSR
- ✅ All backend logic in Tauri (Rust)

### 2. Local-First

**SQLite is the primary data store:**

- Database file in app data directory (not repo)
- Initialized automatically on first run
- Persists across app restarts
- Designed for future sync capabilities

### 3. Explicit Architecture

**No magic. Every layer has a clear responsibility:**

- **Frontend:** UI + user interaction (React)
- **IPC Bridge:** Communication layer (Tauri invoke)
- **Backend:** Database + business logic (Rust)
- **Data:** Schema + migrations (Drizzle)

### 4. Production Realism

**Not just a demo:**

- ✅ Migrations (not just schema)
- ✅ Tests (unit + integration + E2E)
- ✅ Error handling (not happy-path only)
- ✅ Documentation (not just code comments)

### 5. Future-Ready

**Designed for growth:**

- Stable IDs (UUIDs, not auto-increment)
- Timestamps (createdAt, updatedAt)
- Deterministic migrations
- Sync-ready data model

---

## Development Workflow

### Daily Development

```bash
# Run dev server (hot reload enabled)
bun run tauri:dev
```

Changes auto-reload in both frontend and backend.

### Database Changes

```bash
# 1. Edit schema in packages/db/schema/
# 2. Generate migration
bun run db:generate

# 3. Migration auto-applies on next app start
```

### Testing

```bash
# TypeScript tests
bun test

# Rust tests
bun run test:rust

# E2E tests
bun test tests/e2e/
```

### Linting & Formatting

```bash
# Check code
bun run lint

# Fix issues
bun run lint:fix

# Format code
bun run format
```

---

## Building & Distribution

### Development Build

```bash
bun run tauri:build
```

### Production Build

```bash
# macOS
bun run tauri:build -- --target universal-apple-darwin

# Windows
bun run tauri:build -- --target x86_64-pc-windows-msvc

# Linux
bun run tauri:build -- --target x86_64-unknown-linux-gnu
```

### Code Signing

**macOS:**
```bash
codesign --sign "Developer ID" app.app
```

**Windows:**
```powershell
signtool sign /f certificate.pfx app.exe
```

See [Tauri Distribution Guide](https://v2.tauri.app/distribute/) for details.

---

## Documentation

This project is heavily documented:

- **[Desktop App Guide](apps/desktop/README.md)** - Architecture, development, deployment
- **[Database Guide](packages/db/README.md)** - Schema, migrations, best practices
- **[Testing Guide](tests/README.md)** - Testing philosophy, how to test
- **[Starter Blueprint](docs/STARTER_BLUEPRINT.md)** - Extended architecture notes

**Read these before building your app.** They'll save you hours of debugging.

---

## Extending This Starter

### Add a New Page

1. Create `apps/desktop/app/settings/page.tsx`
2. Link to it from existing pages
3. That's it (no routing config needed)

### Add a New Database Table

1. Define schema in `packages/db/schema/`
2. Run `bun run db:generate`
3. Migration auto-applies on next run

### Add a New Tauri Command

1. Define in `apps/desktop/src-tauri/src/`
2. Register in `invoke_handler`
3. Call from frontend via `invoke()`

See individual READMEs for detailed guides.

---

## Common Pitfalls

### 1. Using Server-Side Features

❌ **Don't:**
```tsx
// This won't work (no server in static export)
export async function getServerSideProps() { ... }
```

✅ **Do:**
```tsx
// Use client-side data fetching
useEffect(() => {
  loadData();
}, []);
```

### 2. Direct Database Access

❌ **Don't:**
```ts
// Can't access SQLite directly from frontend
import Database from "better-sqlite3";
```

✅ **Do:**
```ts
// Use Drizzle + Tauri adapter
import { db } from "@/lib/db";
```

### 3. Forgetting Migrations

❌ **Don't:**
```sql
-- Don't write SQL directly
CREATE TABLE users (...);
```

✅ **Do:**
```ts
// Define in Drizzle schema
export const users = sqliteTable("users", { ... });
// Then: bun run db:generate
```

---

## Troubleshooting

### App won't start

1. Check prerequisites installed (Rust, Bun)
2. Run `bun install` from root
3. Check console for errors

### Database errors

1. Ensure `initializeDatabase()` called before queries
2. Check migrations applied (see logs)
3. Verify Tauri SQL plugin configured

### Build fails

1. Check system dependencies installed
2. Run `cargo clean` and retry
3. Check Tauri logs in `apps/desktop/src-tauri/target/`

### More help

- [Tauri Discord](https://discord.gg/tauri)
- [GitHub Issues](https://github.com/yourusername/tauri-starter/issues)
- [Troubleshooting Guide](apps/desktop/README.md#common-issues)

---

## Testing

This starter includes comprehensive tests:

- **Unit Tests** (TypeScript) - Test business logic
- **Unit Tests** (Rust) - Test backend functions
- **E2E Tests** (WebDriver) - Test full user flows

See [Testing Guide](tests/README.md) for details.

---

## Performance

### Metrics

- **Bundle size:** ~3-5 MB (vs. Electron's 100+ MB)
- **Startup time:** ~500ms (cold start)
- **Memory usage:** ~50-100 MB (vs. Electron's 200+ MB)
- **Build time:** ~30-60 seconds

### Optimization Tips

1. **Lazy load components** (React.lazy)
2. **Index database tables** (frequently queried columns)
3. **Batch database operations** (reduce IPC overhead)
4. **Optimize images** (compress before bundling)

---

## Security

This starter follows security best practices:

- ✅ **Parameterized queries** (no SQL injection)
- ✅ **IPC whitelisting** (only registered commands callable)
- ✅ **CSP headers** (content security policy)
- ✅ **Sandboxed frontend** (no direct system access)
- ✅ **Code signing** (trusted app identity)

See [Security Guide](apps/desktop/README.md#security) for details.

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

For questions or issues, please open a GitHub issue.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built with:

- [Tauri](https://tauri.app/) - Desktop app framework
- [Next.js](https://nextjs.org/) - React framework
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [Bun](https://bun.sh/) - JavaScript runtime
- [Biome](https://biomejs.dev/) - Linter & formatter

Special thanks to the open source community.

---

## What's Next?

Once you understand this starter:

- **Build your app** on top of this foundation
- **Read the guides** (apps/desktop/README.md, packages/db/README.md)
- **Customize** (change styles, add features, extend database)
- **Ship** (build, sign, distribute)

**This is your starting point for serious Tauri applications.**

---

## Support

- 📖 [Documentation](apps/desktop/README.md)
- 💬 [Tauri Discord](https://discord.gg/tauri)
- 📚 [Extended Architecture Guide](docs/STARTER_BLUEPRINT.md)

---

**Happy building! 🚀**

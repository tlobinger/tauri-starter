# Quick Start Guide

**Get up and running in 5 minutes**

---

## Prerequisites

Install these tools first:

### 1. Bun (JavaScript Runtime)

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Rust (Backend Language)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 3. System Dependencies

#### macOS

```bash
xcode-select --install
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev \
  build-essential curl wget file \
  libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

#### Windows

- Install [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/downloads/)
- Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tauri-starter.git
cd tauri-starter

# Install dependencies
bun install
```

---

## Development

```bash
# Run development server
bun run tauri:dev
```

This will:
1. Start Next.js dev server (port 3000)
2. Compile Rust backend
3. Launch desktop app window
4. Enable hot reload

---

## Building

```bash
# Build production app
bun run tauri:build
```

Find your app in:
- **macOS:** `apps/desktop/src-tauri/target/release/bundle/dmg/`
- **Linux:** `apps/desktop/src-tauri/target/release/bundle/appimage/`
- **Windows:** `apps/desktop/src-tauri/target/release/bundle/msi/`

---

## Testing

```bash
# TypeScript tests
bun test

# Rust tests
bun run test:rust

# Linting
bun run lint
```

---

## Project Structure

```
tauri-starter/
├── apps/desktop/       # Main desktop app
│   ├── app/            # Next.js pages
│   ├── src/            # Components & utilities
│   └── src-tauri/      # Rust backend
│
├── packages/db/        # Database layer
│   ├── schema/         # Database schema
│   └── migrations/     # SQL migrations
│
└── tests/              # Test files
```

---

## Next Steps

1. **Read the docs:**
   - `README.md` - Project overview
   - `apps/desktop/README.md` - Development guide
   - `packages/db/README.md` - Database guide

2. **Customize the app:**
   - Edit `apps/desktop/app/page.tsx` for UI
   - Edit `packages/db/schema/todos.ts` for database
   - Run `bun run db:generate` to create migrations

3. **Add features:**
   - Create new pages in `apps/desktop/app/`
   - Add Tauri commands in `apps/desktop/src-tauri/src/`
   - Define new schemas in `packages/db/schema/`

---

## Common Commands

```bash
# Development
bun run tauri:dev          # Run dev server

# Building
bun run tauri:build        # Build production app
bun run build              # Build Next.js only

# Database
bun run db:generate        # Generate migrations
bun run db:migrate         # Run migrations manually

# Testing
bun test                   # Run TypeScript tests
bun run test:rust          # Run Rust tests
bun test --watch           # Watch mode

# Code Quality
bun run lint               # Check code
bun run lint:fix           # Fix issues
bun run format             # Format code
```

---

## Troubleshooting

### App won't start

1. Check Rust is installed: `rustc --version`
2. Check Bun is installed: `bun --version`
3. Try cleaning: `rm -rf node_modules && bun install`

### Database errors

1. Ensure database initialized (check console logs)
2. Try deleting database file and restart
3. Check migrations applied (see logs)

### Build errors

1. Update Rust: `rustup update`
2. Clean Rust build: `cargo clean`
3. Check system dependencies installed

### More help

- [Full README](README.md)
- [Desktop App Guide](apps/desktop/README.md)
- [Tauri Discord](https://discord.gg/tauri)

---

## What You Get

✅ **Working To-Do app** - Full CRUD operations  
✅ **Type-safe database** - Drizzle ORM with SQLite  
✅ **Hot reload** - Frontend and backend  
✅ **Production build** - Platform-specific installers  
✅ **Testing** - Unit, integration, E2E  
✅ **Documentation** - 4,000+ lines of guides  

---

**Ready to build your desktop app? Start coding!** 🚀

See [README.md](README.md) for complete documentation.

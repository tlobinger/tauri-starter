# Architecture Diagram

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                        │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              Next.js 16 (Static Export)                       │ │
│  │                                                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │ │
│  │  │ app/        │  │ src/        │  │ public/     │          │ │
│  │  │ - page.tsx  │  │ - TodoList  │  │ - assets    │          │ │
│  │  │ - layout.tsx│  │ - db.ts     │  │             │          │ │
│  │  │ - *.css     │  │             │  │             │          │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │ │
│  │                                                               │ │
│  │  React 19 Components + TypeScript                            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Tauri IPC (invoke)
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      BRIDGE LAYER                                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │           Tauri SQLite Adapter                                │ │
│  │           (packages/db/tauri-adapter.ts)                      │ │
│  │                                                               │ │
│  │  createTauriSQLiteAdapter()                                   │ │
│  │    ├─ execute(sql, params)  → invoke("execute_sql", ...)     │ │
│  │    └─ batch(queries)        → invoke("execute_batch", ...)   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │           Drizzle ORM                                         │ │
│  │           (packages/db/)                                      │ │
│  │                                                               │ │
│  │  Schema:     schema/todos.ts                                 │ │
│  │  Migrations: migrations/0000_*.sql                           │ │
│  │  Migrator:   migrator.ts                                     │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Function calls
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      BACKEND LAYER                                  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              Tauri v2 (Rust)                                  │ │
│  │              (apps/desktop/src-tauri/)                        │ │
│  │                                                               │ │
│  │  main.rs       Entry point                                   │ │
│  │  lib.rs        App setup & command registration              │ │
│  │  db.rs         Database IPC handlers                         │ │
│  │                                                               │ │
│  │  Commands:                                                    │ │
│  │  ├─ init_database() → Initialize SQLite                      │ │
│  │  ├─ execute_sql()   → Run query                              │ │
│  │  └─ execute_batch() → Run multiple queries                   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │           Tauri SQL Plugin                                    │ │
│  │           (tauri-plugin-sql)                                  │ │
│  │                                                               │ │
│  │  - Secure SQLite access                                       │ │
│  │  - Connection pooling                                         │ │
│  │  - Query execution                                            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ SQL queries
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      DATA LAYER                                     │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              SQLite Database                                  │ │
│  │              (app.db)                                         │ │
│  │                                                               │ │
│  │  Location: Tauri App Data Directory                          │ │
│  │  - macOS:    ~/Library/Application Support/...               │ │
│  │  - Linux:    ~/.local/share/...                              │ │
│  │  - Windows:  %APPDATA%\...                                   │ │
│  │                                                               │ │
│  │  Tables:                                                      │ │
│  │  ┌──────────────────────────────────────┐                    │ │
│  │  │  todos                               │                    │ │
│  │  │  ├─ id (text, primary key)           │                    │ │
│  │  │  ├─ title (text)                     │                    │ │
│  │  │  ├─ completed (integer/boolean)      │                    │ │
│  │  │  ├─ created_at (integer/timestamp)   │                    │ │
│  │  │  └─ updated_at (integer/timestamp)   │                    │ │
│  │  └──────────────────────────────────────┘                    │ │
│  │                                                               │ │
│  │  ┌──────────────────────────────────────┐                    │ │
│  │  │  __drizzle_migrations                │                    │ │
│  │  │  ├─ id (integer, auto increment)     │                    │ │
│  │  │  ├─ name (text, unique)              │                    │ │
│  │  │  └─ applied_at (integer)             │                    │ │
│  │  └──────────────────────────────────────┘                    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Create Todo

```
┌──────────────┐
│     USER     │
│  Types todo  │
│  Clicks Add  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│  TodoList.tsx (React Component)     │
│  - Generate UUID                    │
│  - Create NewTodo object            │
│  - Call: db.insert(todos).values()  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Drizzle ORM                        │
│  - Parse query                      │
│  - Generate SQL:                    │
│    INSERT INTO todos VALUES (?, ...) │
│  - Prepare parameters               │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Tauri Adapter                      │
│  - Receive SQL + params             │
│  - Call: invoke("execute_sql", {...})│
└──────┬──────────────────────────────┘
       │
       ▼  IPC (Inter-Process Communication)
┌─────────────────────────────────────┐
│  Tauri Backend (Rust)               │
│  - Execute: execute_sql()           │
│  - Validate parameters              │
│  - Forward to SQL plugin            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Tauri SQL Plugin                   │
│  - Execute SQL against SQLite       │
│  - Return result                    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  SQLite Database                    │
│  - Write to disk                    │
│  - Commit transaction               │
│  - Return rows affected             │
└──────┬──────────────────────────────┘
       │
       ▼  (Return path - reverse order)
┌─────────────────────────────────────┐
│  TodoList.tsx                       │
│  - Receive success                  │
│  - Reload todos list                │
│  - Update UI                        │
└─────────────────────────────────────┘
```

---

## Migration Flow

```
┌──────────────┐
│  App Startup │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│  app/page.tsx                       │
│  - useEffect on mount               │
│  - Call: initializeDatabase()       │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  src/lib/db.ts                      │
│  - Check Tauri available            │
│  - Call: invoke("init_database")    │
└──────┬──────────────────────────────┘
       │
       ▼  IPC
┌─────────────────────────────────────┐
│  src-tauri/src/db.rs                │
│  - init_database() command          │
│  - Get app data directory           │
│  - Ensure directory exists          │
│  - Create/open app.db               │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  packages/db/migrator.ts            │
│  - Create migration tracking table  │
│  - Load migration files from disk   │
│  - For each migration:              │
│    ├─ Check if applied              │
│    ├─ Apply if new                  │
│    └─ Record in tracking table      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  SQLite Database                    │
│  - Execute migrations                │
│  - Update __drizzle_migrations      │
│  - Database ready for use           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  UI Shows Ready                     │
│  - Database initialized              │
│  - Migrations applied               │
│  - App ready for interaction        │
└─────────────────────────────────────┘
```

---

## Project Structure with Dependencies

```
tauri-starter/
│
├─ apps/
│  └─ desktop/
│     ├─ app/                    # Next.js pages
│     │  ├─ layout.tsx           # Root layout
│     │  ├─ page.tsx             # Main page (uses TodoList)
│     │  ├─ page.module.css      # Page styles
│     │  └─ globals.css          # Global styles
│     │
│     ├─ src/
│     │  ├─ components/
│     │  │  ├─ TodoList.tsx      # Uses: db, todos schema
│     │  │  └─ TodoList.module.css
│     │  │
│     │  └─ lib/
│     │     └─ db.ts             # Uses: Drizzle, adapter, invoke
│     │
│     ├─ src-tauri/
│     │  ├─ src/
│     │  │  ├─ main.rs           # Entry point
│     │  │  ├─ lib.rs            # Registers commands from db.rs
│     │  │  └─ db.rs             # IPC commands, uses SQL plugin
│     │  │
│     │  ├─ Cargo.toml           # Rust dependencies
│     │  ├─ tauri.conf.json      # App config, SQL plugin config
│     │  └─ build.rs             # Build script
│     │
│     ├─ next.config.js          # output: "export"
│     ├─ tsconfig.json           # strict: true
│     └─ package.json            # Dependencies
│
├─ packages/
│  └─ db/
│     ├─ schema/
│     │  ├─ todos.ts             # Table definition
│     │  └─ index.ts             # Exports all schemas
│     │
│     ├─ migrations/
│     │  ├─ 0000_initial_schema.sql  # Generated SQL
│     │  └─ meta/
│     │     └─ _journal.json     # Migration metadata
│     │
│     ├─ tauri-adapter.ts        # Uses: invoke from @tauri-apps/api
│     ├─ migrator.ts             # Uses: invoke, fs, path
│     ├─ index.ts                # Exports everything
│     ├─ drizzle.config.ts       # Drizzle-kit config
│     └─ package.json            # Drizzle dependencies
│
├─ tests/
│  ├─ unit/
│  │  └─ db.test.ts              # Uses: db schema, Bun test
│  │
│  └─ e2e/
│     └─ todo.test.ts            # Uses: WebDriver (planned)
│
├─ docs/
│  └─ STARTER_BLUEPRINT.md       # Architecture deep dive
│
├─ .github/
│  └─ workflows/
│     └─ test.yml                # CI/CD pipeline
│
├─ biome.json                    # Linting & formatting
├─ bunfig.toml                   # Bun config
├─ tsconfig.json                 # Root TypeScript config
├─ package.json                  # Root package, workspaces
└─ README.md                     # Main documentation
```

---

## Technology Stack Layers

```
┌─────────────────────────────────────┐
│         Development Tools           │
│                                     │
│  Bun        TypeScript    Biome    │
│  v1.0+      v5.7.2        v1.9.4   │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Frontend Layer              │
│                                     │
│  Next.js 16     React 19            │
│  (Static Export)                    │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         ORM Layer                   │
│                                     │
│  Drizzle ORM                        │
│  v0.36.4                            │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Bridge Layer                │
│                                     │
│  Tauri Adapter                      │
│  (Custom implementation)            │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         IPC Layer                   │
│                                     │
│  Tauri IPC                          │
│  @tauri-apps/api v2.2.0             │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Backend Layer               │
│                                     │
│  Tauri v2        Rust               │
│  v2.2            Stable             │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Database Plugin             │
│                                     │
│  tauri-plugin-sql                   │
│  v2.0                               │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Data Layer                  │
│                                     │
│  SQLite 3                           │
│  (Local file database)              │
└─────────────────────────────────────┘
```

---

## Build Process Flow

```
┌──────────────┐
│  Developer   │
│  runs:       │
│  bun run     │
│  tauri:build │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│  package.json scripts               │
│  - Calls apps/desktop/tauri:build   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  tauri.conf.json                    │
│  - Reads beforeBuildCommand         │
│  - Runs: bun run build              │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Next.js Build                      │
│  - Builds static pages              │
│  - Optimizes assets                 │
│  - Outputs to: out/                 │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Tauri Build                        │
│  - Reads frontendDist: out/         │
│  - Compiles Rust backend            │
│  - Bundles frontend + backend       │
│  - Creates platform binary          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Platform-specific Output           │
│                                     │
│  macOS:    .app / .dmg              │
│  Linux:    AppImage / .deb          │
│  Windows:  .msi / .exe              │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Distributable Ready                │
│  - Code-signed (if configured)      │
│  - Ready to distribute              │
└─────────────────────────────────────┘
```

---

## Type Safety Flow

```
┌─────────────────────────────────────┐
│  Drizzle Schema (TypeScript)        │
│  packages/db/schema/todos.ts        │
│                                     │
│  export const todos = sqliteTable() │
└──────┬──────────────────────────────┘
       │
       ├─────────────┬─────────────────┐
       │             │                 │
       ▼             ▼                 ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│ TypeScript│  │ Drizzle  │  │ SQL (Runtime)│
│   Types   │  │   Kit    │  │              │
│           │  │          │  │              │
│ Todo      │  │ Generate │  │ CREATE TABLE │
│ NewTodo   │  │ Migration│  │ INSERT       │
│           │  │          │  │ SELECT       │
└──────────┘  └──────────┘  └──────────────┘
     │
     │ Imported by
     ▼
┌─────────────────────────────────────┐
│  React Components                   │
│  - Type-safe props                  │
│  - Autocomplete in IDE              │
│  - Compile-time errors              │
└─────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Type safety across boundaries
- ✅ Secure IPC communication
- ✅ Local-first data storage
- ✅ Production-grade patterns
- ✅ Extensible design

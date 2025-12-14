# The Ultimate Tauri + Next.js 16 Starter

**A production-grade, local-first desktop app foundation**

---

## 1. Purpose of This Repository

This repository defines the **canonical starter project** for building desktop applications using:

* **Tauri v2**
* **Next.js 16 (App Router, static export)**
* **SQLite**
* **Drizzle ORM**
* **Bun**
* **Biome**

This project is intentionally designed to serve **two roles at once**:

1. **A zero-friction starter**

   * Clone → install → run → working desktop app.
2. **An executable how-to guide**

   * Every architectural decision is documented.
   * A complete, working **Hello World To-Do app** demonstrates:

     * Frontend ↔ backend communication
     * SQLite persistence
     * Migrations
     * Testing (TypeScript + Rust)
     * Tauri runtime integration

If a developer understands this repository, they understand how to build serious Tauri apps.

---

## 2. Core Design Principles

This starter follows a small set of strict principles:

* **Desktop-first**

  * No Node.js server at runtime.
  * No hidden backend.
* **Local-first**

  * SQLite is the primary data store.
* **Explicit architecture**

  * No “magic”.
  * Every layer has a clearly defined responsibility.
* **Production realism**

  * Migrations, tests, linting, and documentation are required, not optional.
* **Future-ready**

  * Data model is sync-ready (IDs, timestamps, deterministic migrations).

---

## 3. Technology Stack (Locked)

| Layer           | Technology                 |
| --------------- | -------------------------- |
| Desktop runtime | **Tauri v2**               |
| Frontend        | **Next.js 16**, App Router |
| Rendering mode  | **Static export only**     |
| Database        | **SQLite (local file)**    |
| ORM             | **Drizzle ORM (SQLite)**   |
| JS runtime      | **Bun**                    |
| Lint / Format   | **Biome (only)**           |
| Language        | **TypeScript (strict)**    |
| TS tests        | **bun test**               |
| Rust tests      | **cargo test**             |

No ESLint.
No Prettier.
No server-side Next.js features.

---

## 4. High-Level Architecture

```
┌──────────────────────────┐
│        Next.js 16        │
│   (Static Export UI)     │
│                          │
│  - App Router            │
│  - React Components     │
│  - Drizzle client       │
└─────────────┬────────────┘
              │
              │ Tauri IPC
              │
┌─────────────▼────────────┐
│        Tauri v2          │
│      (Rust Backend)      │
│                          │
│  - SQL plugin (SQLite)   │
│  - App lifecycle         │
│  - Secure DB access      │
└─────────────┬────────────┘
              │
┌─────────────▼────────────┐
│         SQLite           │
│     (Local Database)     │
│                          │
│  - Drizzle schema        │
│  - Migrations            │
│  - App data directory    │
└──────────────────────────┘
```

---

## 5. Non-Negotiable Constraints

### 5.1 Next.js Must Be Static

* `output: "export"` **must** be enabled.
* No API routes.
* No server actions.
* No runtime Node.js server.

All backend work happens via **Tauri IPC**.

---

### 5.2 SQLite Is Local and Ephemeral

* The SQLite database **must not** live in the repository.
* The DB file must be created in the **Tauri app data directory**.
* The app must initialize the DB automatically on first run.

---

### 5.3 Drizzle Is the Single Source of Truth

* All schemas are defined in TypeScript using Drizzle.
* All migrations are generated via `drizzle-kit`.
* No handwritten schema SQL.

---

### 5.4 Documentation Is Mandatory

Every major folder must contain:

* A `README.md`
* Inline comments explaining **why**, not just **what**

This repo must be readable and teachable.

---

## 6. Repository Structure

```
repo/
├─ apps/
│  └─ desktop/
│     ├─ app/                 # Next.js App Router
│     ├─ src/                 # Frontend TS helpers
│     ├─ public/
│     ├─ src-tauri/           # Rust backend
│     ├─ next.config.js
│     └─ README.md            # Desktop app guide
│
├─ packages/
│  └─ db/
│     ├─ schema/              # Drizzle schema
│     ├─ migrations/          # Generated SQL
│     ├─ drizzle.config.ts
│     ├─ migrator.ts          # Applies migrations
│     └─ README.md            # DB architecture guide
│
├─ tests/
│  └─ README.md               # Testing philosophy
│
├─ biome.json
├─ package.json
├─ bun.lockb
├─ README.md                  # Main entry point
└─ docs/
   └─ STARTER_BLUEPRINT.md    # Extended architecture notes
```

---

## 7. Hello World Feature: To-Do App

The starter **must include** a working To-Do app.

This is not a demo.
This is proof that the stack works end-to-end.

### Functional Requirements

The To-Do app must:

1. Create a to-do item
2. List all to-dos
3. Toggle completion
4. Persist data across app restarts
5. Be covered by tests

---

## 8. Database Schema Requirements

Example schema:

```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
```

**Mandatory conventions:**

* Stable IDs (UUID / ULID)
* `createdAt` / `updatedAt`
* Explicit booleans
* Sync-ready timestamps

---

## 9. Frontend ↔ Backend Database Access Pattern

### Why This Exists

* Next.js static export cannot access SQLite directly.
* Tauri SQL plugin executes queries securely.
* Drizzle expects a database adapter.

### Required Pattern: SQLite Proxy

1. Drizzle generates SQL
2. A proxy adapter forwards `(sql, params)`
3. Tauri executes via `plugin-sql`
4. Results are returned to Drizzle

This pattern **must be documented in code comments**.

---

## 10. Migration Strategy

### Requirements

* Migrations generated via `drizzle-kit`
* Applied automatically on app startup
* Migration state tracked in SQLite

### Startup Flow

1. App starts
2. SQLite DB file is opened or created
3. Migrations are applied (idempotent)
4. App continues booting

Migration failure must:

* Log clearly
* Fail fast in development

---

## 11. Testing Requirements

### TypeScript Tests

* Use `bun test`
* Must cover:

  * To-Do creation
  * DB write → read roundtrip

### Rust Tests

* Use `cargo test`
* Must cover:

  * DB initialization
  * Migration runner

### Optional (Recommended)

* Tauri WebDriver E2E test:

  * Launch app
  * Add to-do
  * Verify UI update

---

## 12. Biome Configuration Requirements

* Biome is the **only** linting and formatting tool.
* Formatting enabled
* Linting enabled
* TypeScript strict mode
* No ESLint
* No Prettier

---

## 13. README Requirements

### Root README.md

Must explain:

* What this project is
* Who it is for
* Tech stack overview
* How to run
* How to build
* How to extend

### Sub-READMEs

Each major directory must document:

* Its responsibility
* Architectural decisions
* Common pitfalls

---

## 14. Quality Bar

This starter is considered **successful** only if:

* A developer can clone it
* Run one command
* See a working desktop app
* Understand *why* each decision was made
* Confidently build their own app on top

---

## 15. Final Goal

This repository should feel like:

* Next.js quality
* Rust seriousness
* Electron-level convenience
* None of Electron’s pain

If done correctly, this becomes:

> **The default starting point for serious Tauri applications.**

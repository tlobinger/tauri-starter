# Database Package (@tauri-starter/db)

**Local-first SQLite database with Drizzle ORM**

---

## Overview

This package contains the **single source of truth** for the application's data model. It includes:

- **Schema definitions** (TypeScript, using Drizzle ORM)
- **Generated migrations** (SQL files)
- **Migration runner** (consumed by the app at startup)
- **Tauri adapter** (bridges Drizzle ↔ `@tauri-apps/plugin-sql`)

---

## Architecture

### Why This Design?

In a Tauri app with Next.js static export:

1. **Next.js cannot access SQLite directly** (no Node.js runtime)
2. **Tauri's SQL plugin provides secure database access** (from Rust backend)
3. **Drizzle ORM provides type-safe queries** (from TypeScript frontend)

We need a **bridge** between them.

### The Bridge: Tauri Adapter

```
┌──────────────────┐
│   Drizzle ORM    │  Generates SQL + params
│   (TypeScript)   │
└────────┬─────────┘
         │
         │ (sql, params)
         │
┌────────▼─────────┐
│  Tauri Adapter   │  Forwards via IPC
│  (tauri-adapter) │
└────────┬─────────┘
         │
         │ `@tauri-apps/plugin-sql` (Database.load("sqlite:app.db"))
         │
┌────────▼─────────┐
│   Tauri Backend  │  Executes queries
│   (Rust + SQL)   │
└────────┬─────────┘
         │
┌────────▼─────────┐
│     SQLite       │  Local database file
│  (app data dir)  │
└──────────────────┘
```

---

## Key Files

### `schema/todos.ts`

Defines the data model using Drizzle ORM syntax.

**Design decisions:**
- UUIDs/ULIDs instead of auto-increment (sync-ready)
- `createdAt` / `updatedAt` timestamps (audit trail)
- Explicit boolean mode (SQLite stores as 0/1)

### `drizzle.config.ts`

Configuration for `drizzle-kit` (migration generator).

### `migrator.ts`

Applies migrations automatically at app startup.

**How it works:**
1. Reads all `.sql` files from `migrations/`
2. Creates a tracking table (`__drizzle_migrations`)
3. Applies only new migrations
4. Records which migrations have been applied

### `tauri-adapter.ts`

The IPC bridge between Drizzle and Tauri.

**Key methods:**
- `execute(sql, params)` - Single query
- `batch(queries)` - Multiple queries (transaction)

---

## Usage

### 1. Define Schema

Edit `schema/todos.ts` (or create new schema files):

```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull(),
  // ...
});
```

### 2. Generate Migration

```bash
bun run generate
```

This creates a new `.sql` file in `migrations/`.

### 3. Apply Migrations

Migrations are applied by the desktop app during startup (see `apps/desktop/src/lib/db.ts`).

For manual testing:

```bash
bun run migrate
```

### 4. Use in Frontend

```ts
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { createTauriSQLiteAdapter } from "@tauri-starter/db";
import * as schema from "@tauri-starter/db/schema";

const adapter = createTauriSQLiteAdapter();
const db = drizzle(adapter, { schema });

// Type-safe queries
const todos = await db.select().from(schema.todos);
```

---

## Schema Conventions

Follow these conventions for consistency and sync-readiness:

### 1. Use Stable IDs

❌ **Don't:**
```ts
id: integer("id").primaryKey({ autoIncrement: true })
```

✅ **Do:**
```ts
id: text("id").primaryKey() // UUID or ULID
```

**Why:** Auto-increment IDs conflict during sync between devices.

### 2. Include Timestamps

✅ **Always include:**
```ts
createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
```

**Why:** Enables conflict resolution and audit trails.

### 3. Explicit Types

✅ **Be explicit:**
```ts
completed: integer("completed", { mode: "boolean" }).notNull()
```

**Why:** SQLite doesn't have native boolean type; this ensures type safety.

---

## Migration Best Practices

### Migration Naming

Drizzle-kit generates names like:

```
0000_initial_schema.sql
0001_add_user_table.sql
0002_add_completed_index.sql
```

Names are **auto-generated** and **deterministic**.

### Migration Safety

✅ **Safe operations:**
- Adding new tables
- Adding new columns (with defaults)
- Creating indexes

⚠️ **Dangerous operations:**
- Dropping columns (data loss)
- Changing column types (may fail)
- Removing constraints (may break queries)

### Rollback Strategy

**This starter does not include automatic rollback.**

For production apps, consider:
- Keeping backups before migrations
- Implementing manual rollback scripts
- Using database versioning

---

## Testing

### Unit Tests

Test schema definitions and queries:

```ts
import { describe, test, expect } from "bun:test";
import { todos } from "./schema/todos";

describe("Todos schema", () => {
  test("should have required fields", () => {
    expect(todos.id).toBeDefined();
    expect(todos.title).toBeDefined();
  });
});
```

### Integration Tests

Test the full flow (Drizzle → Tauri → SQLite):

See `../../tests/` for examples.

---

## Common Pitfalls

### 1. Forgetting to Generate Migrations

**Symptom:** Schema changes don't persist.

**Solution:** Run `bun run generate` after schema changes.

### 2. Migration Order

**Symptom:** Migrations fail due to missing tables.

**Solution:** Migrations are auto-sorted by filename. Don't rename them.

### 3. Tauri Plugin Not Configured

**Symptom:** `invoke("execute_sql")` fails.

**Solution:** Ensure Tauri SQL plugin is configured in `src-tauri/Cargo.toml`.

---

## Database Location

The SQLite database is stored in the **Tauri app data directory**:

- **macOS:** `~/Library/Application Support/com.tauri-starter.app/`
- **Linux:** `~/.local/share/com.tauri-starter.app/`
- **Windows:** `%APPDATA%\com.tauri-starter.app\`

**File name:** `app.db`

This location is:
- User-specific
- Persistent across app restarts
- Not part of the repository

---

## Extending This Package

### Adding a New Table

1. Create `schema/users.ts`:

```ts
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
```

2. Export in `schema/index.ts`:

```ts
export * from "./users";
```

3. Generate migration:

```bash
bun run generate
```

4. Migration auto-applies on next app start.

### Adding Relations

Use Drizzle's relations API:

```ts
import { relations } from "drizzle-orm";

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
}));
```

---

## Future Enhancements

This starter is designed to be **sync-ready**. Future additions could include:

- **CRDTs** (conflict-free replicated data types)
- **Sync protocols** (e.g., to a backend server)
- **Encryption at rest** (SQLite encryption extension)
- **Multi-tenancy** (user-specific databases)

The current architecture supports all of these without major refactoring.

---

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Tauri SQL Plugin](https://v2.tauri.app/plugin/sql/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

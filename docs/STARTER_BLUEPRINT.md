# Starter Blueprint

**Extended architecture notes for building production Tauri apps**

---

## Read this if…

- You’re new to **Tauri + Next.js static export** and want the “mental model”.
- You’re about to add **new tables**, **new pages**, or **new Tauri commands**.
- You hit a confusing build/runtime issue and want to understand *why* the stack is structured this way.

## TL;DR (current repo)

- **No server**: Next.js is in static export mode (`output: "export"`). No API routes / server actions / SSR.
- **DB access happens in TypeScript** via `@tauri-apps/plugin-sql` + Drizzle.
- **Rust is small by design**: it hosts the app + exposes only minimal commands (e.g. `init_database`).
- **State**: Zustand store lives in `packages/store/` and is wired in `apps/desktop/src/stores/`.
- **Errors**:
  - Route-level: `apps/desktop/app/error.tsx`, `apps/desktop/app/global-error.tsx`
  - Component-level: `apps/desktop/src/components/ErrorBoundary.tsx`
- **IPC wrapper**: `apps/desktop/src/lib/ipc.ts` centralizes `invoke()` calls.

## Purpose

This document explains **why** architectural decisions were made, not just **what** they are.

If you understand this blueprint, you can:
- Make informed decisions when extending the app
- Debug issues faster
- Avoid common pitfalls
- Build production-grade features

---

## Table of Contents

1. [The Desktop App Paradigm](#the-desktop-app-paradigm)
2. [Static Export Deep Dive](#static-export-deep-dive)
3. [The IPC Bridge Pattern](#the-ipc-bridge-pattern)
4. [Database Architecture](#database-architecture)
5. [Migration Strategy](#migration-strategy)
6. [Type Safety Across Boundaries](#type-safety-across-boundaries)
7. [Error Handling Philosophy](#error-handling-philosophy)
8. [Testing Strategy](#testing-strategy)
9. [Performance Considerations](#performance-considerations)
10. [Security Model](#security-model)
11. [Future-Proofing](#future-proofing)

---

## The Desktop App Paradigm

### Mental Model Shift

If you're coming from web development, **forget these concepts**:

- ❌ Server-side rendering
- ❌ API endpoints
- ❌ Database connection strings
- ❌ Environment variables (mostly)
- ❌ CORS
- ❌ Authentication servers

**In desktop apps:**

- ✅ Everything runs locally
- ✅ No network by default
- ✅ Database is a file
- ✅ Backend is Rust (not Node.js)
- ✅ Frontend is static HTML/CSS/JS
- ✅ User owns their data

### Why This Matters

Desktop apps are **fundamentally different** from web apps:

| Aspect | Web App | Desktop App |
|--------|---------|-------------|
| Backend | Remote server | Local process |
| Database | PostgreSQL/MySQL on server | SQLite on disk |
| API | HTTP/REST | IPC (in-process) |
| Auth | JWT/sessions | OS user account |
| Updates | Deploy to server | Update installer |
| Scaling | Horizontal (add servers) | Per-device only |

**Implication:** Don't try to make a desktop app "feel like" a web app. Embrace the differences.

---

## Static Export Deep Dive

### What Is Static Export?

Next.js can run in two modes:

1. **Server mode** (default):
   - Node.js server handles requests
   - Pages rendered on-demand
   - API routes available
   - SSR, ISR, etc.

2. **Static export** (`output: "export"`):
   - All pages pre-rendered at build time
   - No server at runtime
   - Pure HTML/CSS/JS files
   - Client-side only

**Tauri requires static export.**

### Why?

Tauri apps don't have a Node.js runtime at runtime. They have:

- **Rust backend** (for system access, database, etc.)
- **WebView frontend** (for UI)

The WebView loads static files from disk. There's no Node.js process to handle SSR.

### Constraints

With static export, you **cannot** use:

- `getServerSideProps`
- `getStaticProps` with `revalidate`
- API routes (`pages/api/` or `app/api/`)
- Server actions
- Edge runtime
- Middleware (server-side)

### What You Can Use

- ✅ App Router (with static pages)
- ✅ Client components (`"use client"`)
- ✅ `useEffect`, `useState`, etc.
- ✅ Client-side data fetching
- ✅ Dynamic routes (if all paths known at build time)
- ✅ CSS Modules, Tailwind, etc.

### Data Fetching Pattern

Instead of SSR:

```tsx
// ❌ Can't do this
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}
```

Use client-side fetching:

```tsx
// ✅ Do this
"use client";

export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData().then(setData);
  }, []);

  if (!data) return <Loading />;
  return <div>{data}</div>;
}
```

**Key insight:** In desktop apps, "loading" is fast (local database), so this pattern works well.

---

## The IPC Bridge Pattern

### Problem

- **Frontend:** JavaScript (Next.js)
- **Backend:** Rust (Tauri)
- **Database:** SQLite (accessed via Rust)

How do they communicate?

### Solution: Tauri IPC

IPC (Inter-Process Communication) allows **function calls across language boundaries**:

```ts
// Frontend (TypeScript)
const result = await invoke("greet", { name: "World" });
```

```rust
// Backend (Rust)
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

**This is the fundamental communication mechanism in Tauri.**

### Why Not HTTP?

You could set up a local HTTP server in Rust and call it from JavaScript. But:

- ❌ Overhead (network stack, serialization)
- ❌ Security (need authentication)
- ❌ Complexity (CORS, error handling)
- ❌ Port conflicts (what if port taken?)

IPC is:

- ✅ Fast (in-process, no network)
- ✅ Secure (no external access)
- ✅ Simple (function calls)
- ✅ Type-safe (with proper setup)

### The Drizzle + Tauri Bridge

**Challenge:** Drizzle expects a database connection. Tauri provides database access via IPC.

**Solution:** Create an adapter that bridges them.

```
Drizzle generates SQL
       ↓
Adapter forwards to Tauri
       ↓
Tauri executes via SQL plugin
       ↓
Results returned to Drizzle
```

This is implemented in `packages/db/tauri-adapter.ts`:

- Drizzle generates SQL + params
- The adapter calls `@tauri-apps/plugin-sql` (`Database.load("sqlite:app.db")`)
- Results are returned to Drizzle

**Key insight:** This adapter is the **only place** where Drizzle talks to Tauri. Everywhere else, you use Drizzle normally.

---

## Database Architecture

### Why SQLite?

For local-first desktop apps, SQLite is the obvious choice:

- ✅ **Embedded:** No separate database process
- ✅ **Fast:** In-process, no network latency
- ✅ **Reliable:** Battle-tested since 2000
- ✅ **Portable:** Single file, easy to backup
- ✅ **SQL:** Full SQL support (joins, transactions, etc.)

Alternatives (and why not):

- **IndexedDB:** Browser API, awkward from Rust, no SQL
- **LevelDB/RocksDB:** Key-value only, no queries
- **PostgreSQL:** Requires server, overkill for desktop
- **In-memory:** Lost on restart

### Database Location

The SQLite file is stored in the **app data directory**:

- **macOS:** `~/Library/Application Support/com.tauri-starter.app/`
- **Linux:** `~/.local/share/com.tauri-starter.app/`
- **Windows:** `%APPDATA%\com.tauri-starter.app\`

**Why not the app's install directory?**

- ❌ Not writable (apps often in read-only `/Applications`)
- ❌ Lost on uninstall/update
- ❌ Not user-specific (multi-user systems)

**Why not a user-chosen location?**

- ✅ Consistent across platforms
- ✅ Backed up by OS (macOS Time Machine, Windows Backup)
- ✅ Sandboxed (Mac App Store requirement)

### Schema Management

**Options for schema management:**

1. **Manual SQL:** Write CREATE TABLE statements
2. **ORM migrations:** Auto-generate from code
3. **Schema snapshots:** Compare current vs. desired

**This starter uses Drizzle migrations (option 2):**

- Define schema in TypeScript
- Auto-generate SQL migrations
- Apply migrations at app startup

**Benefits:**

- ✅ Single source of truth (TypeScript schema)
- ✅ Type-safe queries
- ✅ Deterministic migrations (same schema → same SQL)
- ✅ Version control friendly (text-based migrations)

---

## Migration Strategy

### Design Goals

Migrations must be:

1. **Automatic:** User shouldn't manually run commands
2. **Idempotent:** Safe to run multiple times
3. **Forward-only:** No rollbacks (simplifies logic)
4. **Tracked:** Know which migrations applied
5. **Fast:** Don't slow down app startup

### Implementation

Migrations are stored in `packages/db/migrations/` as SQL files:

```
0000_initial_schema.sql
0001_add_completed_index.sql
0002_add_users_table.sql
```

At app startup:

1. Check which migrations already applied (tracking table)
2. Apply new migrations in order
3. Record successful migrations
4. Continue app startup

```ts
// Simplified migration runner
for (const migration of migrations) {
  if (!alreadyApplied(migration)) {
    await executeSql(migration.sql);
    await recordMigration(migration.name);
  }
}
```

### Migration Tracking Table

```sql
CREATE TABLE __drizzle_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  applied_at INTEGER NOT NULL
);
```

This table stores which migrations have been applied.

**Why not use timestamps?**

- ❌ Time zones confuse things
- ❌ Clock skew on user's machine
- ❌ Not deterministic

**Use sequential filenames instead:**

```
0000_* (first)
0001_* (second)
0002_* (third)
```

### Migration Failure Handling

**If a migration fails:**

1. Log the error clearly
2. Refuse to start the app
3. Don't partially apply (use transactions)

**Why fail fast?**

- ✅ Data consistency (don't use corrupt database)
- ✅ Clear error (dev knows what to fix)
- ✅ No silent failures

**In production:**

- Show user an error message
- Provide contact support option
- Log error for debugging

---

## Type Safety Across Boundaries

### The Challenge

Three languages/systems:

1. **TypeScript** (frontend)
2. **Rust** (backend)
3. **SQL** (database)

How do we maintain type safety?

### TypeScript ↔ Drizzle ↔ SQL

Drizzle provides **full type inference**:

```ts
// Schema definition
export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull(),
});

// Inferred types
type Todo = typeof todos.$inferSelect;
// { id: string, title: string, completed: boolean }

type NewTodo = typeof todos.$inferInsert;
// Same as Todo (for this schema)
```

**Benefits:**

- ✅ Type errors at compile time (not runtime)
- ✅ Autocomplete in IDE
- ✅ Refactoring safety (rename columns, update types automatically)

### TypeScript ↔ Rust

Tauri IPC uses **JSON serialization**:

```ts
// Frontend (typed wrapper)
import { ipcInvokeTyped } from "@/lib/ipc";

await ipcInvokeTyped("init_database");
```

```rust
// Backend
#[tauri::command]
pub async fn init_database(app: AppHandle) -> Result<(), String> {
    // ...
}
```

**Type safety:**

- ✅ Rust enforces types at backend boundary
- ⚠️ TypeScript types manually maintained (no automatic sync)

**Best practice (in this repo):**
- Keep a small command map in `apps/desktop/src/types/ipc.ts`
- Prefer `ipcInvokeTyped()` for app-owned commands (autocomplete + refactor safety)

**Future improvement:**

Use [ts-rs](https://github.com/Aleph-Alpha/ts-rs) to auto-generate TypeScript types from Rust.

---

## Error Handling Philosophy

### Principles

1. **Errors are expected** (network issues, disk full, etc.)
2. **Fail fast** (don't continue with bad state)
3. **User-friendly messages** (not stack traces)
4. **Log for debugging** (but don't expose to users)

### Error Categories

#### 1. User Errors

**Examples:**
- Invalid input (empty todo title)
- Quota exceeded (too many todos)

**Handling:**
- ✅ Show user-friendly message
- ✅ Allow retry
- ❌ Don't log as errors (expected behavior)

```ts
if (!title.trim()) {
  setError("Please enter a title");
  return;
}
```

#### 2. Transient Errors

**Examples:**
- Disk temporarily full
- Database locked (concurrent access)

**Handling:**
- ✅ Retry automatically (with backoff)
- ✅ Show progress indicator
- ✅ Log warnings

```ts
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

#### 3. Fatal Errors

**Examples:**
- Database corruption
- Migration failure
- Missing system libraries

**Handling:**
- ❌ Don't retry (won't work)
- ✅ Show clear error message
- ✅ Provide support contact
- ✅ Log full details

```ts
try {
  await initializeDatabase();
} catch (error) {
  console.error("Fatal database error:", error);
  showFatalError("Database initialization failed. Please contact support.");
  // Don't continue app startup
}
```

### Error Boundaries

Use both:
- Route-level boundaries: `apps/desktop/app/error.tsx`, `apps/desktop/app/global-error.tsx`
- Component-level boundary: `apps/desktop/src/components/ErrorBoundary.tsx`

---

## Testing Strategy

See [tests/README.md](../tests/README.md) for detailed testing guide.

### Key Principles

1. **Test behavior, not implementation**
2. **Unit tests for logic, E2E for flows**
3. **Mock external dependencies**
4. **Keep tests fast and stable**

### What to Test

✅ **High value:**
- Business logic (calculations, validations)
- Database operations (CRUD)
- Error handling (edge cases)
- Critical user flows (add todo, toggle)

❌ **Low value:**
- Framework internals
- UI styling
- Third-party libraries

---

## Performance Considerations

### Startup Time

**Goal:** < 1 second from launch to usable UI.

**Optimizations:**

1. **Lazy initialization:**
   - Show UI immediately
   - Load data in background
   - Show loading states

2. **Minimize migrations:**
   - Combine related changes
   - Keep migrations simple

3. **Bundle optimization:**
   - Code splitting (React.lazy)
   - Tree shaking (unused code removal)
   - Minification

### Runtime Performance

**Database:**

- ✅ Index frequently queried columns
- ✅ Batch operations
- ✅ Use transactions for multiple writes
- ❌ Avoid N+1 queries

**IPC:**

- ✅ Batch IPC calls when possible
- ✅ Cache frequently accessed data
- ❌ Don't call IPC in render loops

**UI:**

- ✅ Use React.memo for expensive components
- ✅ Virtualize long lists (react-window)
- ✅ Debounce user input

### Memory Usage

**Goal:** < 100 MB for typical usage.

**Monitoring:**

```rust
// In Rust backend
let memory_usage = std::process::Process::current_memory_usage();
println!("Memory: {} MB", memory_usage / 1_000_000);
```

---

## Security Model

### Threat Model

**What we protect against:**

1. ✅ **SQL injection** (parameterized queries)
2. ✅ **XSS** (React escapes by default)
3. ✅ **Unauthorized IPC** (command whitelist)
4. ✅ **File system access** (Tauri permissions)

**What we don't protect against:**

1. ❌ **Physical access** (user can read database file)
2. ❌ **Malicious code** (if user runs malware, game over)
3. ❌ **OS vulnerabilities** (not our responsibility)

### IPC Security

**All IPC commands must be explicitly registered:**

```rust
.invoke_handler(tauri::generate_handler![
    commands::db::init_database,  // ✅ Registered (callable from frontend)
    // delete_all,  ❌ Not registered (not callable)
])
```

**Frontend can only call registered commands.**

### Database Security

**SQL injection prevention:**

```ts
// ✅ Prefer Drizzle (parameterized) instead of string interpolation
await db.select().from(todos).where(eq(todos.title, userInput));
```

**File permissions:**

- Database file is user-readable only
- Not world-readable (Unix permissions)

---

## Future-Proofing

### Sync-Ready Design

This starter is designed for **future sync capabilities**:

1. **Stable IDs:**
   - UUIDs instead of auto-increment
   - Won't conflict across devices

2. **Timestamps:**
   - `createdAt`, `updatedAt`
   - Enables conflict resolution

3. **Deterministic migrations:**
   - Same schema everywhere
   - Consistent state across devices

### Extensibility Points

**Adding features:**

- ✅ New tables (just add schema)
- ✅ New IPC commands (register in handler)
- ✅ New pages (create in app/)
- ✅ New UI components (add to src/components/)

**The architecture doesn't fight you.**

### Migration Path

**From this starter to production app:**

1. Customize UI (replace Todo app with your features)
2. Extend database (add your tables)
3. Add business logic (Rust commands, TypeScript utilities)
4. Implement sync (if needed)
5. Add auto-updates (Tauri updater plugin)
6. Set up CI/CD (GitHub Actions)
7. Code signing (macOS/Windows certificates)
8. Distribution (direct download, app stores)

**Each step is independent. No big rewrites.**

---

## Lessons Learned

### What Works Well

1. ✅ **Static export** - Simple, predictable
2. ✅ **SQLite** - Fast, reliable, portable
3. ✅ **Drizzle** - Type-safe, great DX
4. ✅ **Tauri IPC** - Fast, secure
5. ✅ **Bun** - Fast, all-in-one
6. ✅ **Biome** - Fast, unified tooling

### What's Tricky

1. ⚠️ **Type sync** (TypeScript ↔ Rust)
   - Solution: Use ts-rs or manual maintenance

2. ⚠️ **Testing IPC**
   - Solution: Mock invoke() in tests

3. ⚠️ **Database debugging**
   - Solution: Use sqlite3 CLI to inspect database

4. ⚠️ **Cross-platform paths**
   - Solution: Use Tauri's path APIs

### What to Avoid

1. ❌ **Server-side Next.js features** (won't work)
2. ❌ **Auto-increment IDs** (not sync-ready)
3. ❌ **Hardcoded paths** (not cross-platform)
4. ❌ **Global state** (use React context)
5. ❌ **Inline SQL** (use Drizzle)

---

## Conclusion

This blueprint captures years of learnings building desktop apps.

**Key takeaways:**

1. Desktop apps are **fundamentally different** from web apps
2. **Static export** + **Tauri IPC** is the winning pattern
3. **Type safety** saves hours of debugging
4. **Migrations** should be automatic and tracked
5. **Error handling** is not optional
6. **Testing** prevents regressions
7. **Future-proofing** saves rewrites later

**If you understand this blueprint, you're ready to build production Tauri apps.**

---

## Further Reading

- [Tauri v2 Documentation](https://v2.tauri.app/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Local-First Software](https://www.inkandswitch.com/local-first/)

---

**Questions? Open an issue or discussion on GitHub.**

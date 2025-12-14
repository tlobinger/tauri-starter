# Desktop App (@tauri-starter/desktop)

**Tauri v2 + Next.js 16 desktop application**

---

## Overview

This is the main desktop application combining:

- **Frontend:** Next.js 16 (App Router, static export)
- **Backend:** Tauri v2 (Rust runtime)
- **Database:** SQLite (via Tauri SQL plugin)

---

## Architecture

### High-Level Flow

```
┌─────────────────────────────┐
│      Next.js Frontend       │
│  (React Components + UI)    │
│                             │
│  - app/ (App Router pages)  │
│  - src/components/          │
│  - src/lib/ (DB client)     │
└──────────┬──────────────────┘
           │
           │ Tauri IPC (invoke)
           │
┌──────────▼──────────────────┐
│      Tauri Backend          │
│     (Rust + SQLite)         │
│                             │
│  - src-tauri/src/           │
│  - Tauri commands           │
│  - SQL plugin               │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│     Local SQLite DB         │
│   (app data directory)      │
└─────────────────────────────┘
```

### Key Architectural Decisions

#### 1. Static Export Only

Next.js runs in **static export mode** (`output: "export"`):

- ✅ No Node.js server at runtime
- ✅ All pages pre-rendered at build time
- ✅ Deployed as static HTML/CSS/JS
- ❌ No API routes
- ❌ No server actions
- ❌ No server-side rendering (SSR)

**Why?** Desktop apps don't need a Node.js server. Tauri provides the backend.

#### 2. Tauri IPC Bridge

Frontend communicates with backend via **Tauri IPC**:

```ts
import { invoke } from "@tauri-apps/api/core";

// Frontend calls Rust function
const result = await invoke("execute_sql", {
  sql: "SELECT * FROM todos",
  params: [],
});
```

```rust
// Rust function exposed to frontend
#[tauri::command]
async fn execute_sql(sql: String, params: Vec<Value>) -> Result<QueryResult> {
    // Execute query
}
```

**Why?** Provides secure, type-safe communication between frontend and backend.

#### 3. SQLite via Plugin

Database access uses **Tauri SQL Plugin**:

- ✅ Secure (no direct file access from frontend)
- ✅ Performant (native Rust code)
- ✅ Persistent (survives app restarts)
- ✅ Local-first (no network required)

**Why?** SQLite is perfect for local-first desktop apps.

---

## Project Structure

```
apps/desktop/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (Todo app)
│   ├── page.module.css     # Page styles
│   └── globals.css         # Global styles
│
├── src/
│   ├── components/         # React components
│   │   ├── TodoList.tsx    # Todo list component
│   │   └── TodoList.module.css
│   │
│   └── lib/                # Utilities
│       └── db.ts           # Database client
│
├── src-tauri/              # Tauri Rust backend
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── lib.rs          # App setup
│   │   └── db.rs           # Database commands
│   │
│   ├── Cargo.toml          # Rust dependencies
│   ├── tauri.conf.json     # Tauri configuration
│   └── build.rs            # Build script
│
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

---

## Development

### Prerequisites

- **Bun** (>= 1.0.0)
- **Rust** (latest stable)
- **System dependencies** (varies by OS)

#### macOS

```bash
xcode-select --install
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Windows

Install:
- [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/downloads/)
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

### Install Dependencies

```bash
# From project root
bun install
```

### Run Development Server

```bash
# From project root
bun run dev

# Or from this directory
bun run tauri:dev
```

This will:
1. Start Next.js dev server (http://localhost:3000)
2. Launch Tauri app window
3. Hot-reload on changes (both frontend and backend)

### Build for Production

```bash
# From project root
bun run build

# Or from this directory
bun run tauri:build
```

Output:
- **macOS:** `src-tauri/target/release/bundle/dmg/`
- **Linux:** `src-tauri/target/release/bundle/appimage/`
- **Windows:** `src-tauri/target/release/bundle/msi/`

---

## Configuration

### Tauri Configuration (`src-tauri/tauri.conf.json`)

```json
{
  "productName": "Tauri Starter",
  "identifier": "com.tauri-starter.app",
  "build": {
    "beforeDevCommand": "bun run dev",
    "beforeBuildCommand": "bun run build",
    "frontendDist": "../out"
  }
}
```

**Key settings:**
- `identifier`: Unique app ID (reverse domain notation)
- `frontendDist`: Where Next.js builds static files
- `beforeBuildCommand`: Runs before Tauri build

### Next.js Configuration (`next.config.js`)

```js
module.exports = {
  output: "export",        // Static export (mandatory)
  images: { unoptimized: true }, // No image optimization
  assetPrefix: "./",       // Relative paths for assets
};
```

**Why these settings?**
- Tauri serves files from the file system
- No Node.js server available
- Assets must use relative paths

---

## Database Integration

### Initialization

Database is initialized at app startup (`app/page.tsx`):

```tsx
useEffect(() => {
  initializeDatabase()
    .then(() => setIsReady(true))
    .catch(handleError);
}, []);
```

### Querying

Use Drizzle ORM with Tauri adapter:

```ts
import { db } from "@/lib/db";
import { todos } from "@tauri-starter/db/schema";

// Select all todos
const allTodos = await db.select().from(todos).all();

// Insert new todo
await db.insert(todos).values({
  id: crypto.randomUUID(),
  title: "New todo",
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Update todo
await db
  .update(todos)
  .set({ completed: true })
  .where(eq(todos.id, "some-id"));
```

### Database Location

SQLite file is stored in the **Tauri app data directory**:

- **macOS:** `~/Library/Application Support/com.tauri-starter.app/app.db`
- **Linux:** `~/.local/share/com.tauri-starter.app/app.db`
- **Windows:** `%APPDATA%\com.tauri-starter.app\app.db`

**Note:** This path is user-specific and persistent across app updates.

---

## Styling

### Approach

This starter uses **CSS Modules** for styling:

```tsx
// Component
import styles from "./TodoList.module.css";

export function TodoList() {
  return <div className={styles.container}>...</div>;
}
```

```css
/* TodoList.module.css */
.container {
  padding: 2rem;
}
```

**Why CSS Modules?**
- ✅ Scoped styles (no global conflicts)
- ✅ Type-safe (with TypeScript)
- ✅ No runtime overhead
- ✅ Works with Next.js static export

### Alternative: Tailwind CSS

To use Tailwind instead:

1. Install: `bun add -D tailwindcss postcss autoprefixer`
2. Run: `bunx tailwindcss init -p`
3. Configure `tailwind.config.js`
4. Import in `globals.css`

---

## IPC Commands

### Defining Commands (Rust)

```rust
// src-tauri/src/db.rs
#[tauri::command]
pub async fn execute_sql(
    sql: String,
    params: Vec<Value>
) -> Result<QueryResult, String> {
    // Implementation
}
```

### Registering Commands (Rust)

```rust
// src-tauri/src/lib.rs
.invoke_handler(tauri::generate_handler![
    db::execute_sql,
    db::execute_batch,
    db::init_database,
])
```

### Calling Commands (TypeScript)

```ts
import { invoke } from "@tauri-apps/api/core";

const result = await invoke("execute_sql", {
  sql: "SELECT * FROM todos",
  params: [],
});
```

---

## Error Handling

### Frontend

```tsx
try {
  await db.insert(todos).values(newTodo);
} catch (error) {
  console.error("Failed to add todo:", error);
  setError("Failed to add todo");
}
```

### Backend

```rust
#[tauri::command]
pub async fn execute_sql(...) -> Result<QueryResult, String> {
    match perform_query() {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("Query failed: {}", e)),
    }
}
```

**Best practices:**
- Always handle errors (don't silently fail)
- Log errors for debugging
- Show user-friendly messages
- Don't expose sensitive details in error messages

---

## Testing

### Unit Tests

```bash
# TypeScript tests
bun test

# Rust tests
cargo test --manifest-path src-tauri/Cargo.toml
```

### E2E Tests

```bash
bun test tests/e2e/
```

See `../../tests/README.md` for detailed testing guide.

---

## Performance

### Bundle Size

Monitor Next.js bundle size:

```bash
bun run build
# Check out/.next/stats.json
```

### Startup Time

Profile app startup:

```rust
// src-tauri/src/lib.rs
.setup(|app| {
    let start = std::time::Instant::now();
    // ... initialization
    println!("Startup took: {:?}", start.elapsed());
    Ok(())
})
```

### Database Performance

- Use indexes for frequently queried columns
- Batch operations when possible
- Avoid N+1 queries

---

## Security

### IPC Security

Tauri IPC is secure by default:

- ✅ Commands must be explicitly registered
- ✅ No remote code execution
- ✅ Sandboxed frontend

### Database Security

- ✅ No SQL injection (parameterized queries)
- ✅ No direct file access from frontend
- ✅ Database in user-specific directory

### Additional Hardening

```json
// tauri.conf.json
{
  "app": {
    "security": {
      "csp": "default-src 'self'",
      "dangerousRemoteDomainIpcAccess": []
    }
  }
}
```

---

## Common Issues

### 1. "Tauri runtime not available"

**Cause:** Trying to use Tauri APIs in Next.js dev mode.

**Solution:** Only use Tauri APIs in `tauri:dev` mode:

```ts
if (typeof window !== "undefined" && "__TAURI__" in window) {
  // Safe to use Tauri APIs
}
```

### 2. "Failed to load module"

**Cause:** Incorrect import paths.

**Solution:** Use TypeScript path aliases:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. "Database not found"

**Cause:** Database not initialized.

**Solution:** Ensure `initializeDatabase()` is called before queries.

### 4. "Build fails on Windows"

**Cause:** Missing Visual Studio C++ Build Tools.

**Solution:** Install from Visual Studio installer.

---

## Deployment

### Building for Distribution

```bash
bun run tauri:build
```

### Code Signing

#### macOS

```bash
# Generate certificate
codesign --sign "Developer ID Application: Your Name" \
  src-tauri/target/release/bundle/macos/Tauri\ Starter.app
```

#### Windows

Use `signtool.exe` with a code signing certificate.

### Auto-Updates

Tauri supports auto-updates via GitHub releases:

1. Configure `updater` in `tauri.conf.json`
2. Publish releases to GitHub
3. App checks for updates on startup

See: https://v2.tauri.app/plugin/updater/

---

## Extending This App

### Adding a New Page

1. Create `app/settings/page.tsx`:

```tsx
export default function Settings() {
  return <div>Settings Page</div>;
}
```

2. Link to it:

```tsx
import Link from "next/link";

<Link href="/settings">Settings</Link>
```

### Adding a New Database Table

1. Define schema in `packages/db/schema/`:

```ts
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});
```

2. Generate migration:

```bash
bun run db:generate
```

3. Migration auto-applies on next app start.

### Adding a New Tauri Command

1. Define in `src-tauri/src/`:

```rust
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

2. Register in `lib.rs`:

```rust
.invoke_handler(tauri::generate_handler![greet])
```

3. Call from frontend:

```ts
const greeting = await invoke("greet", { name: "World" });
```

---

## Resources

### Official Documentation

- [Tauri v2 Docs](https://v2.tauri.app/)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)

### Community

- [Tauri Discord](https://discord.gg/tauri)
- [GitHub Discussions](https://github.com/tauri-apps/tauri/discussions)

### Examples

- [Tauri Examples](https://github.com/tauri-apps/tauri/tree/dev/examples)
- [Awesome Tauri](https://github.com/tauri-apps/awesome-tauri)

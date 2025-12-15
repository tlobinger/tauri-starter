# Desktop App (`@tauri-starter/desktop`)

Short guide for the actual app in `apps/desktop/`.

### What this app is
- **UI**: Next.js App Router in static export mode (`output: "export"`)
- **Runtime**: Tauri v2 (Rust) hosting the WebView
- **DB**: SQLite via `@tauri-apps/plugin-sql` (called from TypeScript)

### Folder map (the parts you’ll touch most)
- `app/`: routes (`page.tsx`, `layout.tsx`, `error.tsx`, `global-error.tsx`)
- `src/components/`: UI components (e.g. `TodoList.tsx`)
- `src/stores/`: Zustand stores wired to app services (e.g. `todoStore.ts`)
- `src/hooks/`: reusable hooks (`useLoadingState`, `useDebounce`, etc.)
- `src/contexts/`: app-wide providers (`ThemeContext`, `ErrorContext`)
- `src/lib/`: shared utilities (`db.ts`, `ipc.ts`)
- `src-tauri/`: Rust backend (`src/lib.rs`, `src/commands/*`)

### How data flows
1. UI calls Drizzle (`db.select().from(todos)...`)
2. Drizzle executes via a sqlite-proxy adapter that uses `@tauri-apps/plugin-sql`
3. Rust only provides lightweight app setup + a small IPC command (`init_database`)

### Commands
From repo root:

```bash
bun install
bun run tauri:dev
bun run tauri:build
```

### Notes (things that trip people up)
- **No server features**: no API routes, no server actions, no SSR. Everything runs client-side.
- **Error handling**:
  - Route level: `app/error.tsx`, `app/global-error.tsx`
  - Component level: `src/components/ErrorBoundary.tsx`
- **Bundle analysis**: `ANALYZE=true bun run build --filter @tauri-starter/desktop`


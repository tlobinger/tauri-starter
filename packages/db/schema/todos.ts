import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Todos table schema
 *
 * Design decisions:
 * - `id`: text (UUID/ULID) instead of auto-increment for sync-readiness
 * - `completed`: boolean stored as integer (0/1) for SQLite compatibility
 * - `createdAt` / `updatedAt`: timestamps for audit trail and sync
 *
 * This schema is designed to be sync-ready from day one, even if sync
 * is not immediately implemented.
 */
export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;

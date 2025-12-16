import { todos } from "@tauri-starter/db/schema";
import { createTodoStore, type TodoItem, type TodoRepository } from "@tauri-starter/store";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";

const repo: TodoRepository = {
  list: async (): Promise<TodoItem[]> => {
    // Drizzle typing can be less precise across package boundaries in Next builds.
    // We normalize here so the store package stays strongly typed.
    const rows = await db.select().from(todos).all();
    return rows as unknown as TodoItem[];
  },

  add: async (title: string): Promise<TodoItem> => {
    const now = new Date();
    const created: TodoItem = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(todos).values(created);
    return created;
  },

  toggle: async (id: string, completed: boolean): Promise<void> => {
    await db
      .update(todos)
      .set({
        completed: !completed,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, id));
  },

  remove: async (id: string): Promise<void> => {
    await db.delete(todos).where(eq(todos.id, id));
  },
};

export const useTodoStore = createTodoStore(repo);

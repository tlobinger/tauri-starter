import { createTodoStore } from "@tauri-starter/store";
import { db } from "@/lib/db";
import { todos } from "@tauri-starter/db/schema";
import { eq } from "drizzle-orm";

export const useTodoStore = createTodoStore({
  list: async () => {
    return await db.select().from(todos).all();
  },

  add: async (title: string) => {
    const now = new Date();
    const created = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(todos).values(created);
    return created;
  },

  toggle: async (id: string, completed: boolean) => {
    await db
      .update(todos)
      .set({
        completed: !completed,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, id));
  },

  remove: async (id: string) => {
    await db.delete(todos).where(eq(todos.id, id));
  },
});



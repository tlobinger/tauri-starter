"use client";

import { type Todo, db } from "@/lib/db";
import { todos } from "@tauri-starter/db/schema";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import styles from "./TodoList.module.css";

/**
 * Generate a simple UUID v4
 * In production, consider using a library like `uuid` or `ulid`
 */
function generateId(): string {
  return crypto.randomUUID();
}

export function TodoList() {
  const [items, setItems] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load todos on mount
  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      setLoading(true);
      setError(null);
      const result = await db.select().from(todos).all();
      setItems(result);
    } catch (err) {
      console.error("Failed to load todos:", err);
      setError("Failed to load todos");
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();

    const title = newTitle.trim();
    if (!title) return;

    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const newTodo = {
        id: generateId(),
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(todos).values(newTodo);

      setNewTitle("");
      await loadTodos();
    } catch (err) {
      console.error("Failed to add todo:", err);
      setError("Failed to add todo");
    } finally {
      setLoading(false);
    }
  }

  async function toggleTodo(id: string, completed: boolean) {
    try {
      setLoading(true);
      setError(null);

      await db
        .update(todos)
        .set({
          completed: !completed,
          updatedAt: new Date(),
        })
        .where(eq(todos.id, id));

      await loadTodos();
    } catch (err) {
      console.error("Failed to toggle todo:", err);
      setError("Failed to update todo");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTodo(id: string) {
    try {
      setLoading(true);
      setError(null);

      await db.delete(todos).where(eq(todos.id, id));

      await loadTodos();
    } catch (err) {
      console.error("Failed to delete todo:", err);
      setError("Failed to delete todo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={addTodo} className={styles.form}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What needs to be done?"
          className={styles.input}
          disabled={loading}
        />
        <button type="submit" className={styles.addButton} disabled={loading || !newTitle.trim()}>
          {loading ? "..." : "Add"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {items.length === 0 && !loading && (
        <div className={styles.empty}>
          <p>No todos yet. Add one above to get started!</p>
        </div>
      )}

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <label className={styles.todoLabel}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleTodo(item.id, item.completed)}
                disabled={loading}
                className={styles.checkbox}
              />
              <span className={item.completed ? styles.completed : ""}>{item.title}</span>
            </label>
            <button
              type="button"
              onClick={() => deleteTodo(item.id)}
              className={styles.deleteButton}
              disabled={loading}
              aria-label="Delete todo"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <div className={styles.stats}>
          <span>
            {items.filter((item) => !item.completed).length} of {items.length} remaining
          </span>
        </div>
      )}
    </div>
  );
}

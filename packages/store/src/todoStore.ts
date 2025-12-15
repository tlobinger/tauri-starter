import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface TodoRepository {
  list: () => Promise<TodoItem[]>;
  add: (title: string) => Promise<TodoItem>;
  toggle: (id: string, completed: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export interface TodoStoreState {
  items: TodoItem[];
  isLoading: boolean;
  error: string | null;

  loadTodos: () => Promise<void>;
  addTodo: (title: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Creates a zustand store for Todos. The data access is injected via `repo`
 * so this package stays reusable (it doesn't import your app's DB directly).
 */
export function createTodoStore(repo: TodoRepository) {
  return create<TodoStoreState>()(
    subscribeWithSelector((set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      loadTodos: async () => {
        set({ isLoading: true, error: null });
        try {
          const items = await repo.list();
          set({ items, isLoading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Failed to load todos",
            isLoading: false,
          });
        }
      },

      addTodo: async (title: string) => {
        const trimmed = title.trim();
        if (!trimmed) return;

        set({ isLoading: true, error: null });
        try {
          const created = await repo.add(trimmed);
          // Optimistic-ish: append created item, then rely on future `loadTodos`
          set({ items: [created, ...get().items], isLoading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Failed to add todo",
            isLoading: false,
          });
        }
      },

      toggleTodo: async (id: string) => {
        const current = get().items.find((t) => t.id === id);
        if (!current) return;

        // Optimistic update
        const prev = get().items;
        set({
          items: prev.map((t) =>
            t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date() } : t
          ),
          error: null,
        });

        try {
          await repo.toggle(id, current.completed);
        } catch (err) {
          // Roll back
          set({
            items: prev,
            error: err instanceof Error ? err.message : "Failed to update todo",
          });
        }
      },

      deleteTodo: async (id: string) => {
        const prev = get().items;
        set({ items: prev.filter((t) => t.id !== id), error: null });
        try {
          await repo.remove(id);
        } catch (err) {
          // Roll back
          set({
            items: prev,
            error: err instanceof Error ? err.message : "Failed to delete todo",
          });
        }
      },
    }))
  );
}



import { useCallback, useEffect } from "react";
import { useTodoStore } from "@/stores/todoStore";

/**
 * Convenience hook around the Todo store.
 *
 * Why have this if we already have Zustand selectors?
 * - Gives you one “standard” API to use in components.
 * - Easy place to add derived helpers later (filters, counts, etc.).
 */
export function useTodos() {
  const items = useTodoStore((s) => s.items);
  const isLoading = useTodoStore((s) => s.isLoading);
  const error = useTodoStore((s) => s.error);
  const loadTodos = useTodoStore((s) => s.loadTodos);
  const addTodo = useTodoStore((s) => s.addTodo);
  const toggleTodo = useTodoStore((s) => s.toggleTodo);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);
  const clearError = useTodoStore((s) => s.clearError);

  // optional: auto-load on first use
  useEffect(() => {
    if (items.length === 0) {
      void loadTodos();
    }
  }, [items.length, loadTodos]);

  return {
    items,
    isLoading,
    error,
    clearError,
    loadTodos,
    addTodo: useCallback((title: string) => addTodo(title), [addTodo]),
    toggleTodo: useCallback((id: string) => toggleTodo(id), [toggleTodo]),
    deleteTodo: useCallback((id: string) => deleteTodo(id), [deleteTodo]),
  };
}

"use client";

import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Field, Label } from "./ui/fieldset";
import clsx from "clsx";
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";
import { useTodoStore } from "@/stores/todoStore";

export function TodoList() {
  const [newTitle, setNewTitle] = useState("");
  const items = useTodoStore((s) => s.items);
  const loading = useTodoStore((s) => s.isLoading);
  const error = useTodoStore((s) => s.error);
  const loadTodos = useTodoStore((s) => s.loadTodos);
  const addTodo = useTodoStore((s) => s.addTodo);
  const toggleTodo = useTodoStore((s) => s.toggleTodo);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);
  const clearError = useTodoStore((s) => s.clearError);

  // Load todos on mount
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();

    const title = newTitle.trim();
    if (!title) return;

    await addTodo(title);
    setNewTitle("");
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-prose mx-auto">
      <form onSubmit={addTodo} className="flex items-center gap-2">
        <Input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What needs to be done?"
          disabled={loading}
          autoFocus={true}
        />
        <Button type="submit" disabled={loading || !newTitle.trim()}>
          Add
        </Button>
      </form>

      {error && (
        <div
          className="rounded-lg bg-red-50 p-4 ring-1 ring-red-500/20 dark:bg-red-900/20 dark:ring-red-500/30"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <svg
                className="size-5 text-red-600 dark:text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">Error</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="shrink-0 rounded-md p-1 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:text-red-400 dark:hover:bg-red-900/30"
              aria-label="Dismiss error"
            >
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <Spinner size="lg" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading todos...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-zinc-500 dark:text-zinc-400">
            No todos yet. Add one above to get started!
          </p>
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 justify-between p-2">
            <Field className="flex items-center gap-2">
              <Checkbox
                id={item.id}
                name={item.id}
                checked={item.completed}
                onChange={() => toggleTodo(item.id)}
                disabled={loading}
              />
              <Label htmlFor={item.id} className={clsx(item.completed && "line-through")}>
                {item.title}
              </Label>
            </Field>

            <Button
              plain
              onClick={() => deleteTodo(item.id)}
              disabled={loading}
              aria-label="Delete todo"
            >
              ✕
            </Button>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <div className="flex justify-end">
          <Badge color="zinc" className="text-sm">
            {items.filter((item) => !item.completed).length} of {items.length} remaining
          </Badge>
        </div>
      )}
    </div>
  );
}

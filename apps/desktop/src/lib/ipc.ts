import { invoke } from "@tauri-apps/api/core";

/**
 * Convert `unknown` errors into a consistent `Error`.
 *
 * Why?
 * - In TS, `catch` gets `unknown`.
 * - Normalizing errors in one place prevents copy/paste `instanceof Error` checks.
 */
export function toError(err: unknown, fallbackMessage = "Unexpected error"): Error {
  if (err instanceof Error) return err;
  const message = typeof err === "string" ? err : fallbackMessage;
  return new Error(message);
}

/**
 * Typed wrapper around Tauri `invoke`.
 *
 * Why?
 * - Central place to add logging, timing, error mapping, etc.
 * - Keeps UI code cleaner (no direct invoke scattered everywhere).
 */
export async function ipcInvoke<TResponse>(
  command: string,
  payload?: Record<string, unknown>
): Promise<TResponse> {
  try {
    return await invoke<TResponse>(command, payload);
  } catch (err) {
    throw toError(err, `Failed to invoke '${command}'`);
  }
}



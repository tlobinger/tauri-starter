export type ErrorContext = Record<string, unknown>;

/**
 * Central place to log errors.
 *
 * Why?
 * - In a larger app you may want to send errors to a service (Sentry, PostHog, etc.)
 * - Keeping it in one file prevents console logging from being scattered everywhere.
 */
export function logError(error: unknown, context: ErrorContext = {}) {
  // Basic normalization
  const message = error instanceof Error ? error.message : String(error);
  console.error("[error]", message, { error, ...context });
}



// Client-safe admin constants (no server-only imports), so Client Components
// like the set-password form can reference them without pulling in server code.

/** Minimum length for an admin-chosen password. */
export const MIN_PASSWORD_LENGTH = 8;

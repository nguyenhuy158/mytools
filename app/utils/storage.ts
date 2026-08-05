
export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(value: unknown): string {
  try {
    // JSON.stringify returns undefined — not a string — for undefined,
    // functions and symbols, so normalize those to "" as well.
    return JSON.stringify(value) ?? "";
  } catch {
    return "";
  }
}

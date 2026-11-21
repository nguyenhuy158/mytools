export function countMessage(count: number): string {
  return JSON.stringify({ type: "count", count });
}

export function replyTo(raw: string | ArrayBuffer): string | null {
  if (typeof raw !== "string") return null;
  try {
    const data = JSON.parse(raw);
    return data?.type === "ping" ? JSON.stringify({ type: "pong" }) : null;
  } catch {
    return null;
  }
}

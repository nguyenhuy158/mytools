/**
 * Pure helpers behind the /projects page, kept out of the route so they can be
 * tested without rendering or network access.
 */
import type { Project } from "../data/projects";

export interface ProjectStatus {
  id: string;
  /** null when the check was skipped or has not run yet. */
  online: boolean | null;
  /** Round-trip time in ms, null when unknown. */
  ms: number | null;
  /** HTTP status when reached. */
  httpStatus?: number;
  /** Populated when the fetch failed outright. */
  error?: string;
}

export interface StatusSummary {
  total: number;
  checked: number;
  online: number;
  offline: number;
  /** Median, not mean — one slow site should not skew the headline number. */
  medianMs: number | null;
}

/** Aggregate the per-site checks into the numbers shown in the header. */
export function summarize(statuses: ProjectStatus[]): StatusSummary {
  const checked = statuses.filter((s) => s.online !== null);
  const times = checked
    .map((s) => s.ms)
    .filter((ms): ms is number => typeof ms === "number")
    .sort((a, b) => a - b);

  return {
    total: statuses.length,
    checked: checked.length,
    online: checked.filter((s) => s.online === true).length,
    offline: checked.filter((s) => s.online === false).length,
    medianMs: median(times),
  };
}

function median(sorted: number[]): number | null {
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/** Hostname without the www. prefix, for display under the project name. */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Up to two letters for the generated preview tile. */
export function initials(name: string): string {
  const words = name
    .split(/[\s\-_]+/u)
    .map((w) => Array.from(w)[0])
    .filter(Boolean);
  if (words.length === 0) return "?";
  return (words.length === 1 ? words[0] : words[0] + words[1]).toUpperCase();
}

/** Live first, then work-in-progress, then archived; newest first within each. */
export function sortForDisplay(projects: Project[]): Project[] {
  const rank = { live: 0, wip: 1, archived: 2 } as const;
  return [...projects].sort(
    (a, b) =>
      rank[a.status] - rank[b.status] ||
      (b.since ?? "").localeCompare(a.since ?? "") ||
      a.name.localeCompare(b.name),
  );
}

/** Coarse buckets so the UI can colour a latency without magic numbers. */
export function latencyBand(ms: number | null): "fast" | "ok" | "slow" | null {
  if (ms === null) return null;
  if (ms < 300) return "fast";
  if (ms < 1000) return "ok";
  return "slow";
}

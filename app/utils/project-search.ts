/**
 * Search, filter and pagination for the /projects page.
 *
 * Pure functions, so the behaviour is testable without rendering — and so the
 * page component stays about layout.
 */
import type { Project } from "../data/projects";
import { displayHost } from "./project-stats";

export type StatusFilter = "all" | Project["status"];

export const PER_PAGE = 6;

/**
 * Lowercase and strip diacritics, so "cham cong" finds "Chấm công" and
 * "PORTFOLIO" finds "My Portfolio". Vietnamese users routinely type without
 * tones, and an exact-match search would look broken to them.
 */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    // Combining diacritical marks: written as escapes so the source stays
    // readable and cannot be mangled by an editor normalizing the file.
    .replace(/[\u0300-\u036f]/g, "")
    // đ/Đ carry no combining mark, so NFD leaves them alone.
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
}

/** Everything a query is matched against, flattened into one haystack. */
function haystack(project: Project): string {
  return normalize(
    [
      project.name,
      project.tagline,
      project.description,
      displayHost(project.url),
      project.tech.join(" "),
      (project.highlights ?? []).join(" "),
      project.since ?? "",
    ].join(" "),
  );
}

/**
 * Match every whitespace-separated term, in any order, so "bingo team" and
 * "team bingo" both work.
 */
export function matchesQuery(project: Project, query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const hay = haystack(project);
  return terms.every((term) => hay.includes(term));
}

export function filterProjects(
  projects: Project[],
  query: string,
  status: StatusFilter,
): Project[] {
  return projects.filter(
    (p) =>
      (status === "all" || p.status === status) && matchesQuery(p, query),
  );
}

/** How many projects sit in each status, for the filter chip counts. */
export function statusCounts(
  projects: Project[],
): Record<StatusFilter, number> {
  const counts: Record<StatusFilter, number> = {
    all: projects.length,
    live: 0,
    wip: 0,
    archived: 0,
  };
  for (const p of projects) counts[p.status]++;
  return counts;
}

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
}

/**
 * Clamp the page into range rather than showing an empty list: a stale ?page=9
 * in a shared link should land on the last page, not on nothing.
 */
export function paginate<T>(
  items: T[],
  page: number,
  perPage = PER_PAGE,
): Page<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (current - 1) * perPage;
  const slice = items.slice(start, start + perPage);

  return {
    items: slice,
    page: current,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: start + slice.length,
  };
}

/**
 * Page numbers to render, with `null` marking a gap. Keeps the control a fixed
 * width however many pages there are.
 */
export function pageWindow(
  current: number,
  totalPages: number,
  span = 1,
): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, current]);
  for (let offset = 1; offset <= span; offset++) {
    if (current - offset > 1) pages.add(current - offset);
    if (current + offset < totalPages) pages.add(current + offset);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) out.push(null);
    out.push(page);
    previous = page;
  }
  return out;
}

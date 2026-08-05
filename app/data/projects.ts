/**
 * The showcase list behind /projects.
 *
 * Rows live in the `projects` table of the shared D1 database (binding `DB`,
 * database `db`). Add, rename or retire a product by editing that table —
 * both the page and the live status check load from `loadProjects`.
 */

export interface Project {
  /** Stable id; also the key used by the live status endpoint. */
  id: string;
  name: string;
  /** Public URL. Must be absolute — it is fetched for the status check. */
  url: string;
  /** One line on what it does, shown on the card. */
  tagline: string;
  /** A few sentences of detail, shown under the tagline. */
  description: string;
  /** Shown as pills on the card. */
  tech: string[];
  /** Optional screenshot/preview image. Falls back to a generated tile. */
  image?: string;
  /**
   * URL to screenshot, when `url` itself renders nothing useful — e.g. an
   * index page that only redirects. Capture only; the card still links to
   * `url` and the uptime check still pings `url`.
   */
  shotUrl?: string;
  /** Tailwind gradient classes for the fallback tile. */
  accent: string;
  /** Rough state, so retired work can stay listed honestly. */
  status: "live" | "wip" | "archived";
  /** Year work started, for the timeline ordering. */
  since?: string;
  /** Hand-maintained highlights, e.g. "21 pages", "5k+ users". */
  highlights?: string[];
  /** Skip the uptime ping for sites that block it. */
  skipStatusCheck?: boolean;
}

interface ProjectRow {
  id: string;
  name: string;
  url: string;
  tagline: string;
  description: string;
  tech: string;
  image: string | null;
  shot_url: string | null;
  accent: string;
  status: string;
  since: string | null;
  highlights: string | null;
  skip_status_check: number;
  sort_order: number;
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    tagline: row.tagline,
    description: row.description,
    tech: JSON.parse(row.tech),
    image: row.image ?? undefined,
    shotUrl: row.shot_url ?? undefined,
    accent: row.accent,
    status: row.status as Project["status"],
    since: row.since ?? undefined,
    highlights: row.highlights ? JSON.parse(row.highlights) : undefined,
    skipStatusCheck: row.skip_status_check === 1,
  };
}

/** Reads every project from D1, in the hand-picked display order. */
export async function loadProjects(db: D1Database): Promise<Project[]> {
  const { results } = await db
    .prepare("SELECT * FROM projects ORDER BY sort_order")
    .all<ProjectRow>();
  return results.map(rowToProject);
}

/**
 * Placeholder entry, shown only in docs/tests — never invented numbers or
 * fake products on the page itself. Insert a real row into the `projects`
 * table in D1 to add a product.
 */
export const PROJECT_TEMPLATE: Project = {
  id: "ten-du-an",
  name: "Tên dự án",
  url: "https://example.com",
  tagline: "Một câu nói dự án này làm gì",
  description: "Vài câu mô tả chi tiết hơn: giải quyết vấn đề gì, cho ai.",
  tech: ["Tech 1", "Tech 2"],
  accent: "from-emerald-500 to-teal-600",
  status: "live",
  since: "2026",
  highlights: [],
};

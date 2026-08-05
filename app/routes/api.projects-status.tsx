/**
 * Live uptime check for the /projects showcase.
 *
 * Pings every project in app/data/projects.ts and reports whether it answered
 * and how long it took. The response is cached at the edge so opening the page
 * repeatedly does not hammer the listed sites.
 */
import { PROJECTS } from "../data/projects";
import type { ProjectStatus } from "../utils/project-stats";
import { summarize } from "../utils/project-stats";

/** Give up on a site after this long; a slow site is reported, not fatal. */
const TIMEOUT_MS = 8000;

/** Edge cache lifetime. Shorter than this and the check adds no value. */
const CACHE_SECONDS = 300;

/**
 * Ping one site. `fetchImpl` is injectable so tests can drive the timing and
 * failure paths without network access.
 */
export async function check(
  url: string,
  id: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ProjectStatus> {
  const started = Date.now();
  // AbortController rather than AbortSignal.timeout: the latter is missing in
  // some JS runtimes, and this way the timer can be cleared once settled.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        // Identify the pinger so site owners can see what this traffic is.
        "user-agent": "ToolHub-status-check (+https://huyab.click/projects)",
      },
    });
    // The body is never read — status and timing are all that is needed.
    return {
      id,
      online: res.ok,
      ms: Date.now() - started,
      httpStatus: res.status,
    };
  } catch (error) {
    // Keep the message, not just the name: a bare "Error" says nothing when
    // diagnosing why a site looks down (TLS, DNS, timeout all land here).
    return {
      id,
      online: false,
      ms: null,
      error:
        error instanceof Error
          ? `${error.name}: ${error.message}`.slice(0, 200)
          : "fetch failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function loader() {
  const statuses = await Promise.all(
    PROJECTS.map((p) =>
      p.skipStatusCheck
        ? Promise.resolve<ProjectStatus>({ id: p.id, online: null, ms: null })
        : check(p.url, p.id),
    ),
  );

  return new Response(
    JSON.stringify({
      checkedAt: new Date().toISOString(),
      summary: summarize(statuses),
      statuses,
    }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": `public, max-age=60, s-maxage=${CACHE_SECONDS}`,
      },
    },
  );
}

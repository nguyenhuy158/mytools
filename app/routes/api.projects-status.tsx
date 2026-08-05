/**
 * Live uptime check for the /projects showcase.
 *
 * Pings every project in app/data/projects.ts and reports whether it answered
 * and how long it took. The response is cached at the edge so opening the page
 * repeatedly does not hammer the listed sites.
 */
import { loadProjects } from "../data/projects";
import type { ProjectStatus } from "../utils/project-stats";
import { summarize } from "../utils/project-stats";
import type { Route } from "./+types/api.projects-status";

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

/**
 * A Worker fetching its own zone loops back through Cloudflare and times out
 * with a 522, which would report this very site as down. Serving this request
 * already proves it is up, so answer for the same host without a fetch.
 */
export function isSameHost(target: string, requestUrl: string): boolean {
  try {
    return new URL(target).hostname === new URL(requestUrl).hostname;
  } catch {
    return false;
  }
}

/** Last two labels of a hostname: huyab.click for tc.huyab.click. */
function apexOf(hostname: string): string {
  return hostname.split(".").slice(-2).join(".");
}

/**
 * Same Cloudflare zone as the site serving this request. Fetching a sibling
 * hostname on the same zone can loop back and fail even while the site is
 * perfectly reachable from outside, so such a failure proves nothing.
 */
export function isSameZone(target: string, requestUrl: string): boolean {
  try {
    return (
      apexOf(new URL(target).hostname) === apexOf(new URL(requestUrl).hostname)
    );
  } catch {
    return false;
  }
}

/** Cloudflare's own origin-unreachable codes, not the site's own answer. */
const LOOPBACK_CODES = new Set([520, 521, 522, 523, 524, 525, 526, 527]);

/**
 * chat.huyab.click answers 200 to the outside world but 522 to a fetch from
 * this Worker. Reporting that as "Offline" would be a lie about someone's
 * site, so a Cloudflare 52x from a same-zone host is recorded as unknown.
 */
export function reconcileSameZone(
  status: ProjectStatus,
  target: string,
  requestUrl: string,
): ProjectStatus {
  if (status.online !== false) return status;
  if (!status.httpStatus || !LOOPBACK_CODES.has(status.httpStatus)) return status;
  if (!isSameZone(target, requestUrl)) return status;
  return {
    id: status.id,
    online: null,
    ms: null,
    error: `same-zone loopback (HTTP ${status.httpStatus})`,
  };
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  const projects = await loadProjects(env.DB);
  const statuses = await Promise.all(
    projects.map((p): Promise<ProjectStatus> => {
      if (p.skipStatusCheck) {
        return Promise.resolve({ id: p.id, online: null, ms: null });
      }
      if (isSameHost(p.url, request.url)) {
        return Promise.resolve({ id: p.id, online: true, ms: null, self: true });
      }
      return check(p.url, p.id).then((s) =>
        reconcileSameZone(s, p.url, request.url),
      );
    }),
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

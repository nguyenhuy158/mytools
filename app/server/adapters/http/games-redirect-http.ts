import { gamesRedirectTarget } from "../../core/domain/games";

const PERMANENT_REDIRECT = 301;

// The games moved to their own app. Old /games/* links (bookmarks, search
// results, shared loto room links) get a permanent redirect to the matching
// page there; anything unknown lands on the games hub.
export function gamesRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const target = gamesRedirectTarget(url.pathname, url.search);
  return target === null ? null : Response.redirect(target, PERMANENT_REDIRECT);
}

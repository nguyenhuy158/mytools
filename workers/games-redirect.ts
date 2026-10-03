import { GAME_PATHS, GAMES_URL } from "../app/utils/games";

// The games moved to their own app. Old /games/* links (bookmarks, search
// results, shared loto room links) get a permanent redirect to the matching
// page there; anything unknown lands on the games hub.
export function gamesRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const [head, game, ...rest] = url.pathname.split("/").filter(Boolean);
  if (head?.toLowerCase() !== "games") return null;

  const target =
    rest.length === 0 && game !== undefined
      ? (GAME_PATHS[game.toLowerCase()] ?? "/")
      : "/";
  return Response.redirect(`${GAMES_URL}${target}${url.search}`, 301);
}

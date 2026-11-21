/** The games live in their own app; ToolHub only links there. */
export const GAMES_URL = "https://games.huyab.cfd";

/** Old ToolHub `/games/<slug>` → page path on {@link GAMES_URL}. */
export const GAME_PATHS: Record<string, string> = {
  "2048": "/2048/",
  sudoku: "/sudoku/",
  minesweeper: "/do-min/",
  snake: "/nokia/snake/",
  tetris: "/tetris/",
  loto: "/loto/",
};

export function gamesRedirectTarget(
  pathname: string,
  search: string,
): string | null {
  const [head, game, ...rest] = pathname.split("/").filter(Boolean);
  if (head?.toLowerCase() !== "games") return null;

  const slug = game?.toLowerCase();
  const target =
    rest.length === 0 && slug !== undefined && Object.hasOwn(GAME_PATHS, slug)
      ? GAME_PATHS[slug]
      : "/";
  return `${GAMES_URL}${target}${search}`;
}

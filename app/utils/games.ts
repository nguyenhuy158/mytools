/** The games live in their own app; ToolHub only links there. */
export const GAMES_URL = "https://games.huyab.click";

/** Old ToolHub `/games/<slug>` → page path on {@link GAMES_URL}. */
export const GAME_PATHS: Record<string, string> = {
  "2048": "/2048/",
  sudoku: "/sudoku/",
  minesweeper: "/do-min/",
  snake: "/nokia/snake/",
  tetris: "/tetris/",
  loto: "/loto/",
};

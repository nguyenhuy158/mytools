import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // API Routes
  route("api/notes", "routes/api.notes.tsx"),
  route("api/notes/:id", "routes/api.notes_.$id.tsx"),
  // UI Routes
  route("it", "routes/it.tsx", [
    index("routes/it-home.tsx"),
    route("json-tools", "routes/json-tools.tsx"),
    route("text-diff", "routes/text-diff.tsx"),
    route("markdown-preview", "routes/it/markdown-preview.tsx"),
    route("image-tools", "routes/it/image-tools.tsx"),
    route("api-tester", "routes/it/api-tester.tsx"),
    route("number-reading", "routes/it/number-reading.tsx"),
    route("odoo-inspector", "routes/it/odoo-inspector.tsx"),
    route("notes", "routes/it/notes.tsx"),
  ]),
  route("lifestyle", "routes/lifestyle.tsx", [
    index("routes/lifestyle-home.tsx"),
    route("pomodoro", "routes/pomodoro.tsx"),
    route("quotes", "routes/quotes.tsx"),
  ]),
  route("calendar", "routes/calendar.tsx"),
  route("about", "routes/about.tsx"),
  route("games", "routes/games.tsx", [
    index("routes/games-home.tsx"),
    route("2048", "routes/2048.tsx"),
    route("snake", "routes/snake.tsx"),
    route("minesweeper", "routes/minesweeper.tsx"),
    route("tetris", "routes/games/tetris.tsx"),
    route("sudoku", "routes/games/sudoku.tsx"),
  ]),
] satisfies RouteConfig;

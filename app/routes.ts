import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // API Routes
  route("api/notes", "routes/api.notes.tsx"),
  route("api/notes/:id", "routes/api.notes_.$id.tsx"),
  route("api/loto/create-room", "routes/api.loto.create-room.tsx"),
  route("api/loto/room/:roomId/ws", "routes/api.loto.room.$roomId.ws.tsx"),
  route("api/online-counter/ws", "routes/api.online-counter.ws.tsx"),
  route("api/holidays", "routes/api.holidays.tsx"),
  route("api/projects-status", "routes/api.projects-status.tsx"),
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
    route("transformers", "routes/it/transformers.tsx"),
    route("pdf-tools", "routes/it/pdf-tools.tsx"),
  ]),
  route("lifestyle", "routes/lifestyle.tsx", [
    index("routes/lifestyle-home.tsx"),
    route("pomodoro", "routes/pomodoro.tsx"),
    route("quotes", "routes/quotes.tsx"),
  ]),
  route("calendar", "routes/calendar.tsx"),
  route("projects", "routes/projects.tsx"),
  route("about", "routes/about.tsx"),
  route("liquid-glass", "routes/liquid-glass.tsx"),
  route("games", "routes/games.tsx", [
    index("routes/games-home.tsx"),
    route("2048", "routes/2048.tsx"),
    route("snake", "routes/snake.tsx"),
    route("minesweeper", "routes/minesweeper.tsx"),
    route("tetris", "routes/games/tetris.tsx"),
    route("sudoku", "routes/games/sudoku.tsx"),
    route("loto", "routes/games/loto.tsx"),
  ]),
] satisfies RouteConfig;

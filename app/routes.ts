import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("it", "routes/it.tsx", [
    index("routes/it-home.tsx"),
    route("json-tools", "routes/json-tools.tsx"),
    route("text-diff", "routes/text-diff.tsx"),
  ]),
  route("lifestyle", "routes/lifestyle.tsx", [
    index("routes/lifestyle-home.tsx"),
    route("pomodoro", "routes/pomodoro.tsx"),
  ]),
  route("calendar", "routes/calendar.tsx"),
  route("about", "routes/about.tsx"),
  route("games", "routes/games.tsx", [
    index("routes/games-home.tsx"),
    route("2048", "routes/2048.tsx"),
  ]),
] satisfies RouteConfig;

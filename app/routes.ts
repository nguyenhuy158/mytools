import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("it", "routes/it.tsx", [
    index("routes/it-home.tsx"),
    route("json-tools", "routes/json-tools.tsx"),
    route("text-diff", "routes/text-diff.tsx"),
  ]),
  route("calendar", "routes/calendar.tsx"),
  route("pomodoro", "routes/pomodoro.tsx"),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;

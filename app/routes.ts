import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("json-tools", "routes/json-tools.tsx"),
  route("calendar", "routes/calendar.tsx"),
  route("text-diff", "routes/text-diff.tsx"),
  route("pomodoro", "routes/pomodoro.tsx"),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;

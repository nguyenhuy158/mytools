import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("features", "routes/features.tsx"),
  route("json-tools", "routes/json-tools.tsx"),
  route("calendar", "routes/calendar.tsx"),
  route("text-diff", "routes/text-diff.tsx"),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("features", "routes/features.tsx"),
  route("json-tools", "routes/json-tools.tsx"),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;

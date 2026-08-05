import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Every page needs a <title>. Ten routes shipped without one because their
 * module had no `meta` export — the browser tab then shows the raw URL and
 * search results have no title. This walks the real route config so a new
 * route cannot quietly repeat it.
 */

const root = process.cwd();
const routesSrc = readFileSync(join(root, "app", "routes.ts"), "utf8");

interface RouteEntry {
  urlPath: string;
  file: string;
  parentFile?: string;
  /** index() routes render at the parent's own URL. */
  isIndex?: boolean;
}

/**
 * Parse routes.ts by indentation: entries nested inside a `route(...)` that
 * opens a child array belong to that parent layout.
 */
function parseRoutes(): RouteEntry[] {
  const entries: RouteEntry[] = [];
  const stack: { file: string; indent: number }[] = [];

  for (const line of routesSrc.split("\n")) {
    const indent = line.search(/\S/);
    if (indent < 0) continue;

    while (stack.length && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];

    const routeMatch = line.match(/route\(\s*"([^"]*)",\s*"([^"]+)"/);
    const indexMatch = line.match(/index\("([^"]+)"\)/);

    if (routeMatch) {
      const [, urlPath, file] = routeMatch;
      entries.push({ urlPath, file, parentFile: parent?.file });
      // Opens a child array on the same line → it is a layout.
      if (line.includes("[")) stack.push({ file, indent });
    } else if (indexMatch) {
      entries.push({
        urlPath: parent ? `${parent.file} index` : "/",
        file: indexMatch[1],
        parentFile: parent?.file,
        isIndex: true,
      });
    }
  }

  return entries;
}

const hasMeta = (file: string): boolean => {
  const src = readFileSync(join(root, "app", file), "utf8");
  return /export\s+(const|function)\s+meta\b/.test(src);
};

const routes = parseRoutes();
/** API and WebSocket routes render no document, so they need no title. */
const pageRoutes = routes.filter(
  (r) => !r.file.includes("api.") && !r.urlPath.startsWith("api/"),
);

describe("route meta", () => {
  it("finds the route config", () => {
    expect(routes.length).toBeGreaterThan(20);
    expect(pageRoutes.length).toBeGreaterThan(15);
  });

  it.each(pageRoutes.map((r) => [r.file, r] as const))(
    "%s provides a title",
    (_file, route) => {
      // Only an index route may inherit: it renders at the layout's own URL,
      // so the layout's title is the right one. A leaf page that inherits
      // would share one generic title with every sibling — /games/snake and
      // /games/tetris both reading "Games - ToolHub" is not a fixed bug.
      const covered = route.isIndex
        ? hasMeta(route.file) ||
          (route.parentFile !== undefined && hasMeta(route.parentFile))
        : hasMeta(route.file);

      expect(
        covered,
        route.isIndex
          ? `${route.file} has no meta export, and neither does its layout ` +
            `(${route.parentFile ?? "none"})`
          : `${route.file} needs its own meta export with a distinct title`,
      ).toBe(true);
    },
  );

  it("gives every meta export a non-empty title", () => {
    for (const route of pageRoutes) {
      const src = readFileSync(join(root, "app", route.file), "utf8");
      if (!/export\s+(const|function)\s+meta\b/.test(src)) continue;
      const title = src.match(/title:\s*"([^"]*)"/);
      expect(title, `${route.file} meta has no title field`).toBeTruthy();
      expect(title![1].trim(), `${route.file} title is empty`).not.toBe("");
    }
  });
});

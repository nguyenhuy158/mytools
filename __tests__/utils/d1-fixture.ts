import { execFileSync } from "node:child_process";

/**
 * Minimal D1Database adapter over `wrangler d1 execute --remote`, so tests
 * can exercise the real `loadProjects` query against the actual `projects`
 * table instead of a hand-maintained fixture that would drift from it.
 */
export function remoteD1(databaseName: string): D1Database {
  return {
    prepare(sql: string) {
      return {
        async all<T = unknown>() {
          const output = execFileSync(
            "npx",
            [
              "wrangler",
              "d1",
              "execute",
              databaseName,
              "--remote",
              "--json",
              "--command",
              sql,
            ],
            { encoding: "utf8" },
          );
          const [{ results }] = JSON.parse(output);
          return { results: results as T[] };
        },
      };
    },
  } as unknown as D1Database;
}

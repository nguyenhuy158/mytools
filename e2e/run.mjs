// Runs the whole E2E suite in one command: build, serve the built Worker with
// `wrangler dev --local`, run the read-only smoke then the interactive smoke,
// and stop the server. `--local` turns off remote bindings (the NOTES KV is
// `remote: true` in wrangler.jsonc), so every write lands in .wrangler/state.
//
// Environment:
// - E2E_PORT: port for wrangler dev (default 8787)
// - E2E_SKIP_BUILD=1: reuse an up-to-date ./build
// - PLAYWRIGHT_CHROMIUM_PATH: use a specific Chromium
import { run, startServer } from "@huyab/e2e";

const PORT = process.env.E2E_PORT || "8787";
const BASE = `http://127.0.0.1:${PORT}`;
const suiteEnv = { E2E_BASE_URL: BASE };

if (process.env.E2E_SKIP_BUILD !== "1") {
  await run("pnpm", ["build"], { label: "build" });
}

let failed = false;
let server;
try {
  server = await startServer({
    command: "pnpm",
    args: [
      "exec",
      "wrangler",
      "dev",
      "--config",
      "build/server/wrangler.json",
      "--local",
      "--ip",
      "127.0.0.1",
      "--port",
      PORT,
    ],
    readyUrl: `${BASE}/`,
  });
  console.log(`\nServer ready at ${BASE}, running smoke suites\n`);
  await run("node", ["e2e/readonly-smoke.mjs"], {
    label: "read-only smoke",
    env: suiteEnv,
  });
  await run("node", ["e2e/ui-smoke.mjs"], {
    label: "interactive smoke",
    env: suiteEnv,
  });
} catch (error) {
  failed = true;
  console.error("E2E FAIL:", error.message);
} finally {
  await server?.stop();
}

process.exit(failed ? 1 : 0);

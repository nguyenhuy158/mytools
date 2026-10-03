// Runs the whole E2E suite in one command: build, serve the built Worker with
// `wrangler dev --local`, run the read-only smoke then the interactive smoke,
// and stop the server. `--local` turns off remote bindings (the NOTES KV is
// `remote: true` in wrangler.jsonc), so every write lands in .wrangler/state.
//
// Environment:
// - E2E_PORT: port for wrangler dev (default 8787)
// - E2E_SKIP_BUILD=1: reuse an up-to-date ./build
// - PLAYWRIGHT_CHROMIUM_PATH: use a specific Chromium
import { spawn } from "node:child_process";

const PORT = process.env.E2E_PORT || "8787";
const BASE = `http://127.0.0.1:${PORT}`;
const SERVER_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 500;

/** Runs a command to completion; rejects on a non-zero exit. */
function run(command, args, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: { ...process.env, E2E_BASE_URL: BASE },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${label} failed (exit ${code})`)),
    );
  });
}

/** Waits until the Worker serves the home page, or throws on timeout/early exit. */
async function waitForServer(child) {
  const deadline = Date.now() + SERVER_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(`wrangler dev exited early (${child.exitCode})`);
    try {
      const response = await fetch(`${BASE}/`);
      if (response.ok) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`wrangler dev not up after ${SERVER_TIMEOUT_MS}ms`);
}

if (process.env.E2E_SKIP_BUILD !== "1") {
  await run("pnpm", ["build"], "build");
}

// `detached` gives the server its own process group: `pnpm exec` adds node
// layers, and killing only the outer PID would orphan wrangler/workerd on PORT.
const server = spawn(
  "pnpm",
  [
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
  {
    stdio: ["ignore", "inherit", "inherit"],
    env: { ...process.env, CI: "1" },
    detached: true,
  },
);

/** Signals the server's whole process group (no-op once it is gone). */
function killServer(signal) {
  try {
    process.kill(-server.pid, signal);
  } catch {
    // Group already gone.
  }
}

// The detached group does not receive Ctrl-C, so clean it up ourselves.
process.once("SIGINT", () => {
  killServer("SIGKILL");
  process.exit(130);
});

let failed = false;
try {
  await waitForServer(server);
  console.log(`\nServer ready at ${BASE}, running smoke suites\n`);
  await run("node", ["e2e/readonly-smoke.mjs"], "read-only smoke");
  await run("node", ["e2e/ui-smoke.mjs"], "interactive smoke");
} catch (error) {
  failed = true;
  console.error("E2E FAIL:", error.message);
} finally {
  const exited = new Promise((resolve) =>
    server.once("exit", () => resolve(true)),
  );
  killServer("SIGTERM");
  // Give wrangler time to clean up, then make sure nothing outlives us.
  const stopped =
    server.exitCode !== null ||
    (await Promise.race([
      exited,
      new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
    ]));
  // Kill the whole group: wrangler can exit before its workerd child does.
  killServer("SIGKILL");
  if (!stopped) console.error("wrangler did not stop on SIGTERM, sent SIGKILL");
}

process.exit(failed ? 1 : 0);

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * The PWA shipped with no working offline support at all, from two separate
 * config mistakes:
 *
 *  1. vite-plugin-pwa writes into Vite's `build.outDir`, which defaults to
 *     "dist" when unset. React Router v7 builds this app into "build/client"
 *     via its own per-environment Vite config, a mechanism vite-plugin-pwa
 *     does not participate in. So sw.js was built into a gitignored,
 *     never-deployed directory, and /sw.js was a 404 in production.
 *
 *  2. injectRegister: "auto" injects a <script> into a built index.html.
 *     This app is SSR with no static HTML entrypoint, so nothing was ever
 *     injected, and no page loaded the registration script at all.
 *
 *  3. vite-plugin-pwa's default `navigateFallback: "index.html"` assumes a
 *     SPA app-shell; this app has no such file, so the generated navigation
 *     handler pointed at a precache entry that does not exist.
 *
 * None of this is reachable by rendering a component or calling a function —
 * it lives entirely in build configuration — so this test reads the config
 * files as text and asserts the specific settings that fixed it, rather than
 * leaving the invariant undocumented until the next person removes one line
 * and silently reintroduces the bug.
 */

const root = process.cwd();
const viteConfig = readFileSync(join(root, "vite.config.ts"), "utf8");
const entryClient = readFileSync(join(root, "app", "entry.client.tsx"), "utf8");

describe("PWA build configuration", () => {
  it("builds into the same directory React Router deploys from", () => {
    expect(viteConfig).toMatch(/outDir:\s*["']build\/client["']/);
  });

  it("does not rely on injecting a script into a static index.html", () => {
    expect(viteConfig).toMatch(/injectRegister:\s*false/);
  });

  it("registers the service worker explicitly from the client entry", () => {
    expect(entryClient).toMatch(
      /import\s*\{\s*registerSW\s*\}\s*from\s*["']virtual:pwa-register["']/,
    );
    expect(entryClient).toMatch(/registerSW\(/);
  });

  it("does not fall back to a non-existent index.html for navigation", () => {
    expect(viteConfig).toMatch(/navigateFallback:\s*undefined/);
  });

  it("claims existing clients so a fresh install controls the current tab", () => {
    expect(viteConfig).toMatch(/clientsClaim:\s*true/);
  });

  it("caches page navigations at runtime, since there is no static shell to precache", () => {
    expect(viteConfig).toMatch(/request\.mode\s*===\s*["']navigate["']/);
    expect(viteConfig).toMatch(/NetworkFirst/);
  });

  it("declares workbox-window, which virtual:pwa-register needs at build time", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const declared = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(declared["workbox-window"]).toBeTruthy();
  });
});

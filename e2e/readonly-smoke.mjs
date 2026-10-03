// Read-only smoke: only GETs pages and public endpoints and checks they render.
// No clicks, no form submits, no POST/PUT/DELETE. Safe against production:
// `pnpm e2e:prod` (huyab.click). `pnpm e2e` runs it first against local
// `wrangler dev`, so dev and prod share these checks.
//
// Environment:
// - E2E_BASE_URL: default http://127.0.0.1:8787
// - PLAYWRIGHT_CHROMIUM_PATH: see findChromium in @huyab/e2e
import { BASE, findChromium } from "@huyab/e2e";
import { chromium } from "playwright-core";

const WAIT = { timeout: 15000 };
const LOCAL = ["127.0.0.1", "localhost"].includes(new URL(BASE).hostname);

// Every UI route; each renders an <h1> (directly or via PageHeader).
const PAGES = [
  ["/", "Case Converter"],
  ["/it", null],
  ["/it/json-tools", "JSON Tools"],
  ["/it/text-diff", null],
  ["/it/markdown-preview", null],
  ["/it/image-tools", null],
  ["/it/api-tester", null],
  ["/it/number-reading", null],
  ["/it/odoo-inspector", null],
  ["/it/notes", "Notes"],
  ["/it/transformers", null],
  ["/it/pdf-tools", null],
  ["/lifestyle", null],
  ["/lifestyle/pomodoro", null],
  ["/lifestyle/quotes", null],
  ["/calendar", null],
  // The projects table only exists in the remote D1; local D1 has no schema.
  ...(LOCAL ? [] : [["/projects", null]]),
  ["/about", null],
  ["/liquid-glass", null],
  ["/games", null],
  ["/games/2048", null],
  ["/games/snake", null],
  ["/games/minesweeper", null],
  ["/games/tetris", null],
  ["/games/sudoku", null],
  ["/games/loto", null],
];

let passed = 0;
let failed = 0;

function ok(name) {
  passed += 1;
  console.log(`PASS ${name}`);
}

/** GET a path, throwing unless the status matches. */
async function get(path, expectedStatus, headers = {}) {
  const response = await fetch(BASE + path, { redirect: "manual", headers });
  if (response.status !== expectedStatus) {
    throw new Error(
      `GET ${path}: expected ${expectedStatus}, got ${response.status}`,
    );
  }
  return response;
}

console.log(`Read-only smoke against ${BASE}\n`);
if (LOCAL) console.log("SKIP /projects (D1 projects table is remote-only)\n");

const browser = await chromium.launch({ executablePath: findChromium() });
const context = await browser.newContext({ locale: "en-US" });
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  // 1. Every page server-renders, hydrates without uncaught errors and shows
  //    its heading plus the shared Navbar.
  for (const [path, heading] of PAGES) {
    pageErrors.length = 0;
    const response = await page.goto(BASE + path);
    if (response?.status() !== 200)
      throw new Error(`GET ${path} returned ${response?.status()}`);
    const h1 = page.locator("h1").first();
    await h1.waitFor(WAIT);
    const text = (await h1.innerText()).trim();
    if (!text || (heading && !text.includes(heading))) {
      throw new Error(
        `${path}: h1 is "${text}", expected "${heading ?? "non-empty"}"`,
      );
    }
    await page
      .locator('button[aria-label="Toggle Dark Mode"]')
      .first()
      .waitFor(WAIT);
    if (pageErrors.length > 0)
      throw new Error(`${path}: page errors: ${pageErrors.join("; ")}`);
    ok(`page ${path} renders`);
  }

  // 2. Unknown routes are a 404, not a crash.
  await get("/definitely-not-a-route", 404, { "user-agent": "Mozilla/5.0" });
  ok("unknown route returns 404");

  // 3. Server-backed read endpoint.
  const { holidays } = await (await get("/api/holidays", 200)).json();
  if (!Array.isArray(holidays) || holidays.length === 0 || !holidays[0].date) {
    throw new Error(
      `/api/holidays: unexpected payload ${JSON.stringify(holidays)?.slice(0, 200)}`,
    );
  }
  ok("/api/holidays returns holidays");

  // 4. PWA assets ship with the build.
  const manifest = await (await get("/manifest.webmanifest", 200)).json();
  if (manifest.name !== "ToolHub")
    throw new Error(`manifest name: ${manifest.name}`);
  const sw = await get("/sw.js", 200);
  if (!(sw.headers.get("content-type") ?? "").includes("javascript")) {
    throw new Error(`/sw.js content-type: ${sw.headers.get("content-type")}`);
  }
  ok("PWA manifest and service worker are served");

  // 5. Terminal clients get the plain-text interface (GET-only conversions).
  const curl = { "user-agent": "curl/8.7.1" };
  const banner = await (await get("/", 200, curl)).text();
  if (!banner.includes("ToolHub"))
    throw new Error(`curl banner: ${banner.slice(0, 120)}`);
  const upper = await (await get("/upper/xin%20ch%C3%A0o", 200, curl)).text();
  if (upper.trim() !== "XIN CHÀO")
    throw new Error(`curl /upper: ${JSON.stringify(upper)}`);
  ok("curl clients get the plain-text converter");
} catch (error) {
  failed += 1;
  console.log("FAIL:", error.message);
  await page.screenshot({ path: "e2e-failure.png" }).catch(() => {});
} finally {
  await browser.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

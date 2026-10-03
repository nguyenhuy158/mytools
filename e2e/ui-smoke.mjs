// Interactive smoke, dev only: clicks through the main tools and writes notes
// to the local NOTES KV (`wrangler dev --local`, see e2e/run.mjs). Never point
// this at production; use `pnpm e2e:prod` (readonly-smoke.mjs) for that.
//
// Environment:
// - E2E_BASE_URL: default http://127.0.0.1:8787
// - PLAYWRIGHT_CHROMIUM_PATH: see findChromium in @huyab/e2e
import { readFile } from "node:fs/promises";
import { assertLocalOnly, BASE, findChromium } from "@huyab/e2e";
import { chromium } from "playwright-core";

const WAIT = { timeout: 15000 };
const NOTE_TITLE = "E2E note";

assertLocalOnly();

let passed = 0;
let failed = 0;

function ok(name) {
  passed += 1;
  console.log(`PASS ${name}`);
}

/** Clicks `trigger` and returns the downloaded file's name and text. */
async function download(trigger) {
  const [file] = await Promise.all([
    page.waitForEvent("download", WAIT),
    trigger.click(),
  ]);
  return {
    name: file.suggestedFilename(),
    text: await readFile(await file.path(), "utf8"),
  };
}

/** Whether <html> carries the `.dark` class, and the persisted choice. */
function themeState() {
  return page.evaluate(() => ({
    dark: document.documentElement.classList.contains("dark"),
    saved: localStorage.getItem("theme"),
  }));
}

const browser = await chromium.launch({ executablePath: findChromium() });
const context = await browser.newContext({
  locale: "en-US",
  colorScheme: "light",
});
const page = await context.newPage();
page.on("pageerror", (error) => console.log("PAGE ERROR:", error.message));
const button = (name) => page.getByRole("button", { name, exact: true });

try {
  // 1. Case converter converts and downloads the result.
  await page.goto(`${BASE}/`);
  const textarea = page.locator("textarea").first();
  await textarea.fill("xin chào thế giới");
  await button("UPPER CASE").click();
  if ((await textarea.inputValue()) !== "XIN CHÀO THẾ GIỚI") {
    throw new Error(
      `upper case gave ${JSON.stringify(await textarea.inputValue())}`,
    );
  }
  const text = await download(button("Download"));
  if (text.name !== "text.txt" || text.text !== "XIN CHÀO THẾ GIỚI") {
    throw new Error(`text download: ${text.name} ${JSON.stringify(text.text)}`);
  }
  ok("case converter converts and downloads text.txt");

  // 2. Theme: the Navbar toggle and the command menu share one implementation.
  await page
    .locator('button[aria-label="Toggle Dark Mode"]:visible')
    .first()
    .click();
  let theme = await themeState();
  if (!theme.dark || theme.saved !== "dark")
    throw new Error(`navbar toggle: ${JSON.stringify(theme)}`);
  await page.reload();
  await page.locator("textarea").first().waitFor(WAIT);
  theme = await themeState();
  if (!theme.dark) throw new Error("dark theme was not restored after reload");
  // kbar only listens once hydrated: retry the shortcut until its search box opens.
  const search = page.locator('input[role="combobox"]');
  for (let attempt = 0; attempt < 15; attempt += 1) {
    await page.keyboard.press("ControlOrMeta+k");
    const opened = await search
      .waitFor({ state: "visible", timeout: 1000 })
      .then(
        () => true,
        () => false,
      );
    if (opened) break;
  }
  await search.fill("Light Mode");
  await page
    .locator('[role="option"]', { hasText: "Light Mode" })
    .first()
    .click();
  await page.waitForFunction(
    () => !document.documentElement.classList.contains("dark"),
    WAIT,
  );
  theme = await themeState();
  if (theme.saved !== "light")
    throw new Error(`command menu theme: ${JSON.stringify(theme)}`);
  ok("theme toggles from navbar and command menu, and persists");

  // 3. JSON tools formats and downloads data.json.
  await page.goto(`${BASE}/it/json-tools`);
  await page.locator("textarea").first().fill('{"b":1,"a":[1,2]}');
  await button("Format / Beautify").click();
  const output = page.locator(
    'textarea[placeholder="Output will appear here..."]',
  );
  await page.waitForFunction(
    () =>
      document.querySelector(
        'textarea[placeholder="Output will appear here..."]',
      )?.value,
    WAIT,
  );
  const formatted = await output.inputValue();
  if (
    JSON.stringify(JSON.parse(formatted)) !== '{"b":1,"a":[1,2]}' ||
    !formatted.includes("\n")
  ) {
    throw new Error(`format output: ${JSON.stringify(formatted)}`);
  }
  const json = await download(button("Download"));
  if (json.name !== "data.json" || json.text !== formatted) {
    throw new Error(`json download: ${json.name} ${JSON.stringify(json.text)}`);
  }
  ok("JSON tools formats and downloads data.json");

  // 4. Notes round-trip through the local NOTES KV: create, rename, reload,
  //    export, delete.
  await page.goto(`${BASE}/it/notes`);
  await page.getByRole("button", { name: "New Note" }).click();
  const title = page.locator('input[placeholder="Note title..."]');
  await title.waitFor(WAIT);
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "PUT" &&
      response.url().includes("/api/notes/"),
    WAIT,
  );
  await title.fill(NOTE_TITLE);
  if (!(await saved).ok()) throw new Error("saving the note failed");
  await page.reload();
  await page.getByText(NOTE_TITLE, { exact: true }).first().click();
  await page.waitForFunction(
    (expected) =>
      document.querySelector('input[placeholder="Note title..."]')?.value ===
      expected,
    NOTE_TITLE,
    WAIT,
  );
  const exported = await download(
    page.locator('button[title="Export as JSON"]'),
  );
  if (
    exported.name !== "E2E_note.json" ||
    JSON.parse(exported.text).title !== NOTE_TITLE
  ) {
    throw new Error(
      `note export: ${exported.name} ${exported.text.slice(0, 120)}`,
    );
  }
  await page.locator('button.btn-danger[title="Delete note"]').click();
  await page
    .locator("[data-sonner-toast] button", { hasText: "Delete" })
    .click();
  await page
    .getByText(NOTE_TITLE, { exact: true })
    .first()
    .waitFor({ state: "detached", ...WAIT });
  ok("notes create, persist, export and delete via local KV");
} catch (error) {
  failed += 1;
  console.log("FAIL:", error.message);
  await page.screenshot({ path: "e2e-failure.png" }).catch(() => {});
} finally {
  await browser.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

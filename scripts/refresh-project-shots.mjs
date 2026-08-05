#!/usr/bin/env node
/**
 * Regenerate the /projects card screenshots into public/projects/<id>.png.
 *
 *   node scripts/refresh-project-shots.mjs            # all projects
 *   node scripts/refresh-project-shots.mjs chiakeo    # just one
 *
 * Snapshots are committed rather than fetched at runtime, so visitors never
 * wait on a third-party screenshot service and the page keeps working when
 * that service is down or rate-limited. Re-run this when a site is redesigned.
 *
 * thum.io answers the first request for a cold URL with an animated "loading"
 * GIF and only has the real PNG ready a few seconds later, so each URL is
 * retried until the bytes actually start with the PNG signature.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(root, "public", "projects");
const WIDTH = 1200;
const HEIGHT = 750;
const ATTEMPTS = 5;
const RETRY_MS = 6000;

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Pull id/url pairs straight out of the data file — no build step needed. */
function readProjects() {
  const src = readFileSync(join(root, "app", "data", "projects.ts"), "utf8");
  const body = src.slice(
    src.indexOf("export const PROJECTS"),
    src.indexOf("export const PROJECT_TEMPLATE"),
  );
  const projects = [];
  // Split on entry boundaries so an optional shotUrl is read from the right
  // project rather than bleeding in from the next one.
  for (const chunk of body.split(/\n  \{\n/).slice(1)) {
    const id = chunk.match(/id:\s*"([^"]+)"/)?.[1];
    const url = chunk.match(/\n\s*url:\s*"([^"]+)"/)?.[1];
    const shotUrl = chunk.match(/shotUrl:\s*"([^"]+)"/)?.[1];
    if (id && url) projects.push({ id, url: shotUrl ?? url, linked: url });
  }
  return projects;
}

/**
 * A blank capture still decodes as a valid PNG, so size is the cheap tell: a
 * near-empty 1200x750 screenshot compresses far smaller than a real one.
 */
const BLANK_KB = 25;

function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot({ id, url }) {
  const endpoint = `https://image.thum.io/get/width/${WIDTH}/crop/${HEIGHT}/${url}`;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const res = await fetch(endpoint);
    if (!res.ok) {
      console.log(`  ${id}: HTTP ${res.status} (attempt ${attempt})`);
      await sleep(RETRY_MS);
      continue;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.subarray(0, 8).equals(PNG_MAGIC)) {
      // Still the loading placeholder; give the renderer a moment.
      console.log(`  ${id}: not ready yet (attempt ${attempt})`);
      await sleep(RETRY_MS);
      continue;
    }

    const { width, height } = pngSize(buf);
    const kb = Math.round(buf.length / 1024);
    const out = join(OUT_DIR, `${id}.png`);
    writeFileSync(out, buf);
    console.log(
      `  ${id}: ${width}x${height}, ${kb} KB -> public/projects/${id}.png`,
    );
    if (kb < BLANK_KB) {
      console.log(
        `    ⚠ only ${kb} KB — likely a blank or loading page. Open ${url} ` +
          `and set shotUrl in app/data/projects.ts if it redirects.`,
      );
    }
    return true;
  }

  console.error(`  ${id}: FAILED after ${ATTEMPTS} attempts`);
  return false;
}

const only = process.argv.slice(2);
const projects = readProjects().filter(
  (p) => only.length === 0 || only.includes(p.id),
);

if (projects.length === 0) {
  console.error(
    only.length
      ? `No project matches: ${only.join(", ")}`
      : "No projects found in app/data/projects.ts",
  );
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
console.log(`Refreshing ${projects.length} screenshot(s):`);

let failed = 0;
for (const project of projects) {
  if (!(await shoot(project))) failed++;
}

process.exit(failed === 0 ? 0 : 1);

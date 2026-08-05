/**
 * Plain-text interface for CLI clients (curl, wget, HTTPie).
 *
 * Runs before the React Router handler in workers/app.ts. It returns null for
 * anything it does not own so normal browser traffic, the /api routes and the
 * WebSocket upgrades fall through untouched.
 *
 *   curl huyab.click                       banner + usage
 *   curl huyab.click/upper -d 'đường phố'  convert stdin/body
 *   curl huyab.click/title/hà nội          convert a path argument
 *   curl huyab.click/-h                    usage
 */
import * as textCase from "../app/utils/text-case";

type Converter = (input: string) => string;

/** Case name → converter. Keys double as the URL path and the `mode` field. */
const MODES: Record<string, Converter> = {
  upper: textCase.toUpperCase,
  lower: textCase.toLowerCase,
  sentence: textCase.toSentenceCase,
  capitalized: textCase.toCapitalizedCase,
  title: textCase.toTitleCase,
  alternating: textCase.toAlternatingCase,
  inverse: textCase.toInverseCase,
};

/** Short forms, so `curl host/u -d ...` works. */
const ALIASES: Record<string, string> = {
  u: "upper",
  uc: "upper",
  l: "lower",
  lc: "lower",
  s: "sentence",
  c: "capitalized",
  cap: "capitalized",
  t: "title",
  a: "alternating",
  alt: "alternating",
  i: "inverse",
  inv: "inverse",
};

const HELP_PATHS = new Set(["h", "-h", "help", "--help", "usage", "?"]);
const HELP_PARAMS = ["h", "-h", "help", "--help"];

const CLI_AGENT = /\b(curl|wget|httpie|http|libcurl|powershell|wsl|fetch)\b/i;

const USAGE = `ToolHub — text case converter over HTTP
https://huyab.click

USAGE
  curl huyab.click/<case> -d '<text>'
  curl huyab.click/<case>/<text>
  echo '<text>' | curl huyab.click/<case> --data-binary @-
  cat file.txt | curl huyab.click/<case> --data-binary @-

CASES  — shown as applied to: đường phố hà nội
  upper         ĐƯỜNG PHỐ HÀ NỘI      (aliases: u, uc)
  lower         đường phố hà nội      (aliases: l, lc)
  sentence      Đường phố hà nội      (alias: s)
  capitalized   Đường Phố Hà Nội      (aliases: c, cap)
  title         Đường Phố Hà Nội      (alias: t)
  alternating   đƯờNg pHố hÀ NộI      (aliases: a, alt)
  inverse       ĐƯỜNG PHỐ HÀ NỘI      (aliases: i, inv)

  alternating counts spaces too, so the rhythm carries across words.
  inverse swaps each letter's case, so lowercase input comes back uppercase.

OPTIONS
  -h, --help    show this help
  ?json         reply with JSON instead of plain text
                (or send: Accept: application/json)
  ?text=<text>  pass the text as a query parameter

NOTES
  Vietnamese diacritics are handled correctly — matching is Unicode-aware.
  Trailing newlines in the input are preserved; curl -d strips them for you.

EXAMPLES
  curl huyab.click/upper -d 'đường phố'
  curl huyab.click/title/hà nội mùa thu
  curl 'huyab.click/capitalized?text=ăn ở ưu đãi&json'
  curl -s huyab.click/lower -d 'HÀ NỘI' | tee out.txt
`;

const BANNER = `ToolHub — text case converter
  cases: ${Object.keys(MODES).join(" ")}
  usage: curl huyab.click/<case> -d '<text>'
  help:  curl huyab.click/-h

The full site (JSON tools, diff, calendar, games) is at https://huyab.click
`;

const text = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-toolhub-cli": "1",
    },
  });

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2) + "\n", {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-toolhub-cli": "1",
    },
  });

/** True when the caller looks like a terminal rather than a browser. */
function isCliClient(request: Request, url: URL): boolean {
  if (url.searchParams.has("cli")) return true;
  const agent = request.headers.get("user-agent");
  // No User-Agent at all is typical of scripted clients.
  if (!agent) return true;
  if (/\bmozilla\b/i.test(agent)) return false;
  return CLI_AGENT.test(agent);
}

function wantsJson(request: Request, url: URL): boolean {
  if (url.searchParams.has("json")) return true;
  return (request.headers.get("accept") ?? "").includes("application/json");
}

/**
 * Resolve the text to convert: request body first, then ?text=, then any extra
 * path segments (so `/title/hà nội mùa thu` works).
 */
async function readInput(
  request: Request,
  url: URL,
  rest: string[],
): Promise<string> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text();
    if (body) {
      // `curl -d @file` and form-style posts arrive as key=value when the text
      // was passed via ?text=; a raw body is used verbatim.
      return body;
    }
  }
  const param = url.searchParams.get("text") ?? url.searchParams.get("t");
  if (param !== null) return param;
  return rest.map(decodeURIComponent).join("/");
}

/**
 * Handle a CLI request, or return null to let React Router serve the request.
 */
export async function handleCliRequest(
  request: Request,
): Promise<Response | null> {
  if (request.method !== "GET" && request.method !== "POST") return null;

  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const [head, ...rest] = segments;

  const cli = isCliClient(request, url);
  const name = head?.toLowerCase();
  const mode = name === undefined ? undefined : (ALIASES[name] ?? name);
  const convert = mode === undefined ? undefined : MODES[mode];
  const helpAsked = HELP_PARAMS.some((p) => url.searchParams.has(p));

  // /-h, /--help, /help — always plain text, any client.
  if (name !== undefined && HELP_PATHS.has(name)) {
    return wantsJson(request, url)
      ? json({ cases: Object.keys(MODES), aliases: ALIASES, usage: USAGE })
      : text(USAGE);
  }

  // `-h` as a query param only counts on paths this module owns, so that
  // /games?h and friends keep rendering their real page.
  if (helpAsked && (convert || (head === undefined && cli))) {
    return wantsJson(request, url)
      ? json({ cases: Object.keys(MODES), aliases: ALIASES, usage: USAGE })
      : text(USAGE);
  }

  // Bare `/` for a terminal: short banner instead of the HTML app.
  if (head === undefined) {
    return cli ? text(BANNER) : null;
  }

  // Not a case name: fall through so /about, /games, /api/... keep working.
  if (!convert) return null;

  const input = await readInput(request, url, rest);

  if (!input) {
    const message =
      `error: no input for '${mode}'\n\n` +
      `  curl huyab.click/${mode} -d '<text>'\n` +
      `  curl huyab.click/${mode}/<text>\n\n` +
      `run 'curl huyab.click/-h' for help\n`;
    return wantsJson(request, url)
      ? json({ error: "no input", mode }, 400)
      : text(message, 400);
  }

  const result = convert(input);
  return wantsJson(request, url)
    ? json({ mode, input, result })
    : text(result.endsWith("\n") ? result : result + "\n");
}

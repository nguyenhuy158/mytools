import type { CaseService } from "../../core/application/case-service";
import { createBanner, SHELL_HELPER, USAGE } from "./cli-texts";

const HELP_PATHS = new Set(["h", "-h", "help", "--help", "usage", "?"]);
const HELP_PARAMS = ["h", "-h", "help", "--help"];

const CLI_AGENT = /\b(curl|wget|httpie|http|libcurl|powershell|wsl|fetch)\b/i;

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
 * path segments (so `/title/tỉnh ninh thuận` works).
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

export function createCliHttp(service: CaseService) {
  /**
   * Handle a CLI request, or return null to let React Router serve the request.
   */
  async function handle(request: Request): Promise<Response | null> {
    if (request.method !== "GET" && request.method !== "POST") return null;

    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const [head, ...rest] = segments;

    const cli = isCliClient(request, url);
    const name = head?.toLowerCase();
    const mode = service.resolve(name);
    const helpAsked = HELP_PARAMS.some((p) => url.searchParams.has(p));

    // /-h, /--help, /help — always plain text, any client.
    if (name !== undefined && HELP_PATHS.has(name)) {
      return wantsJson(request, url)
        ? json({
            cases: service.modes(),
            aliases: service.aliases(),
            usage: USAGE,
          })
        : text(USAGE);
    }

    // `-h` as a query param only counts on paths this module owns, so that
    // /calendar?h and friends keep rendering their real page.
    if (helpAsked && (mode || (head === undefined && cli))) {
      return wantsJson(request, url)
        ? json({
            cases: service.modes(),
            aliases: service.aliases(),
            usage: USAGE,
          })
        : text(USAGE);
    }

    // Shell helper source, for `eval "$(curl -s huyab.cfd/sh)"`.
    if (name === "sh" || name === "shell") {
      return text(SHELL_HELPER);
    }

    // Bare `/` for a terminal: short banner instead of the HTML app.
    if (head === undefined) {
      return cli ? text(createBanner(service.modes())) : null;
    }

    // Not a case name: fall through so /about, /calendar, /api/... keep working.
    if (!mode) return null;

    const input = await readInput(request, url, rest);

    if (!input) {
      // Spell out the quoting, because `curl host/t ninh thuan` sends no body at
      // all — curl treats each extra word as another URL to fetch.
      const message =
        `error: no input for '${mode}'\n\n` +
        `  curl huyab.cfd/${mode} -d '<text>'\n` +
        `  curl 'huyab.cfd/${mode}/<text>'      # quote the whole URL\n\n` +
        `if you typed the text as bare words, curl read them as extra URLs:\n` +
        `  curl huyab.cfd/${mode} ninh thuan      ✗\n` +
        `  curl 'huyab.cfd/${mode}/ninh thuan'    ✓\n\n` +
        `no quoting at all:\n` +
        `  eval "$(curl -s huyab.cfd/sh)" && tc ${mode} ninh thuan\n\n` +
        `run 'curl huyab.cfd/-h' for help\n`;
      return wantsJson(request, url)
        ? json({ error: "no input", mode }, 400)
        : text(message, 400);
    }

    const result = service.convert(mode, input);
    return wantsJson(request, url)
      ? json({ mode, input, result })
      : text(result.endsWith("\n") ? result : result + "\n");
  }

  return { handle };
}

export type CliHttp = ReturnType<typeof createCliHttp>;

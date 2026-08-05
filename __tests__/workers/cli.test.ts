import { describe, it, expect } from "vitest";
import { handleCliRequest } from "../../workers/cli";

const CURL = { "user-agent": "curl/8.5.0" };
const BROWSER = {
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
};

const get = (path: string, headers: Record<string, string> = CURL) =>
  handleCliRequest(new Request(`https://huyab.click${path}`, { headers }));

const post = (
  path: string,
  body: string,
  headers: Record<string, string> = CURL,
) =>
  handleCliRequest(
    new Request(`https://huyab.click${path}`, {
      method: "POST",
      body,
      headers,
    }),
  );

const body = async (res: Response | null) => {
  expect(res).not.toBeNull();
  return await res!.text();
};

describe("CLI worker interface", () => {
  describe("conversion", () => {
    it("converts a POST body", async () => {
      expect(await body(await post("/upper", "đường phố"))).toBe(
        "ĐƯỜNG PHỐ\n",
      );
    });

    it("converts Vietnamese text for every case", async () => {
      expect(await body(await post("/lower", "HÀ NỘI"))).toBe("hà nội\n");
      expect(await body(await post("/capitalized", "đường phố"))).toBe(
        "Đường Phố\n",
      );
      expect(await body(await post("/sentence", "đây là câu."))).toBe(
        "Đây là câu.\n",
      );
      expect(await body(await post("/title", "hà nội mùa thu"))).toBe(
        "Hà Nội Mùa Thu\n",
      );
      expect(await body(await post("/inverse", "Đường"))).toBe("đƯỜNG\n");
    });

    it("converts text passed as path segments", async () => {
      expect(await body(await get("/title/hà nội mùa thu"))).toBe(
        "Hà Nội Mùa Thu\n",
      );
    });

    it("converts text passed as ?text=", async () => {
      expect(await body(await get("/upper?text=đường"))).toBe("ĐƯỜNG\n");
    });

    it("resolves short aliases", async () => {
      expect(await body(await post("/u", "abc"))).toBe("ABC\n");
      expect(await body(await post("/cap", "đường phố"))).toBe("Đường Phố\n");
      expect(await body(await post("/alt", "abcdef"))).toBe("aBcDeF\n");
    });

    it("is case-insensitive about the case name", async () => {
      expect(await body(await post("/UPPER", "abc"))).toBe("ABC\n");
    });

    it("does not add a second trailing newline", async () => {
      expect(await body(await post("/upper", "abc\n"))).toBe("ABC\n");
    });

    it("preserves interior newlines from piped input", async () => {
      expect(await body(await post("/upper", "một\nhai"))).toBe("MỘT\nHAI\n");
    });

    it("serves text/plain", async () => {
      const res = await post("/upper", "abc");
      expect(res!.headers.get("content-type")).toContain("text/plain");
      expect(res!.headers.get("content-type")).toContain("charset=utf-8");
    });

    it("works for a browser too when a case name is used", async () => {
      expect(await body(await get("/upper/abc", BROWSER))).toBe("ABC\n");
    });
  });

  describe("help", () => {
    it.each(["/-h", "/--help", "/help", "/h", "/usage"])(
      "serves usage for %s",
      async (path) => {
        const out = await body(await get(path));
        expect(out).toContain("USAGE");
        expect(out).toContain("curl huyab.click/<case>");
      },
    );

    it("lists every case in the help text", async () => {
      const out = await body(await get("/--help"));
      for (const mode of [
        "upper",
        "lower",
        "sentence",
        "capitalized",
        "title",
        "alternating",
        "inverse",
      ]) {
        expect(out).toContain(mode);
      }
    });

    it("shows examples that match what the converters actually return", async () => {
      // Guards against the help text drifting from the implementation.
      const sample = "tỉnh ninh thuận";
      const help = await body(await get("/--help"));
      for (const mode of [
        "upper",
        "lower",
        "sentence",
        "capitalized",
        "title",
        "alternating",
        "inverse",
      ]) {
        const actual = await body(await post(`/${mode}`, sample));
        const line = help
          .split("\n")
          .find((l) => l.trim().startsWith(`${mode} `));
        expect(line, `no CASES line for ${mode}`).toBeDefined();
        expect(line, `help example for ${mode} is stale`).toContain(
          actual.trimEnd(),
        );
      }
    });

    it("accepts -h as a query param on a case path", async () => {
      expect(await body(await get("/upper?-h"))).toContain("USAGE");
    });

    it("serves help to a browser hitting /--help", async () => {
      expect(await body(await get("/--help", BROWSER))).toContain("USAGE");
    });
  });

  describe("wget", () => {
    const WGET = { "user-agent": "Wget/1.25.0" };

    it("treats wget as a CLI client at /", async () => {
      expect(await body(await get("/", WGET))).toContain("ToolHub");
    });

    it("converts for wget", async () => {
      expect(await body(await post("/upper", "ninh thuận", WGET))).toBe(
        "NINH THUẬN\n",
      );
    });

    it("documents the wget pipe limitation in the help", async () => {
      const out = await body(await get("/-h"));
      expect(out).toContain("WGET");
      expect(out).toContain("--post-file needs a seekable file");
    });
  });

  describe("banner", () => {
    it("serves a banner at / for curl", async () => {
      const out = await body(await get("/"));
      expect(out).toContain("ToolHub");
      expect(out).toContain("curl huyab.click/-h");
    });

    it("serves the banner when there is no User-Agent", async () => {
      expect(await body(await get("/", {}))).toContain("ToolHub");
    });

    it("serves the banner when ?cli is forced from a browser", async () => {
      expect(await body(await get("/?cli", BROWSER))).toContain("ToolHub");
    });
  });

  describe("JSON output", () => {
    it("returns JSON for ?json", async () => {
      const res = await post("/title?json", "hà nội");
      expect(res!.headers.get("content-type")).toContain("application/json");
      expect(JSON.parse(await res!.text())).toEqual({
        mode: "title",
        input: "hà nội",
        result: "Hà Nội",
      });
    });

    it("returns JSON for Accept: application/json", async () => {
      const res = await post("/upper", "abc", {
        ...CURL,
        accept: "application/json",
      });
      expect(JSON.parse(await res!.text()).result).toBe("ABC");
    });

    it("reports the alias-resolved mode name", async () => {
      const res = await post("/u?json", "abc");
      expect(JSON.parse(await res!.text()).mode).toBe("upper");
    });
  });

  describe("shell helper", () => {
    it.each(["/sh", "/shell"])("serves the tc function at %s", async (path) => {
      const out = await body(await get(path));
      expect(out).toContain("tc() {");
      expect(out).toContain("$_tc_url/$_tc_case");
    });

    it("handles stdin and argument forms", async () => {
      const out = await body(await get("/sh"));
      // Argument form and the stdin fallback must both be present.
      expect(out).toContain('--data-binary "$*"');
      expect(out).toContain("--data-binary @-");
    });

    it("routes tc -h to the help endpoint", async () => {
      const out = await body(await get("/sh"));
      expect(out).toContain("$_tc_url/-h");
    });

    it("leaves no shell variable behind", async () => {
      const out = await body(await get("/sh"));
      expect(out).toContain("unset _tc_case");
      expect(out).toContain("unset _tc_url");
    });

    it("falls back to wget when curl is missing", async () => {
      const out = await body(await get("/sh"));
      expect(out).toContain("command -v curl");
      expect(out).toContain("command -v wget");
      expect(out).toContain("--post-data=");
      // wget cannot post from a pipe, so stdin must be buffered.
      expect(out).toContain("mktemp");
      expect(out).toContain("--post-file=");
    });

    it("errors clearly when neither curl nor wget exists", async () => {
      expect(await body(await get("/sh"))).toContain("needs curl or wget");
    });

    it("uses no bashisms, so it runs under plain sh", async () => {
      const out = await body(await get("/sh"));
      expect(out).not.toContain("[[");
      expect(out).not.toContain("local ");
    });
  });

  describe("errors", () => {
    it("returns 400 with guidance when there is no input", async () => {
      const res = await post("/upper", "");
      expect(res!.status).toBe(400);
      const out = await res!.text();
      expect(out).toContain("no input");
      expect(out).toContain("curl huyab.click/-h");
    });

    it("explains the bare-words mistake in the no-input error", async () => {
      // `curl huyab.click/t ninh thuan` sends no body; the error must say why.
      const out = await body(await post("/t", ""));
      expect(out).toContain("extra URLs");
      expect(out).toContain("'huyab.click/title/ninh thuan'");
      expect(out).toContain("tc title ninh thuan");
    });

    it("returns a 400 JSON error when there is no input", async () => {
      const res = await post("/upper?json", "");
      expect(res!.status).toBe(400);
      expect(JSON.parse(await res!.text())).toEqual({
        error: "no input",
        mode: "upper",
      });
    });
  });

  describe("must not hijack the real app", () => {
    it.each([
      "/about",
      "/games",
      "/games/sudoku",
      "/it/json-tools",
      "/lifestyle/pomodoro",
      "/api/holidays",
      "/api/notes",
      "/api/online-counter/ws",
      "/assets/home-6ehJq-Nc.js",
      "/favicon.png",
      "/khong-ton-tai",
    ])("falls through for %s", async (path) => {
      expect(await get(path, CURL)).toBeNull();
      expect(await get(path, BROWSER)).toBeNull();
    });

    it("does not treat ?h on an app route as a help request", async () => {
      expect(await get("/games?h", CURL)).toBeNull();
      expect(await get("/games?--help", BROWSER)).toBeNull();
    });

    it("serves the HTML app at / for a browser", async () => {
      expect(await get("/", BROWSER)).toBeNull();
    });

    it("ignores methods other than GET and POST", async () => {
      for (const method of ["PUT", "DELETE", "PATCH", "OPTIONS"]) {
        const res = await handleCliRequest(
          new Request("https://huyab.click/upper", { method, headers: CURL }),
        );
        expect(res).toBeNull();
      }
    });
  });
});

import { describe, it, expect, vi } from "vitest";
import { check, isSameHost, loader } from "~/routes/api.projects-status";
import { PROJECTS } from "~/data/projects";

const ok = (status = 200) =>
  (async () => new Response("body", { status })) as unknown as typeof fetch;

const failing = (error: Error) =>
  (async () => {
    throw error;
  }) as unknown as typeof fetch;

describe("project status check", () => {
  it("reports a reachable site as online with a timing", async () => {
    const res = await check("https://example.com", "ex", ok());
    expect(res.id).toBe("ex");
    expect(res.online).toBe(true);
    expect(res.httpStatus).toBe(200);
    expect(typeof res.ms).toBe("number");
    expect(res.ms).toBeGreaterThanOrEqual(0);
  });

  it("treats a 500 as offline but records the status code", async () => {
    const res = await check("https://example.com", "ex", ok(500));
    expect(res.online).toBe(false);
    expect(res.httpStatus).toBe(500);
  });

  it("treats a 404 as offline", async () => {
    expect((await check("https://x.com", "x", ok(404))).online).toBe(false);
  });

  it("reports a thrown error without throwing itself", async () => {
    const res = await check(
      "https://x.com",
      "x",
      failing(new TypeError("network down")),
    );
    expect(res.online).toBe(false);
    expect(res.ms).toBe(null);
    expect(res.error).toBe("TypeError: network down");
  });

  it("keeps the error message, not just the name", async () => {
    const res = await check(
      "https://x.com",
      "x",
      failing(new Error("TLS peer's certificate is not trusted")),
    );
    expect(res.error).toContain("certificate is not trusted");
  });

  it("truncates a runaway error message", async () => {
    const res = await check(
      "https://x.com",
      "x",
      failing(new Error("x".repeat(5000))),
    );
    expect(res.error!.length).toBeLessThanOrEqual(200);
  });

  it("aborts a site that never answers", async () => {
    vi.useFakeTimers();
    try {
      // Hangs until the abort signal fires, like a site that accepts the
      // connection and then goes quiet.
      const hanging = ((_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(new Error("The operation was aborted")),
          );
        })) as unknown as typeof fetch;

      const pending = check("https://slow.example", "slow", hanging);
      await vi.advanceTimersByTimeAsync(9000);
      const res = await pending;

      expect(res.online).toBe(false);
      expect(res.error).toContain("aborted");
    } finally {
      vi.useRealTimers();
    }
  });

  it("identifies itself so site owners can see what the traffic is", async () => {
    let seen: RequestInit | undefined;
    const spy = (async (_url: string, init: RequestInit) => {
      seen = init;
      return new Response("", { status: 200 });
    }) as unknown as typeof fetch;

    await check("https://example.com", "ex", spy);
    const headers = seen?.headers as Record<string, string>;
    expect(headers["user-agent"]).toContain("ToolHub-status-check");
    expect(seen?.signal).toBeDefined();
  });
});

describe("isSameHost", () => {
  it("matches the host serving the request", () => {
    expect(isSameHost("https://huyab.click", "https://huyab.click/api/x")).toBe(
      true,
    );
  });

  it("does not match a different subdomain", () => {
    // tc.huyab.click is a separate origin and must still be pinged.
    expect(
      isSameHost("https://tc.huyab.click", "https://huyab.click/api/x"),
    ).toBe(false);
  });

  it("ignores path differences in the request URL", () => {
    expect(
      isSameHost("https://huyab.click", "https://huyab.click/a/b?c=1"),
    ).toBe(true);
  });

  it("returns false for a malformed URL instead of throwing", () => {
    expect(isSameHost("not a url", "https://huyab.click")).toBe(false);
  });
});

describe("loader", () => {
  const stubFetch = (calls: string[]) =>
    (async (url: string) => {
      calls.push(String(url));
      return new Response("", { status: 200 });
    }) as unknown as typeof fetch;

  it("reports the serving host as up without fetching it", async () => {
    // A Worker fetching its own zone gets a 522, so this must not be a fetch.
    const calls: string[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = stubFetch(calls);
    try {
      const res = await loader({
        request: new Request("https://huyab.click/api/projects-status"),
      });
      const data = (await res.json()) as {
        statuses: { id: string; online: boolean | null; self?: boolean }[];
      };

      const self = data.statuses.find((s) => s.id === "toolhub")!;
      expect(self.online).toBe(true);
      expect(self.self).toBe(true);
      expect(calls.some((u) => u.includes("//huyab.click"))).toBe(false);

      const others = PROJECTS.filter(
        (p) => p.id !== "toolhub" && !p.skipStatusCheck,
      );
      expect(calls.length).toBe(others.length);
    } finally {
      globalThis.fetch = original;
    }
  });

  it("still pings other subdomains", async () => {
    const calls: string[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = stubFetch(calls);
    try {
      await loader({
        request: new Request("https://huyab.click/api/projects-status"),
      });
      expect(calls.some((u) => u.includes("tc.huyab.click"))).toBe(true);
    } finally {
      globalThis.fetch = original;
    }
  });

  it("sends an edge cache header", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = stubFetch([]);
    try {
      const res = await loader({
        request: new Request("https://huyab.click/api/projects-status"),
      });
      expect(res.headers.get("cache-control")).toContain("s-maxage=");
      expect(res.headers.get("content-type")).toContain("application/json");
    } finally {
      globalThis.fetch = original;
    }
  });
});

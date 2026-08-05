import { describe, it, expect, vi } from "vitest";
import { check } from "~/routes/api.projects-status";

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

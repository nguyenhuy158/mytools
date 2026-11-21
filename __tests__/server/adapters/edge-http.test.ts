import { describe, expect, it } from "vitest";
import { createDoCounterGateway } from "~/server/adapters/durable-object/do-counter-gateway";
import { gamesRedirect } from "~/server/adapters/http/games-redirect-http";
import { createOnlineCounterHttp } from "~/server/adapters/http/online-counter-http";

describe("games redirect adapter", () => {
  it("answers a permanent redirect to the games app, keeping the query", () => {
    const res = gamesRedirect(
      new Request("https://huyab.cfd/games/sudoku?a=1"),
    );
    expect(res?.status).toBe(301);
    expect(res?.headers.get("location")).toBe(
      "https://games.huyab.cfd/sudoku/?a=1",
    );
  });

  it("redirects an unsafe game name to the hub instead of failing", () => {
    const res = gamesRedirect(
      new Request("https://huyab.cfd/games/constructor"),
    );
    expect(res?.status).toBe(301);
    expect(res?.headers.get("location")).toBe("https://games.huyab.cfd/");
  });

  it("returns null for the rest of the site", () => {
    expect(gamesRedirect(new Request("https://huyab.cfd/calendar"))).toBeNull();
  });
});

describe("online counter http adapter", () => {
  const request = new Request("https://huyab.cfd/api/online-counter/ws");

  it("returns what the gateway answers", async () => {
    const answer = new Response("ok", { status: 200 });
    const res = await createOnlineCounterHttp({
      connect: async () => answer,
    }).connect(request);
    expect(res).toBe(answer);
  });

  it("answers 500 with a plain message when the gateway fails", async () => {
    const res = await createOnlineCounterHttp({
      connect: async () => {
        throw new Error("no durable object");
      },
    }).connect(request);
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("Failed to connect to online counter");
  });
});

describe("durable object gateway", () => {
  it("forwards the request to the one global counter", async () => {
    const calls: string[] = [];
    const forwarded: Request[] = [];
    const id = {} as DurableObjectId;
    const gateway = createDoCounterGateway({
      idFromName: (name) => {
        calls.push(`idFromName ${name}`);
        return id;
      },
      get: (given) => {
        calls.push(given === id ? "get id" : "get other");
        return {
          fetch: async (req) => {
            forwarded.push(req);
            return new Response("upgraded");
          },
        };
      },
    });
    const request = new Request("https://huyab.cfd/api/online-counter/ws");
    const res = await gateway.connect(request);
    expect(await res.text()).toBe("upgraded");
    expect(calls).toEqual(["idFromName global", "get id"]);
    expect(forwarded).toEqual([request]);
  });
});

import { describe, expect, it } from "vitest";
import { countMessage, replyTo } from "~/server/core/domain/online-counter";

describe("countMessage", () => {
  it("is the json the page reads", () => {
    expect(JSON.parse(countMessage(3))).toEqual({ type: "count", count: 3 });
    expect(JSON.parse(countMessage(0))).toEqual({ type: "count", count: 0 });
  });
});

describe("replyTo", () => {
  it("answers a ping with a pong", () => {
    expect(JSON.parse(replyTo('{"type":"ping"}') ?? "null")).toEqual({
      type: "pong",
    });
  });

  it("ignores anything else", () => {
    expect(replyTo('{"type":"count"}')).toBeNull();
    expect(replyTo("not json")).toBeNull();
    expect(replyTo("null")).toBeNull();
    expect(replyTo("")).toBeNull();
    expect(replyTo(new ArrayBuffer(4))).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import {
  GAME_PATHS,
  GAMES_URL,
  gamesRedirectTarget,
} from "~/server/core/domain/games";

describe("gamesRedirectTarget", () => {
  it("sends each known game to its page on the games app", () => {
    for (const [slug, path] of Object.entries(GAME_PATHS)) {
      expect(gamesRedirectTarget(`/games/${slug}`, "")).toBe(
        `${GAMES_URL}${path}`,
      );
    }
  });

  it("ignores case, a trailing slash and keeps the query string", () => {
    expect(gamesRedirectTarget("/Games/SUDOKU/", "?room=ab12")).toBe(
      `${GAMES_URL}/sudoku/?room=ab12`,
    );
  });

  it("sends the games index, an unknown game and a deeper path to the hub", () => {
    expect(gamesRedirectTarget("/games", "")).toBe(`${GAMES_URL}/`);
    expect(gamesRedirectTarget("/games/nope", "")).toBe(`${GAMES_URL}/`);
    expect(gamesRedirectTarget("/games/loto/room/1", "?x=1")).toBe(
      `${GAMES_URL}/?x=1`,
    );
  });

  it("does not take the names of object properties for games", () => {
    expect(gamesRedirectTarget("/games/constructor", "")).toBe(`${GAMES_URL}/`);
    expect(gamesRedirectTarget("/games/__proto__", "")).toBe(`${GAMES_URL}/`);
  });

  it("leaves every other path to the app", () => {
    expect(gamesRedirectTarget("/", "")).toBeNull();
    expect(gamesRedirectTarget("/calendar", "?h")).toBeNull();
    expect(gamesRedirectTarget("/api/games", "")).toBeNull();
  });
});

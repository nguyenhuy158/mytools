import { describe, expect, it } from "vitest";
import { createCaseService } from "~/server/core/application/case-service";
import { ALIASES, MODES, resolveMode } from "~/server/core/domain/case-modes";

describe("resolveMode", () => {
  it("accepts every case name and every alias", () => {
    for (const mode of Object.keys(MODES)) expect(resolveMode(mode)).toBe(mode);
    for (const [alias, mode] of Object.entries(ALIASES)) {
      expect(resolveMode(alias)).toBe(mode);
    }
  });

  it("has an alias only for a case that exists", () => {
    for (const mode of Object.values(ALIASES))
      expect(MODES).toHaveProperty(mode);
  });

  it("returns nothing for an unknown name or none at all", () => {
    expect(resolveMode("about")).toBeUndefined();
    expect(resolveMode(undefined)).toBeUndefined();
    expect(resolveMode("")).toBeUndefined();
  });

  it("does not take the names of object properties for cases", () => {
    for (const name of [
      "constructor",
      "__proto__",
      "toString",
      "hasOwnProperty",
    ]) {
      expect(resolveMode(name)).toBeUndefined();
    }
  });
});

describe("case service", () => {
  const service = createCaseService();

  it("lists the case names the curl interface offers", () => {
    expect(service.modes()).toEqual([
      "upper",
      "lower",
      "sentence",
      "capitalized",
      "title",
      "alternating",
      "inverse",
    ]);
    expect(service.aliases()).toBe(ALIASES);
  });

  it("converts Vietnamese text with a resolved mode", () => {
    expect(service.convert("upper", "đường phố")).toBe("ĐƯỜNG PHỐ");
    expect(service.convert(service.resolve("t") ?? "", "hà nội mùa thu")).toBe(
      "Hà Nội Mùa Thu",
    );
  });
});

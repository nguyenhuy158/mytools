import { describe, it, expect } from "vitest";
import { safeJsonParse, safeJsonStringify } from "~/utils/storage";

describe("Storage Utils", () => {
  describe("safeJsonParse", () => {
    it("should parse valid JSON", () => {
      const result = safeJsonParse('{"name":"test"}', {});
      expect(result).toEqual({ name: "test" });
    });

    it("should return fallback for invalid JSON", () => {
      const fallback = { default: true };
      const result = safeJsonParse("invalid json", fallback);
      expect(result).toBe(fallback);
    });

    it("should return fallback for null", () => {
      const fallback = { default: true };
      const result = safeJsonParse(null, fallback);
      expect(result).toBe(fallback);
    });

    it("should return fallback for empty string", () => {
      const fallback = { default: true };
      const result = safeJsonParse("", fallback);
      expect(result).toBe(fallback);
    });

    it("should parse arrays", () => {
      const result = safeJsonParse('[1,2,3]', []);
      expect(result).toEqual([1, 2, 3]);
    });

    it("should parse nested objects", () => {
      const json = '{"user":{"name":"John","age":30}}';
      const result = safeJsonParse(json, {});
      expect(result).toEqual({ user: { name: "John", age: 30 } });
    });

    it("should parse primitives", () => {
      expect(safeJsonParse("42", 0)).toBe(42);
      expect(safeJsonParse('"hello"', "")).toBe("hello");
      expect(safeJsonParse("true", false)).toBe(true);
    });
  });

  describe("safeJsonStringify", () => {
    it("should stringify objects", () => {
      const result = safeJsonStringify({ name: "test" });
      expect(result).toBe('{"name":"test"}');
    });

    it("should stringify arrays", () => {
      const result = safeJsonStringify([1, 2, 3]);
      expect(result).toBe("[1,2,3]");
    });

    it("should stringify primitives", () => {
      expect(safeJsonStringify(42)).toBe("42");
      expect(safeJsonStringify("hello")).toBe('"hello"');
      expect(safeJsonStringify(true)).toBe("true");
    });

    it("should stringify nested structures", () => {
      const obj = { user: { name: "John", posts: [1, 2, 3] } };
      const result = safeJsonStringify(obj);
      expect(JSON.parse(result)).toEqual(obj);
    });

    it("should return empty string for circular references", () => {
      const circular: any = {};
      circular.self = circular;
      const result = safeJsonStringify(circular);
      expect(result).toBe("");
    });

    it("should handle undefined", () => {
      const result = safeJsonStringify(undefined);
      expect(result).toBe("");
    });

    it("should handle functions", () => {
      const result = safeJsonStringify(() => {});
      expect(result).toBe("");
    });

    it("should stringify dates as ISO strings", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const result = safeJsonStringify(date);
      expect(result).toBe('"2024-01-01T00:00:00.000Z"');
    });
  });

  describe("Round-trip parsing", () => {
    it("should parse and stringify consistently", () => {
      const original = { name: "John", age: 30, active: true };
      const stringified = safeJsonStringify(original);
      const parsed = safeJsonParse(stringified, {});
      expect(parsed).toEqual(original);
    });

    it("should handle complex nested structures", () => {
      const original = {
        users: [
          { id: 1, name: "John", roles: ["admin", "user"] },
          { id: 2, name: "Jane", roles: ["user"] },
        ],
        metadata: { version: "1.0", updated: "2024-01-01" },
      };
      const stringified = safeJsonStringify(original);
      const parsed = safeJsonParse(stringified, {});
      expect(parsed).toEqual(original);
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  toAlternatingCase,
  toCapitalizedCase,
  toInverseCase,
  toLowerCase,
  toSentenceCase,
  toTitleCase,
  toUpperCase,
} from "~/utils/text-case";

describe("Text Case Utils", () => {
  describe("toSentenceCase", () => {
    it("capitalizes the first letter and lowercases the rest", () => {
      expect(toSentenceCase("hELLO wORLD")).toBe("Hello world");
    });

    it("capitalizes after sentence terminators", () => {
      expect(toSentenceCase("one. two! three? four")).toBe(
        "One. Two! Three? Four",
      );
    });

    it("handles Vietnamese diacritics on the first letter", () => {
      expect(toSentenceCase("đây là một câu.")).toBe("Đây là một câu.");
      expect(toSentenceCase("ước gì. ăn cơm")).toBe("Ước gì. Ăn cơm");
    });

    it("skips leading whitespace and quotes", () => {
      expect(toSentenceCase('  "ơn trời"')).toBe('  "Ơn trời"');
    });

    it("returns an empty string unchanged", () => {
      expect(toSentenceCase("")).toBe("");
    });
  });

  describe("toLowerCase / toUpperCase", () => {
    it("lowercases Vietnamese text", () => {
      expect(toLowerCase("ĐƯỜNG PHỐ Hà NỘI")).toBe("đường phố hà nội");
    });

    it("uppercases Vietnamese text", () => {
      expect(toUpperCase("đường phố hà nội")).toBe("ĐƯỜNG PHỐ HÀ NỘI");
    });
  });

  describe("toCapitalizedCase", () => {
    it("capitalizes every word in ASCII text", () => {
      expect(toCapitalizedCase("hello big world")).toBe("Hello Big World");
    });

    it("capitalizes Vietnamese words starting with a diacritic", () => {
      // The old ASCII \b\w implementation produced "đườNg Phố".
      expect(toCapitalizedCase("đường phố")).toBe("Đường Phố");
      expect(toCapitalizedCase("ăn ở ưu đãi")).toBe("Ăn Ở Ưu Đãi");
    });

    it("lowercases the remaining letters of each word", () => {
      expect(toCapitalizedCase("HÀ NỘI")).toBe("Hà Nội");
    });

    it("does not treat an apostrophe as a word boundary", () => {
      expect(toCapitalizedCase("it's fine")).toBe("It's Fine");
    });

    it("keeps punctuation and multiple spaces in place", () => {
      expect(toCapitalizedCase("xin  chào, bạn!")).toBe("Xin  Chào, Bạn!");
    });

    it("capitalizes a word that follows a digit-only token", () => {
      expect(toCapitalizedCase("số 5 đường lê lợi")).toBe(
        "Số 5 Đường Lê Lợi",
      );
    });
  });

  describe("toAlternatingCase", () => {
    it("alternates starting with lowercase", () => {
      expect(toAlternatingCase("abcdef")).toBe("aBcDeF");
    });

    it("counts Vietnamese characters as single positions", () => {
      expect(toAlternatingCase("đường")).toBe("đƯờNg");
    });

    it("returns an empty string unchanged", () => {
      expect(toAlternatingCase("")).toBe("");
    });
  });

  describe("toTitleCase", () => {
    it("keeps minor words lowercase unless first", () => {
      expect(toTitleCase("the lord of the rings")).toBe(
        "The Lord of the Rings",
      );
    });

    it("capitalizes a minor word in first position", () => {
      expect(toTitleCase("of mice and men")).toBe("Of Mice and Men");
    });

    it("capitalizes Vietnamese words", () => {
      expect(toTitleCase("hà nội mùa thu")).toBe("Hà Nội Mùa Thu");
    });

    it("preserves newlines and repeated spaces", () => {
      expect(toTitleCase("dòng một\ndòng  hai")).toBe("Dòng Một\nDòng  Hai");
    });
  });

  describe("toInverseCase", () => {
    it("swaps ASCII case", () => {
      expect(toInverseCase("Hello World")).toBe("hELLO wORLD");
    });

    it("swaps Vietnamese case", () => {
      expect(toInverseCase("Đường Phố")).toBe("đƯỜNG pHỐ");
    });

    it("leaves non-letters untouched", () => {
      expect(toInverseCase("a1 b2!")).toBe("A1 B2!");
    });
  });
});

import { describe, it, expect, vi } from "vitest";
import { createNote, extractPlainText, htmlToMarkdown } from "~/utils/notes";

describe("Notes Utils", () => {
  describe("createNote", () => {
    it("should create a note with default title", () => {
      const note = createNote();
      expect(note.title).toBe("Untitled Note");
      expect(note.content).toBe("");
      expect(note.plainText).toBe("");
      expect(note.id).toBeDefined();
      expect(note.createdAt).toBeDefined();
      expect(note.updatedAt).toBeDefined();
    });

    it("should create a note with custom title", () => {
      const note = createNote("My Note");
      expect(note.title).toBe("My Note");
    });

    it("should generate unique IDs", () => {
      const note1 = createNote();
      const note2 = createNote();
      expect(note1.id).not.toBe(note2.id);
    });

    it("should set createdAt and updatedAt to same time", () => {
      const note = createNote();
      expect(note.createdAt).toBe(note.updatedAt);
    });

    it("should have ISO timestamp format", () => {
      const note = createNote();
      const timestamp = new Date(note.createdAt);
      expect(timestamp.toISOString()).toBeDefined();
    });
  });

  describe("extractPlainText", () => {
    it("should extract text from HTML", () => {
      const html = "<p>Hello <strong>World</strong></p>";
      const result = extractPlainText(html);
      expect(result).toBe("Hello World");
    });

    it("should handle nested tags", () => {
      const html = "<div><p>Nested <em>text</em></p></div>";
      const result = extractPlainText(html);
      expect(result).toBe("Nested text");
    });

    it("should handle empty HTML", () => {
      const result = extractPlainText("");
      expect(result).toBe("");
    });

    it("should strip HTML tags completely", () => {
      const html = "<h1>Title</h1><p>Content</p>";
      const result = extractPlainText(html);
      expect(result).toBe("TitleContent");
    });

    it("should handle HTML entities", () => {
      const html = "<p>&amp; &lt; &gt;</p>";
      const result = extractPlainText(html);
      expect(result).toContain("&");
    });

    it("should handle line breaks", () => {
      const html = "<p>Line 1<br>Line 2</p>";
      const result = extractPlainText(html);
      expect(result).toContain("Line 1");
      expect(result).toContain("Line 2");
    });
  });

  describe("htmlToMarkdown", () => {
    it("should convert h1 to markdown", () => {
      const html = "<h1>Title</h1>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("# Title");
    });

    it("should convert h2 to markdown", () => {
      const html = "<h2>Subtitle</h2>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("## Subtitle");
    });

    it("should convert h3 to markdown", () => {
      const html = "<h3>Section</h3>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("### Section");
    });

    it("should convert strong to bold markdown", () => {
      const html = "<strong>bold text</strong>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("**bold text**");
    });

    it("should convert b to bold markdown", () => {
      const html = "<b>bold text</b>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("**bold text**");
    });

    it("should convert em to italic markdown", () => {
      const html = "<em>italic text</em>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("*italic text*");
    });

    it("should convert i to italic markdown", () => {
      const html = "<i>italic text</i>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("*italic text*");
    });

    it("should convert strikethrough", () => {
      const html = "<s>strikethrough</s>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("~~strikethrough~~");
    });

    it("should convert links", () => {
      const html = '<a href="https://example.com">link text</a>';
      const result = htmlToMarkdown(html);
      expect(result).toContain("[link text](https://example.com)");
    });

    it("should convert unordered lists", () => {
      const html = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("- Item 1");
      expect(result).toContain("- Item 2");
    });

    it("should convert code blocks", () => {
      const html = "<pre><code>const x = 5;</code></pre>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("```");
      expect(result).toContain("const x = 5;");
    });

    it("should convert inline code", () => {
      const html = "<code>variable</code>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("`variable`");
    });

    it("should convert paragraphs", () => {
      const html = "<p>First paragraph</p><p>Second paragraph</p>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("First paragraph");
      expect(result).toContain("Second paragraph");
    });

    it("should handle complex mixed content", () => {
      const html =
        "<h1>Title</h1><p>This is <strong>bold</strong> and <em>italic</em></p>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("# Title");
      expect(result).toContain("**bold**");
      expect(result).toContain("*italic*");
    });

    it("should trim whitespace", () => {
      const html = "  <p>Text</p>  ";
      const result = htmlToMarkdown(html);
      expect(result).not.toMatch(/^\s+/);
      expect(result).not.toMatch(/\s+$/);
    });

    it("should handle multiple newlines", () => {
      const html = "<p>Line 1</p><p>Line 2</p><p>Line 3</p>";
      const result = htmlToMarkdown(html);
      // Should have at most 2 consecutive newlines (one blank line between)
      expect(result).not.toMatch(/\n{3,}/);
    });

    it("should handle blockquotes", () => {
      const html = "<blockquote>Quote text</blockquote>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("> Quote text");
    });

    it("should remove underline tags but keep content", () => {
      const html = "<u>underlined text</u>";
      const result = htmlToMarkdown(html);
      expect(result).toBe("underlined text");
    });

    it("should handle br tags", () => {
      const html = "<p>Line 1<br>Line 2</p>";
      const result = htmlToMarkdown(html);
      expect(result).toContain("Line 1");
      expect(result).toContain("Line 2");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty strings", () => {
      expect(extractPlainText("")).toBe("");
      expect(htmlToMarkdown("")).toBe("");
    });

    it("should handle malformed HTML", () => {
      const html = "<p>Unclosed tag";
      // Should not throw
      expect(() => extractPlainText(html)).not.toThrow();
      expect(() => htmlToMarkdown(html)).not.toThrow();
    });

    it("should handle special characters in content", () => {
      const html = "<p>Special: !@#$%^&*()</p>";
      const result = extractPlainText(html);
      expect(result).toContain("Special: !@#$%^&*()");
    });

    it("should handle unicode characters", () => {
      const html = "<p>Unicode: 你好 🎉 Ñoño</p>";
      const result = extractPlainText(html);
      expect(result).toContain("Unicode: 你好 🎉 Ñoño");
    });
  });
});

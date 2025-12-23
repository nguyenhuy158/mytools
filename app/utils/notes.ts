import { v4 as uuidv4 } from "uuid";

export interface Note {
  id: string;
  title: string;
  content: string;
  plainText: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteListItem {
  id: string;
  title: string;
  plainText: string;
  updatedAt: string;
}

// Extract plain text from HTML content
export function extractPlainText(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// Convert HTML to Markdown (simple converter)
export function htmlToMarkdown(html: string): string {
  let markdown = html;

  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n");
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n");
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n");

  // Bold
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");

  // Italic
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

  // Underline (no markdown equivalent, keep as is)
  markdown = markdown.replace(/<u[^>]*>(.*?)<\/u>/gi, "$1");

  // Strikethrough
  markdown = markdown.replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~");
  markdown = markdown.replace(/<strike[^>]*>(.*?)<\/strike>/gi, "~~$1~~");

  // Links
  markdown = markdown.replace(/<a[^>]*href=["']([^"']*?)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  // Lists
  markdown = markdown.replace(/<ul[^>]*>/gi, "");
  markdown = markdown.replace(/<\/ul>/gi, "\n");
  markdown = markdown.replace(/<ol[^>]*>/gi, "");
  markdown = markdown.replace(/<\/ol>/gi, "\n");
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");

  // Blockquote
  markdown = markdown.replace(/<blockquote[^>]*>/gi, "> ");
  markdown = markdown.replace(/<\/blockquote>/gi, "\n");

  // Code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, "```\n$1\n```\n");
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n");
  markdown = markdown.replace(/<br[^>]*>/gi, "\n");

  // Clean up multiple newlines
  markdown = markdown.replace(/\n{3,}/g, "\n\n");

  return markdown.trim();
}

// Create a new note
export function createNote(title: string = "Untitled Note"): Note {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    title,
    content: "",
    plainText: "",
    createdAt: now,
    updatedAt: now,
  };
}

// Normalize note for API response
export function normalizeNote(note: Note): Note {
  return {
    ...note,
    plainText: extractPlainText(note.content),
  };
}

import type { MetaFunction } from "react-router";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PageHeader } from "~/components/PageHeader";
import { ButtonGroup } from "~/components/ButtonGroup";
import { FileText, Eye, Copy, Trash2, Code } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Markdown Preview - ToolHub" },
    { name: "description", content: "Write markdown and see the rendered result side by side." },
  ];
};

export default function MarkdownPreview() {
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState(`# Markdown Preview

Type your **Markdown** here to see the live preview.

## Features
- Live rendering
- GitHub flavored markdown support
- Syntax highlighting

### Code Example
\`\`\`javascript
console.log("Hello World");
\`\`\`

> "The best way to predict the future is to invent it."
`);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    toast.success(t("markdown_preview.toast.copied"));
  };

  const handleCopyHtml = () => {
    if (previewRef.current) {
      navigator.clipboard.writeText(previewRef.current.innerHTML);
      toast.success(t("markdown_preview.toast.copied"));
    }
  };

  const handleClear = () => {
    setMarkdown("");
    toast.info(t("markdown_preview.toast.cleared"));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title={t("markdown_preview.title")}
          description={t("markdown_preview.description")}
        />

        <ButtonGroup>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <Copy className="w-4 h-4" /> {t("markdown_preview.actions.copy_markdown")}
            </button>
            <button
              onClick={handleCopyHtml}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <Code className="w-4 h-4" /> {t("markdown_preview.actions.copy_html")}
            </button>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" />

            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" /> {t("markdown_preview.actions.clear")}
            </button>
          </div>
        </ButtonGroup>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-320px)] min-h-[500px]">
          {/* Editor Pane */}
          <div className="flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <FileText className="w-4 h-4 text-blue-500" />
              <h2 className="font-semibold text-sm">{t("markdown_preview.editor")}</h2>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={t("markdown_preview.placeholder")}
              className="flex-1 w-full p-4 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
            />
          </div>

          {/* Preview Pane */}
          <div className="flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <Eye className="w-4 h-4 text-green-500" />
              <h2 className="font-semibold text-sm">{t("markdown_preview.preview")}</h2>
            </div>
            <div
              ref={previewRef}
              className="flex-1 w-full p-4 overflow-auto prose dark:prose-invert max-w-none"
            >
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

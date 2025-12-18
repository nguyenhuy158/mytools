import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { PageHeader } from "~/components/PageHeader";
import { FileText, Eye } from "lucide-react";

export default function MarkdownPreview() {
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState(`# Markdown Preview

Type your **Markdown** here to see the live preview.

## Features
- Live rendering
- GitHub flavored markdown support
- Syntax highlighting (coming soon)

### Code Example
\`\`\`javascript
console.log("Hello World");
\`\`\`

> "The best way to predict the future is to invent it."
`);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title={t("markdown_preview.title")}
          description={t("markdown_preview.description")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
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
            <div className="flex-1 w-full p-4 overflow-auto prose dark:prose-invert max-w-none">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

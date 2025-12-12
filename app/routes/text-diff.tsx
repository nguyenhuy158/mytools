import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { diffChars } from "diff";
import type { Change } from "diff";
import { Trash2 } from "lucide-react";
import type { Route } from "./+types/text-diff";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Text Diff - Compare Two Texts" },
    { name: "description", content: "Compare two texts and see the differences side-by-side." },
  ];
}

export default function TextDiff() {
  const { t } = useTranslation();
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diffs, setDiffs] = useState<Change[]>([]);

  useEffect(() => {
    if (!original && !modified) {
      setDiffs([]);
      return;
    }
    // Use diffChars for character-level diff, or diffWords for word-level.
    // The screenshot suggests word-level might be cleaner, but diffChars is more precise.
    // Let's use diffChars as default.
    const changes = diffChars(original, modified);
    setDiffs(changes);
  }, [original, modified]);

  const handleClear = () => {
    setOriginal("");
    setModified("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full">
        
        {/* Header */}
        <header className="space-y-2 text-center md:text-left border-b border-gray-200 dark:border-gray-800 pb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t("text_diff.title", "Text diff")}
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-lg">
                {t("text_diff.description", "Compare two texts and see the differences between them.")}
            </p>
        </header>

        {/* Input Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("text_diff.original", "Original Text")}
            </label>
            <textarea
              className="w-full h-40 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none resize-y text-sm font-mono text-slate-700 dark:text-gray-300 placeholder-gray-400 transition-all"
              placeholder={t("text_diff.original_placeholder", "Paste original text here...")}
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
            />
          </div>

          {/* Modified Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("text_diff.modified", "Modified Text")}
            </label>
            <textarea
              className="w-full h-40 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none resize-y text-sm font-mono text-slate-700 dark:text-gray-300 placeholder-gray-400 transition-all"
              placeholder={t("text_diff.modified_placeholder", "Paste modified text here...")}
              value={modified}
              onChange={(e) => setModified(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
            <Button onClick={handleClear} variant="danger">
            <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                {t("text_diff.clear", "Clear All")}
            </span>
            </Button>
        </div>

        {/* Diff Output */}
        {(original || modified) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900">
                {/* Original View */}
                <div className="p-4 bg-red-50/10 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                        {diffs.map((part, index) => {
                            // Show common and removed parts. Hide added parts.
                            if (part.added) return null;
                            const style = part.removed ? { backgroundColor: 'rgba(239, 68, 68, 0.2)' } : {};
                            return <span key={index} style={style}>{part.value}</span>;
                        })}
                    </pre>
                </div>
                {/* Modified View */}
                <div className="p-4 bg-green-50/10 overflow-x-auto">
                    <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                        {diffs.map((part, index) => {
                            // Show common and added parts. Hide removed parts.
                            if (part.removed) return null;
                            const style = part.added ? { backgroundColor: 'rgba(34, 197, 94, 0.2)' } : {};
                            return <span key={index} style={style}>{part.value}</span>;
                        })}
                    </pre>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

function Button({ children, onClick, variant = 'outline' }: { children: React.ReactNode, onClick: () => void, variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }) {
    const baseClass = "px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900 cursor-pointer select-none flex items-center justify-center";
    
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 focus:ring-blue-500",
        secondary: "bg-gray-100 hover:bg-gray-200 text-slate-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200",
        outline: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-400",
        danger: "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400"
    };

    return (
        <button onClick={onClick} className={`${baseClass} ${variants[variant]}`}>
            {children}
        </button>
    )
}

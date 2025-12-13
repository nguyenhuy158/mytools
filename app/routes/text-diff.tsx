import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { diffChars } from "diff";
import type { Change } from "diff";
import { Trash2, Save } from "lucide-react";
import type { Route } from "./+types/text-diff";
import { toast } from "sonner";
import { PageHeader } from "../components/PageHeader";
import { InputSection } from "../components/InputSection";
import { ButtonGroup } from "../components/ButtonGroup";
import { HistorySection } from "../components/HistorySection";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Text Diff - Compare Two Texts" },
    { name: "description", content: "Compare two texts and see the differences side-by-side." },
  ];
}

interface HistoryItem {
  original: string;
  modified: string;
  timestamp: number;
}

export default function TextDiff() {
  const { t } = useTranslation();
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diffs, setDiffs] = useState<Change[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("text-diff-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = () => {
    if (!original && !modified) return;

    const newItem: HistoryItem = {
      original,
      modified,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
        // Avoid duplicates at the top
        if (prev.length > 0 && prev[0].original === original && prev[0].modified === modified) {
            return prev;
        }
        
        const updated = [newItem, ...prev].slice(0, 20); // Keep last 20
        localStorage.setItem("text-diff-history", JSON.stringify(updated));
        return updated;
    });
    toast.success(t("text_diff.toast.saved", "Comparison saved to history"));
  };

  const removeFromHistory = (indexToRemove: number) => {
    setHistory((prev) => {
      const updated = prev.filter((_, index) => index !== indexToRemove);
      localStorage.setItem("text-diff-history", JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("text-diff-history");
    toast.info(t("text_diff.toast.cleared", "History cleared"));
  };

  useEffect(() => {
    if (!original && !modified) {
      setDiffs([]);
      return;
    }
    const changes = diffChars(original, modified);
    setDiffs(changes);
  }, [original, modified]);

  const handleClear = () => {
    setOriginal("");
    setModified("");
  };

  const handleRestore = (item: HistoryItem) => {
    setOriginal(item.original);
    setModified(item.modified);
    toast.success(t("text_diff.toast.restored", "Comparison restored from history"));
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full">
        
        <PageHeader 
          title={t("text_diff.title", "Text diff")}
          description={t("text_diff.description", "Compare two texts and see the differences between them.")}
        />

        {/* Input Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputSection
            label={t("text_diff.original", "Original Text")}
            placeholder={t("text_diff.original_placeholder", "Paste original text here...")}
            value={original}
            onChange={setOriginal}
            className="h-40"
          />
          <InputSection
            label={t("text_diff.modified", "Modified Text")}
            placeholder={t("text_diff.modified_placeholder", "Paste modified text here...")}
            value={modified}
            onChange={setModified}
            className="h-40"
          />
        </div>

        {/* Actions */}
        <ButtonGroup className="justify-end">
            <Button onClick={saveToHistory} variant="primary">
                <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {t("text_diff.save", "Save")}
                </span>
            </Button>
            <Button onClick={handleClear} variant="danger">
                <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    {t("text_diff.clear", "Clear All")}
                </span>
            </Button>
        </ButtonGroup>

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

        <HistorySection
          history={history}
          onRestore={handleRestore}
          onRemove={removeFromHistory}
          onClear={clearHistory}
          title={t("text_diff.history", "History")}
          clearLabel={t("text_diff.clear", "Clear All")}
          renderItem={(item) => (
            <>
                <div className="flex gap-2 text-xs mb-2 text-gray-400">
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-1 bg-red-50 dark:bg-red-900/10 rounded truncate text-red-700 dark:text-red-300">
                        {item.original.substring(0, 50) || "(empty)"}
                    </div>
                    <div className="p-1 bg-green-50 dark:bg-green-900/10 rounded truncate text-green-700 dark:text-green-300">
                        {item.modified.substring(0, 50) || "(empty)"}
                    </div>
                </div>
            </>
          )}
        />

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

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { diffChars } from "diff";
import type { Change } from "diff";
import { Trash2, History, X, RotateCcw, Save } from "lucide-react";
import type { Route } from "./+types/text-diff";
import { toast } from "sonner";

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

  const removeFromHistory = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation();
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
        <div className="flex justify-end gap-2">
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

        {/* History Section */}
        {history.length > 0 && (
            <div className="w-full space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                        <History className="w-5 h-5" />
                        {t("text_diff.history", "History")}
                    </h3>
                    <button 
                        onClick={clearHistory}
                        className="text-xs text-slate-500 hover:text-red-600 transition-colors"
                    >
                        {t("text_diff.clear", "Clear All")}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {history.map((item, idx) => (
                        <div 
                            key={idx}
                            onClick={() => {
                                setOriginal(item.original);
                                setModified(item.modified);
                                toast.success(t("text_diff.toast.restored", "Comparison restored from history"));
                                // Scroll to top smoothly
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="group relative bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer shadow-sm transition-all hover:shadow-md"
                        >
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
                            
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                                <button 
                                    onClick={(e) => removeFromHistory(e, idx)}
                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 my-auto"></div>
                                <button className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 rounded transition-colors">
                                    <RotateCcw className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
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

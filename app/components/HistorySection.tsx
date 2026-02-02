import { History, X, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

interface HistorySectionProps<T> {
  history: T[];
  onRestore: (item: T) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
  renderItem: (item: T) => ReactNode;
  title?: string;
  clearLabel?: string;
  emptyMessage?: string;
  gridClassName?: string;
}

export function HistorySection<T>({
  history,
  onRestore,
  onRemove,
  onClear,
  renderItem,
  title = "History",
  clearLabel = "Clear All",
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3",
}: HistorySectionProps<T>) {
  if (history.length === 0) return null;

  return (
    <div className="w-full space-y-4 pt-6 border-t border-white/20 dark:border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <History className="w-5 h-5" />
          {title}
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-red-600 transition-colors"
        >
          {clearLabel}
        </button>
      </div>

      <div className={gridClassName}>
        {history.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onRestore(item)}
            className="group relative bg-white/15 dark:bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/20 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white/25 dark:hover:bg-white/15 cursor-pointer shadow-md transition-all hover:shadow-lg"
          >
            <div className="pr-6">
                {renderItem(item)}
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/20 dark:bg-white/10 backdrop-blur-md p-1 rounded-md shadow-md border border-white/20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(idx);
                }}
                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded transition-colors"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="w-px h-3 bg-white/20 dark:bg-white/10 my-auto"></div>
              <button className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 rounded transition-colors">
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

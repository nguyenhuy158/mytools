import { XCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onDismiss, className = "" }: ErrorDisplayProps) {
  return (
    <div className={`bg-red-500/20 dark:bg-red-500/15 backdrop-blur-sm text-red-700 dark:text-red-300 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-300/50 dark:border-red-400/30 ${className}`}>
      <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span className="font-mono break-all flex-1">{error}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="hover:text-red-800 dark:hover:text-red-300">
          <span className="sr-only">Dismiss</span>
          &times;
        </button>
      )}
    </div>
  );
}

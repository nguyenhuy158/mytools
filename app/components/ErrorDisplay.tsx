import { XCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onDismiss, className = "" }: ErrorDisplayProps) {
  return (
    <div className={`bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2 ${className}`}>
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

import { XCircle } from "lucide-react";
import type { ReactNode } from "react";

interface InputSectionProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string | null;
  actions?: ReactNode;
  readOnly?: boolean;
  className?: string;
}

export function InputSection({
  value,
  onChange,
  label,
  placeholder,
  error,
  actions,
  readOnly = false,
  className = "",
}: InputSectionProps) {
  return (
    <div className={`flex flex-col gap-2 h-full ${className}`}>
      <div className="flex justify-between items-center px-1">
        {label && <span className="font-semibold text-sm text-gray-500">{label}</span>}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <textarea
        className={`w-full flex-1 p-4 border rounded-xl font-mono text-sm resize-none focus:outline-none backdrop-blur-sm ${
          readOnly 
            ? "bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 cursor-text" 
            : "bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 focus:ring-2 focus:ring-blue-400 focus:bg-white/30 dark:focus:bg-white/20"
        } ${
          error ? 'border-red-400 focus:ring-red-400' : ''
        }`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        readOnly={readOnly}
      />
      {error && (
        <div className="bg-red-500/20 dark:bg-red-500/15 backdrop-blur-sm text-red-700 dark:text-red-300 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-300/50 dark:border-red-400/30">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="font-mono break-all">{error}</span>
        </div>
      )}
    </div>
  );
}

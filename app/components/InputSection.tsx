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
        className={`w-full flex-1 p-4 border rounded-xl font-mono text-sm resize-none focus:outline-none ${
          readOnly 
            ? "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 cursor-text" 
            : "bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
        } ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800'
        }`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        readOnly={readOnly}
      />
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="font-mono break-all">{error}</span>
        </div>
      )}
    </div>
  );
}

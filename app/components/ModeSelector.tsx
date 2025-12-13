interface ModeSelectorProps<T extends string> {
  modes: Record<T, { label: string }>;
  currentMode: T;
  onModeChange: (mode: T) => void;
  className?: string;
}

export function ModeSelector<T extends string>({ 
  modes, 
  currentMode, 
  onModeChange,
  className = "" 
}: ModeSelectorProps<T>) {
  return (
    <div className={`flex flex-wrap justify-center gap-2 ${className}`}>
      {(Object.keys(modes) as T[]).map((m) => (
        <button
          key={m}
          onClick={() => onModeChange(m)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentMode === m
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {modes[m].label}
        </button>
      ))}
    </div>
  );
}

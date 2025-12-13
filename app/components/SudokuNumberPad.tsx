import { Pencil, Eraser } from "lucide-react";

interface SudokuNumberPadProps {
  onNumberClick: (num: number) => void;
  onClear: () => void;
  onNoteModeToggle: () => void;
  isNoteMode: boolean;
  disabled: boolean;
}

export function SudokuNumberPad({ onNumberClick, onClear, onNoteModeToggle, isNoteMode, disabled }: SudokuNumberPadProps) {
  return (
    <div className="w-full max-w-md mx-auto mt-8 select-none">
       {/* Number Row */}
      <div className="flex justify-between items-center gap-1 sm:gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            disabled={disabled}
            className="flex-1 aspect-[4/5] sm:aspect-square flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xl sm:text-2xl font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 active:bg-blue-100 dark:active:bg-gray-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {num}
          </button>
        ))}
      </div>

      {/* Tools Row */}
      <div className="flex gap-4 mt-4">
         <button
            onClick={onNoteModeToggle}
            disabled={disabled}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all shadow-sm
              ${isNoteMode 
                ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700' 
                : 'bg-white text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'}
            `}
         >
            <Pencil size={18} /> 
            <span>Note Mode {isNoteMode ? 'ON' : 'OFF'}</span>
         </button>

         <button
          onClick={onClear}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm font-medium disabled:opacity-50"
        >
          <Eraser size={18} />
          <span>Erase</span>
        </button>
      </div>
    </div>
  );
}

import { RefreshCw, RotateCcw, Lightbulb, Pause, Play } from "lucide-react";
import { type Difficulty } from "../utils/sudoku";

interface SudokuControlsProps {
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
  onNewGame: () => void;
  onReset: () => void;
  onHint: () => void;
  hintsRemaining: number;
  timer: number;
  isPaused: boolean;
  onTogglePause: () => void;
}

export function SudokuControls({ 
  difficulty, 
  onDifficultyChange, 
  onNewGame, 
  onReset, 
  onHint,
  hintsRemaining,
  timer,
  isPaused,
  onTogglePause
}: SudokuControlsProps) {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto mb-6">
      {/* Top Bar: Difficulty & Timer */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
           <select 
             value={difficulty}
             onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
             className="bg-transparent font-medium text-gray-700 dark:text-gray-200 border-none focus:ring-0 cursor-pointer hover:text-blue-600 transition-colors uppercase tracking-wide text-sm"
           >
             <option value="easy">Easy</option>
             <option value="medium">Medium</option>
             <option value="hard">Hard</option>
           </select>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="font-mono text-xl font-bold text-gray-800 dark:text-gray-100 w-16 text-right">
            {formatTime(timer)}
          </div>
          <button 
            onClick={onTogglePause}
            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <button
          onClick={onNewGame}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all text-xs font-medium"
        >
          <RefreshCw size={18} />
          <span>New Game</span>
        </button>
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
        <button
          onClick={onReset}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all text-xs font-medium"
        >
          <RotateCcw size={18} />
          <span>Reset</span>
        </button>
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
        <button
          onClick={onHint}
          disabled={hintsRemaining <= 0 || isPaused}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-transparent text-xs font-medium relative"
        >
          <div className="relative">
            <Lightbulb size={18} />
            {hintsRemaining > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800">
                {hintsRemaining}
              </span>
            )}
          </div>
          <span>Hint</span>
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
// import type { Route } from "./+types/sudoku"; 
// import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PageHeader } from "../../components/PageHeader";
import { SudokuGrid } from "../../components/SudokuGrid";
import { SudokuControls } from "../../components/SudokuControls";
import { SudokuNumberPad } from "../../components/SudokuNumberPad";
import { 
  generatePuzzle, 
  checkConflicts, 
  type Board, 
  type Difficulty
} from "../../utils/sudoku";

export function meta() {
  return [
    { title: "Sudoku - Play Online" },
    { name: "description", content: "Play Sudoku online with multiple difficulty levels." },
  ];
}

export default function Sudoku() {
  // const { t } = useTranslation();
  const [board, setBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [isNoteMode, setIsNoteMode] = useState(false);

  // Initialize game
  const startNewGame = useCallback((diff: Difficulty = difficulty) => {
    const { board: newBoard, solution: newSolution } = generatePuzzle(diff);
    setBoard(newBoard);
    setSolution(newSolution);
    setDifficulty(diff);
    setTimer(0);
    setIsPaused(false);
    setHintsRemaining(3);
    setSelectedCell(null);
  }, [difficulty]);

  useEffect(() => {
    startNewGame();
  }, []); 

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isPaused && board.length > 0) { 
       const isComplete = board.every(row => row.every(cell => cell.value !== null && !cell.isError));
       if (!isComplete) {
         interval = setInterval(() => {
           setTimer(t => t + 1);
         }, 1000);
       }
    }
    return () => clearInterval(interval);
  }, [isPaused, board]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (!isPaused) {
      setSelectedCell({ row, col });
    }
  };

  // Handle number input
  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell || isPaused) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];
    
    if (cell.isGiven) return;

    if (isNoteMode) {
      // Toggle note
      const newBoard = [...board];
      const newCell = { ...newBoard[row][col] };
      const notes = newCell.notes.includes(num)
        ? newCell.notes.filter(n => n !== num)
        : [...newCell.notes, num].sort((a, b) => a - b);
      newCell.notes = notes;
      newBoard[row][col] = newCell;
      setBoard(newBoard);
    } else {
      // Set value
      if (cell.value === num) return; 

      const newBoard = board.map(r => r.map(c => ({ ...c })));
      newBoard[row][col].value = num;
      newBoard[row][col].isError = false; 
      
      const validatedBoard = checkConflicts(newBoard);
      setBoard(validatedBoard);
      
      // Check win condition
      const isFull = validatedBoard.every(r => r.every(c => c.value !== null));
      if (isFull) {
         const isCorrect = validatedBoard.every(r => r.every(c => c.value !== null && !c.isError));
         if (isCorrect) {
           toast.success(`Puzzle Completed in ${formatTime(timer)}!`);
           const saved = localStorage.getItem("sudoku-highscore");
           let highscores = saved ? JSON.parse(saved) : {};
           if (!highscores[difficulty] || timer < highscores[difficulty]) {
             highscores[difficulty] = timer;
             localStorage.setItem("sudoku-highscore", JSON.stringify(highscores));
             toast.info("New High Score!");
           }
         }
      }
    }
  }, [board, selectedCell, isPaused, isNoteMode, timer, difficulty]);

  // Handle clear
  const handleClear = useCallback(() => {
    if (!selectedCell || isPaused) return;
    const { row, col } = selectedCell;
    if (board[row][col].isGiven) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].value = null;
    newBoard[row][col].isError = false;
    const validatedBoard = checkConflicts(newBoard);
    setBoard(validatedBoard);
  }, [board, selectedCell, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused && e.key !== 'p') return; // Allow unpausing via P? Optional.
      
      // Numbers
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
        return;
      }
      
      // Clear
      if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClear();
        return;
      }

      // Arrows
      if (selectedCell) {
        const { row, col } = selectedCell;
        if (e.key === 'ArrowUp') setSelectedCell({ row: Math.max(0, row - 1), col });
        else if (e.key === 'ArrowDown') setSelectedCell({ row: Math.min(8, row + 1), col });
        else if (e.key === 'ArrowLeft') setSelectedCell({ row, col: Math.max(0, col - 1) });
        else if (e.key === 'ArrowRight') setSelectedCell({ row, col: Math.min(8, col + 1) });
      } else if (!isPaused) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
           setSelectedCell({ row: 0, col: 0 });
        }
      }
      
      // Note toggle
      if (e.key === 'n' || e.key === 'N') {
        setIsNoteMode(prev => !prev);
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedCell(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, handleNumberInput, handleClear, isPaused]);

  // Hints
  const handleHint = () => {
    if (hintsRemaining <= 0 || isPaused) return;
    
    const emptyCells: {r: number, c: number}[] = [];
    board.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.value === null) emptyCells.push({r, c});
      });
    });

    if (emptyCells.length === 0) return;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { r, c } = randomCell;
    const correctValue = solution[r][c];
    
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[r][c].value = correctValue;
    const validatedBoard = checkConflicts(newBoard);
    
    setBoard(validatedBoard);
    setHintsRemaining(h => h - 1);
    setSelectedCell({ row: r, col: c });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the puzzle?")) {
      const newBoard = board.map(row => row.map(cell => ({
        ...cell,
        value: cell.isGiven ? cell.value : null,
        isError: false,
        notes: []
      })));
      setBoard(newBoard);
      setTimer(0);
    }
  };

  // Helper for formatTime
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Compute display board with isRelated
  const displayBoard = board.map((row, r) => row.map((cell, c) => {
    let isRelated = false;
    if (selectedCell) {
       const { row: sR, col: sC } = selectedCell;
       if (r === sR || c === sC) isRelated = true;
       const sBoxR = Math.floor(sR / 3) * 3;
       const sBoxC = Math.floor(sC / 3) * 3;
       const boxR = Math.floor(r / 3) * 3;
       const boxC = Math.floor(c / 3) * 3;
       if (sBoxR === boxR && sBoxC === boxC) isRelated = true;
       // Also highlight same values
       const sVal = board[sR][sC].value;
       if (sVal !== null && cell.value === sVal) isRelated = true;
    }
    return { ...cell, isRelated };
  }));

  if (board.length === 0) return <div className="p-8 text-center">Loading game...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="Sudoku"
        description="Fill the 9x9 grid so that each column, each row, and each of the nine 3x3 subgrids contain all of the digits from 1 to 9."
      />
      
      <div className="flex flex-col lg:flex-row gap-8 justify-center items-start mt-8">
        <div className="w-full lg:w-auto flex-1 flex flex-col items-center">
          <SudokuControls 
            difficulty={difficulty}
            onDifficultyChange={(d) => startNewGame(d)}
            onNewGame={() => startNewGame()}
            onReset={handleReset}
            onHint={handleHint}
            hintsRemaining={hintsRemaining}
            timer={timer}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(p => !p)}
          />

          <div className="mt-6 w-full flex justify-center relative">
             {isPaused && (
               <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm">
                 <button 
                   onClick={() => setIsPaused(false)}
                   className="px-8 py-3 bg-blue-600 text-white rounded-full text-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
                 >
                   Resume Game
                 </button>
               </div>
             )}
             <SudokuGrid 
               board={displayBoard} 
               onCellClick={handleCellClick} 
               selectedCell={selectedCell}
             />
          </div>

          <SudokuNumberPad 
             onNumberClick={handleNumberInput} 
             onClear={handleClear}
             onNoteModeToggle={() => setIsNoteMode(prev => !prev)}
             isNoteMode={isNoteMode}
             disabled={isPaused}
          />
        </div>

        <div className="hidden lg:block w-72 space-y-6">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
             <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">How to Play</h3>
             <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
               <li>Click a cell to select it.</li>
               <li>Use keyboard or number pad to fill in numbers.</li>
               <li>Use Note Mode (N) to add pencil marks.</li>
               <li>Complete the grid so every row, column, and 3x3 box contains 1-9.</li>
               <li>Numbers cannot repeat in any row, column, or box.</li>
             </ul>
           </div>
           
           {/* Placeholder for High Scores */}
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
             <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Your High Scores</h3>
              <div className="space-y-2 text-sm">
                 {(["easy", "medium", "hard"] as const).map(d => {
                    if (typeof window === 'undefined') return null;
                    const saved = localStorage.getItem("sudoku-highscore");
                    const scores = saved ? JSON.parse(saved) : {};
                    const score = scores[d];
                    return (
                      <div key={d} className="flex justify-between text-gray-600 dark:text-gray-300 capitalize">
                         <span>{d}</span>
                         <span className="font-mono">{score ? formatTime(score) : "-"}</span>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

import { type Cell, BOARD_SIZE, BOX_SIZE } from "../utils/sudoku";

interface SudokuGridProps {
  board: Cell[][];
  onCellClick: (row: number, col: number) => void;
  selectedCell: { row: number; col: number } | null;
}

export function SudokuGrid({ board, onCellClick, selectedCell }: SudokuGridProps) {
  return (
    <div 
      className="grid grid-cols-9 bg-gray-800 border-2 border-gray-800 dark:border-gray-400 select-none shadow-2xl mx-auto rounded-lg overflow-hidden"
      style={{ aspectRatio: '1/1', maxWidth: '450px', width: '100%' }}
    >
      {board.map((row, r) => (
        row.map((cell, c) => {
          const isSelected = selectedCell?.row === r && selectedCell?.col === c;
          
          // Borders
          const isBoxRight = (c + 1) % BOX_SIZE === 0 && c !== BOARD_SIZE - 1;
          const isBoxBottom = (r + 1) % BOX_SIZE === 0 && r !== BOARD_SIZE - 1;
          
          let borderClasses = "border-[0.5px] border-gray-200 dark:border-gray-700";
          if (isBoxRight) borderClasses += " border-r-2 border-r-gray-800 dark:border-r-gray-400";
          if (isBoxBottom) borderClasses += " border-b-2 border-b-gray-800 dark:border-b-gray-400";
          
          // Backgrounds
          let bgClass = "bg-white dark:bg-gray-900";
          if (cell.isError) {
            bgClass = "bg-red-100 dark:bg-red-900/40";
          } else if (isSelected) {
            bgClass = "bg-blue-500 text-white";
          } else if (cell.isRelated) {
             bgClass = "bg-blue-50 dark:bg-blue-900/20";
          } else if (!cell.isGiven && cell.value !== null) {
             // bgClass = "bg-gray-50 dark:bg-gray-800/50"; // Optional: slightly different bg for user inputs
          }

          // Text Colors
          let textClass = "";
          if (isSelected) {
             textClass = "text-white font-semibold";
          } else if (cell.isError) {
             textClass = "text-red-600 dark:text-red-400";
          } else if (cell.isGiven) {
            textClass = "font-bold text-gray-900 dark:text-white";
          } else {
            textClass = "text-blue-600 dark:text-blue-400 font-medium";
          }

          return (
            <div
              key={`${r}-${c}`}
              onClick={() => onCellClick(r, c)}
              className={`
                relative flex items-center justify-center text-xl sm:text-2xl cursor-pointer transition-colors duration-75
                ${bgClass} ${textClass} ${borderClasses}
              `}
              role="gridcell"
            >
              {cell.value !== null ? cell.value : (
                cell.notes.length > 0 && !isSelected && (
                   <div className="grid grid-cols-3 gap-0 w-full h-full p-[2px] pointer-events-none">
                     {[1,2,3,4,5,6,7,8,9].map(n => (
                       <div key={n} className="flex items-center justify-center text-[7px] sm:text-[9px] leading-none text-gray-400 dark:text-gray-500 font-medium">
                         {cell.notes.includes(n) ? n : ''}
                       </div>
                     ))}
                   </div>
                )
              )}
            </div>
          );
        })
      ))}
    </div>
  );
}

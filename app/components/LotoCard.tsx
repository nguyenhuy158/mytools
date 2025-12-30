import { memo } from "react";
import type { LotoCard as LotoCardType } from "../types.d";

interface LotoCardProps {
  card: LotoCardType;
  cardIndex: number;
  markedCells: Set<string>;
  calledNumbers: number[];
  currentNumber: number | null;
  onCellClick: (cardIndex: number, row: number, col: number) => void;
  isInteractive: boolean;
}

export const LotoCard = memo(function LotoCard({
  card,
  cardIndex,
  markedCells,
  calledNumbers,
  currentNumber,
  onCellClick,
  isInteractive
}: LotoCardProps) {
  const getCellClassName = (row: number, col: number, value: number | null): string => {
    if (value === null) {
      return "bg-gray-100 dark:bg-gray-800";
    }

    const cellKey = `${cardIndex}:${row}:${col}`;
    const isMarked = markedCells.has(cellKey);
    const isCalled = calledNumbers.includes(value);
    const isCurrent = currentNumber === value;

    const baseClasses = "font-semibold flex items-center justify-center";

    if (isMarked) {
      return `${baseClasses} bg-green-500 text-white`;
    }

    if (isCurrent) {
      return `${baseClasses} bg-yellow-300 dark:bg-yellow-600 text-gray-900 dark:text-white ring-2 ring-yellow-500 animate-pulse`;
    }

    if (isCalled) {
      return `${baseClasses} bg-blue-200 dark:bg-blue-800 text-gray-900 dark:text-white`;
    }

    return `${baseClasses} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-600`;
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isInteractive) return;

    const value = card.grid[row][col];
    if (value === null) return;

    const cellKey = `${cardIndex}:${row}:${col}`;
    if (markedCells.has(cellKey)) return;

    if (!calledNumbers.includes(value)) return;

    onCellClick(cardIndex, row, col);
  };

  return (
    <div className="inline-block border-4 border-gray-800 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg">
      <div className="grid grid-cols-9 gap-0">
        {card.grid.map((row, rowIndex) => (
          row.map((value, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              disabled={!isInteractive || value === null}
              className={`
                w-10 h-10 md:w-12 md:h-12 text-sm md:text-base
                border border-gray-300 dark:border-gray-600
                transition-all duration-200
                ${getCellClassName(rowIndex, colIndex, value)}
                ${isInteractive && value !== null && !markedCells.has(`${cardIndex}:${rowIndex}:${colIndex}`) ? 'cursor-pointer' : 'cursor-default'}
                disabled:cursor-not-allowed
              `}
              aria-label={value ? `Number ${value}` : 'Empty cell'}
            >
              {value}
            </button>
          ))
        ))}
      </div>
    </div>
  );
});

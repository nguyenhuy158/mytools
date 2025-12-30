import type { LotoCard } from "../types.d";

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle array in place using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a valid Lô Tô card following Vietnamese rules:
 * - 9 columns × 3 rows (27 cells total)
 * - Each row: exactly 5 numbers + 4 blanks
 * - Total per card: 15 numbers distributed across 3 rows
 * - Column constraints:
 *   - Column 0: 1-9
 *   - Column 1: 10-19
 *   - Column 2: 20-29
 *   - ...
 *   - Column 8: 80-90
 */
export function generateLotoCard(): LotoCard {
  const grid: (number | null)[][] = Array(3).fill(null).map(() => Array(9).fill(null));

  // Step 1: For each row, randomly select 5 columns to have numbers
  const rowColumnChoices: number[][] = [];
  for (let row = 0; row < 3; row++) {
    const availableColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const selectedColumns = shuffle(availableColumns).slice(0, 5).sort((a, b) => a - b);
    rowColumnChoices.push(selectedColumns);
  }

  // Step 2: For each column, determine which rows will have numbers
  const columnNumbers: number[][] = Array(9).fill(null).map(() => []);

  for (let col = 0; col < 9; col++) {
    const rowsWithNumbers: number[] = [];
    for (let row = 0; row < 3; row++) {
      if (rowColumnChoices[row].includes(col)) {
        rowsWithNumbers.push(row);
      }
    }

    // Generate the required number of unique numbers for this column
    const min = col === 0 ? 1 : col * 10;
    const max = col === 8 ? 90 : col * 10 + 9;
    const numbers = generateUniqueNumbers(min, max, rowsWithNumbers.length);

    // Sort numbers for this column (top to bottom)
    numbers.sort((a, b) => a - b);

    // Assign numbers to the rows
    rowsWithNumbers.forEach((row, index) => {
      grid[row][col] = numbers[index];
    });
  }

  return {
    id: crypto.randomUUID(),
    grid
  };
}

/**
 * Generate n unique random numbers in the range [min, max]
 */
function generateUniqueNumbers(min: number, max: number, count: number): number[] {
  const numbers: number[] = [];
  const available = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  for (let i = 0; i < count; i++) {
    const index = randomInt(0, available.length - 1);
    numbers.push(available[index]);
    available.splice(index, 1);
  }

  return numbers;
}

/**
 * Validate that a card follows Vietnamese Lô Tô rules
 */
export function validateLotoCard(card: LotoCard): boolean {
  const { grid } = card;

  // Check grid dimensions
  if (grid.length !== 3) return false;
  if (grid.some(row => row.length !== 9)) return false;

  // Check each row has exactly 5 numbers and 4 blanks
  for (const row of grid) {
    const numberCount = row.filter(cell => cell !== null).length;
    if (numberCount !== 5) return false;
  }

  // Check total numbers is 15
  const totalNumbers = grid.flat().filter(cell => cell !== null).length;
  if (totalNumbers !== 15) return false;

  // Check column ranges and no duplicates
  const allNumbers = new Set<number>();
  for (let col = 0; col < 9; col++) {
    const min = col === 0 ? 1 : col * 10;
    const max = col === 8 ? 90 : col * 10 + 9;

    for (let row = 0; row < 3; row++) {
      const num = grid[row][col];
      if (num !== null) {
        if (num < min || num > max) return false;
        if (allNumbers.has(num)) return false;
        allNumbers.add(num);
      }
    }

    // Check numbers in column are sorted
    const colNumbers = grid.map(row => row[col]).filter(n => n !== null) as number[];
    for (let i = 1; i < colNumbers.length; i++) {
      if (colNumbers[i] < colNumbers[i - 1]) return false;
    }
  }

  return true;
}

/**
 * Check if a row is complete (all 5 numbers are marked)
 */
export function isRowComplete(
  card: LotoCard,
  rowIndex: number,
  markedCells: Set<string>,
  cardIndex: number
): boolean {
  const row = card.grid[rowIndex];
  let markedCount = 0;

  for (let col = 0; col < 9; col++) {
    if (row[col] !== null) {
      const cellKey = `${cardIndex}:${rowIndex}:${col}`;
      if (markedCells.has(cellKey)) {
        markedCount++;
      }
    }
  }

  return markedCount === 5;
}

/**
 * Check if any row on any card is complete for a player
 */
export function hasWinningRow(
  cards: LotoCard[],
  markedCells: Set<string>
): boolean {
  for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
      if (isRowComplete(cards[cardIndex], rowIndex, markedCells, cardIndex)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Get a random number from 1-90 that hasn't been called yet
 */
export function getNextNumber(calledNumbers: number[]): number | null {
  const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
  const remaining = allNumbers.filter(n => !calledNumbers.includes(n));

  if (remaining.length === 0) return null;

  return remaining[randomInt(0, remaining.length - 1)];
}

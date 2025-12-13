export type Difficulty = "easy" | "medium" | "hard";

export interface Cell {
  row: number;
  col: number;
  value: number | null;
  isGiven: boolean; // True if it's a starting number
  isError: boolean;
  isSelected?: boolean;
  isRelated?: boolean; // Same row/col/box/number as selected
  notes: number[];
}

export type Board = Cell[][];

// Constants
export const BOARD_SIZE = 9;
export const BOX_SIZE = 3;

// Helper to check if a number is valid in a position
export function isValid(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < BOARD_SIZE; x++) {
    if (board[row][x] === num && x !== col) return false;
  }

  // Check column
  for (let y = 0; y < BOARD_SIZE; y++) {
    if (board[y][col] === num && y !== row) return false;
  }

  // Check box
  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let y = 0; y < BOX_SIZE; y++) {
    for (let x = 0; x < BOX_SIZE; x++) {
      if (board[startRow + y][startCol + x] === num && (startRow + y !== row || startCol + x !== col)) {
        return false;
      }
    }
  }

  return true;
}

// Generate a solved board using backtracking
export function generateSolvedBoard(): number[][] {
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
  solve(board);
  return board;
}

function solve(board: number[][]): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffle(array: number[]): number[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Create puzzle by removing numbers
export function generatePuzzle(difficulty: Difficulty): { board: Board; solution: number[][] } {
  const solution = generateSolvedBoard();
  const puzzle = solution.map(row => [...row]); // Deep copy
  
  // Define holes based on difficulty
  // Easy: ~40 holes (41 givens)
  // Medium: ~50 holes (31 givens)
  // Hard: ~60 holes (21 givens)
  const holes = difficulty === "easy" ? 40 : difficulty === "medium" ? 50 : 60;

  let removed = 0;
  while (removed < holes) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  // Convert to Cell objects
  const board: Board = puzzle.map((row, r) =>
    row.map((val, c) => ({
      row: r,
      col: c,
      value: val === 0 ? null : val,
      isGiven: val !== 0,
      isError: false,
      notes: [],
    }))
  );

  return { board, solution };
}

export function checkConflicts(board: Board): Board {
  const newBoard = board.map(row => row.map(cell => ({ ...cell, isError: false })));
  
  // Check every cell against every other cell
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const val = newBoard[r][c].value;
      if (val === null) continue;

      // Check row
      for (let k = 0; k < BOARD_SIZE; k++) {
        if (k !== c && newBoard[r][k].value === val) {
          newBoard[r][c].isError = true;
          newBoard[r][k].isError = true;
        }
      }

      // Check col
      for (let k = 0; k < BOARD_SIZE; k++) {
        if (k !== r && newBoard[k][c].value === val) {
          newBoard[r][c].isError = true;
          newBoard[k][c].isError = true;
        }
      }

      // Check box
      const boxRow = Math.floor(r / BOX_SIZE) * BOX_SIZE;
      const boxCol = Math.floor(c / BOX_SIZE) * BOX_SIZE;
      for (let br = 0; br < BOX_SIZE; br++) {
        for (let bc = 0; bc < BOX_SIZE; bc++) {
          const nr = boxRow + br;
          const nc = boxCol + bc;
          if ((nr !== r || nc !== c) && newBoard[nr][nc].value === val) {
            newBoard[r][c].isError = true;
            newBoard[nr][nc].isError = true;
          }
        }
      }
    }
  }
  return newBoard;
}

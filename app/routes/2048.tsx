import { useState, useEffect, useCallback } from "react";
import { Form, useLoaderData, useSubmit, useNavigation } from "react-router";
import { Trophy, RefreshCcw, Save } from "lucide-react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

interface Score {
  name: string;
  score: number;
  date: string;
}

export async function loader({ context }: LoaderFunctionArgs) {
  const kv = context.cloudflare.env.KV_GAMES;
  const scoresStr = await kv.get("SCORES_2048");
  const scores: Score[] = scoresStr ? JSON.parse(scoresStr) : [];
  return { scores };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const score = Number(formData.get("score"));

  if (!name || isNaN(score)) {
    return { error: "Invalid input" };
  }

  const kv = context.cloudflare.env.KV_GAMES;
  const scoresStr = await kv.get("SCORES_2048");
  let scores: Score[] = scoresStr ? JSON.parse(scoresStr) : [];

  scores.push({ name, score, date: new Date().toISOString() });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10); // Keep top 10

  await kv.put("SCORES_2048", JSON.stringify(scores));
  return { success: true };
}

// Game Logic
const SIZE = 4;

function getEmptyCells(grid: number[]) {
  return grid.map((val, idx) => (val === 0 ? idx : -1)).filter((idx) => idx !== -1);
}

function addRandomTile(grid: number[]) {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) return grid;
  const randIdx = Math.floor(Math.random() * emptyCells.length);
  const cellIdx = emptyCells[randIdx];
  const newGrid = [...grid];
  newGrid[cellIdx] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
}

// Improved Logic with Score
function processMove(grid: number[], direction: "LEFT" | "RIGHT" | "UP" | "DOWN") {
  let newGrid = [...grid];
  let scoreGain = 0;
  let moved = false;

  const getRow = (g: number[], r: number) => g.slice(r * SIZE, (r + 1) * SIZE);
  const setRow = (g: number[], r: number, row: number[]) => {
    for (let c = 0; c < SIZE; c++) g[r * SIZE + c] = row[c];
  };
  const getCol = (g: number[], c: number) => {
    const col = [];
    for (let r = 0; r < SIZE; r++) col.push(g[r * SIZE + c]);
    return col;
  };
  const setCol = (g: number[], c: number, col: number[]) => {
    for (let r = 0; r < SIZE; r++) g[r * SIZE + c] = col[r];
  };

  const mergeLine = (line: number[]) => {
    let nonZero = line.filter(x => x !== 0);
    let newLine: number[] = [];
    let gain = 0;
    
    for (let i = 0; i < nonZero.length; i++) {
      if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
        const mergedVal = nonZero[i] * 2;
        newLine.push(mergedVal);
        gain += mergedVal;
        i++; // Skip next one as it was merged
      } else {
        newLine.push(nonZero[i]);
      }
    }
    
    while (newLine.length < SIZE) newLine.push(0);
    return { line: newLine, gain };
  };

  if (direction === "LEFT" || direction === "RIGHT") {
    for (let r = 0; r < SIZE; r++) {
      let row = getRow(newGrid, r);
      if (direction === "RIGHT") row.reverse();
      const { line, gain } = mergeLine(row);
      if (direction === "RIGHT") line.reverse();
      setRow(newGrid, r, line);
      scoreGain += gain;
      if (JSON.stringify(row) !== JSON.stringify(getRow(grid, r))) moved = true;
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      let col = getCol(newGrid, c);
      if (direction === "DOWN") col.reverse();
      const { line, gain } = mergeLine(col);
      if (direction === "DOWN") line.reverse();
      setCol(newGrid, c, line);
      scoreGain += gain;
      if (JSON.stringify(col) !== JSON.stringify(getCol(grid, c))) moved = true;
    }
  }

  return { newGrid, scoreGain, moved };
}

function isGameOver(grid: number[]) {
  if (getEmptyCells(grid).length > 0) return false;
  // Check possible merges
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const current = grid[r * SIZE + c];
      // Check right
      if (c < SIZE - 1 && current === grid[r * SIZE + c + 1]) return false;
      // Check down
      if (r < SIZE - 1 && current === grid[(r + 1) * SIZE + c]) return false;
    }
  }
  return true;
}

export default function Game2048() {
  const { scores } = useLoaderData() as { scores: Score[] };
  const submit = useSubmit();
  const navigation = useNavigation();
  
  const [grid, setGrid] = useState<number[]>(Array(16).fill(0));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [name, setName] = useState("");
  
  const initGame = useCallback(() => {
    let newGrid = Array(16).fill(0);
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    
    let direction: "LEFT" | "RIGHT" | "UP" | "DOWN" | null = null;
    if (e.key === "ArrowLeft") direction = "LEFT";
    else if (e.key === "ArrowRight") direction = "RIGHT";
    else if (e.key === "ArrowUp") direction = "UP";
    else if (e.key === "ArrowDown") direction = "DOWN";

    if (direction) {
      e.preventDefault();
      const { newGrid, scoreGain, moved } = processMove(grid, direction);
      if (moved) {
        const gridWithTile = addRandomTile(newGrid);
        setGrid(gridWithTile);
        setScore(prev => prev + scoreGain);
        
        if (isGameOver(gridWithTile)) {
          setGameOver(true);
        }
      }
    }
  }, [grid, gameOver]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const saveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("score", score.toString());
    submit(formData, { method: "post" });
  };

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      2: "bg-gray-200 text-gray-800",
      4: "bg-orange-100 text-gray-800",
      8: "bg-orange-200 text-white",
      16: "bg-orange-300 text-white",
      32: "bg-orange-400 text-white",
      64: "bg-orange-500 text-white",
      128: "bg-yellow-200 text-white",
      256: "bg-yellow-300 text-white",
      512: "bg-yellow-400 text-white",
      1024: "bg-yellow-500 text-white",
      2048: "bg-yellow-600 text-white",
    };
    return colors[value] || "bg-gray-800 text-white";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
      <div className="flex-1 max-w-md w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">2048</h1>
            <p className="text-gray-600 dark:text-gray-400">Join the numbers to get 2048!</p>
          </div>
          <div className="bg-gray-800 text-white p-3 rounded-lg text-center min-w-[100px]">
            <div className="text-xs uppercase font-bold text-gray-400">Score</div>
            <div className="text-xl font-bold">{score}</div>
          </div>
        </div>

        <div className="relative bg-gray-300 dark:bg-gray-700 p-4 rounded-xl shadow-lg touch-none">
          {gameOver && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 z-10 rounded-xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Game Over!</h2>
              <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">Final Score: {score}</p>
              
              <Form method="post" onSubmit={saveScore} className="w-full space-y-4 mb-6">
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
                <input type="hidden" name="score" value={score} />
                <button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Score
                </button>
              </Form>

              <button
                onClick={initGame}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white py-2 px-6 rounded-lg font-medium transition-colors"
              >
                <RefreshCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}

          <div className="grid grid-cols-4 gap-3">
            {grid.map((cell, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                  cell === 0 ? "bg-gray-200 dark:bg-gray-600" : getTileColor(cell)
                }`}
              >
                {cell !== 0 && cell}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
            <button
                onClick={initGame}
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
            >
                <RefreshCcw className="w-4 h-4" /> New Game
            </button>
        </div>
      </div>

      <div className="w-full lg:w-80 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leaderboard</h2>
        </div>
        
        <div className="space-y-4">
          {scores.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No scores yet. Be the first!</p>
          ) : (
            scores.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    idx === 0 ? "bg-yellow-100 text-yellow-700" : 
                    idx === 1 ? "bg-gray-200 text-gray-700" :
                    idx === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                      {s.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(s.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="font-bold text-indigo-600 dark:text-indigo-400">
                  {s.score}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

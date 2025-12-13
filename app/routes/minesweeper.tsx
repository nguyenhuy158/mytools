import { useState, useEffect, useCallback } from "react";
import { Flag, Bomb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GameScore } from "../components/GameScore";
import { GameOverlay } from "../components/GameOverlay";
import { GameGrid } from "../components/GameGrid";

// Game constants
const GRID_SIZE = 10;
const MINES_COUNT = 15;

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

type GameState = 'IDLE' | 'PLAYING' | 'WON' | 'LOST';

export default function MinesweeperGame() {
  const { t } = useTranslation();
  const [grid, setGrid] = useState<CellState[]>([]);
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [mineCount, setMineCount] = useState(MINES_COUNT);
  const [timer, setTimer] = useState(0);

  // Initialize grid
  const initGame = useCallback(() => {
    const newGrid: CellState[] = Array(GRID_SIZE * GRID_SIZE).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0
    }));

    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
      const idx = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
      if (!newGrid[idx].isMine) {
        newGrid[idx].isMine = true;
        minesPlaced++;
      }
    }

    for (let i = 0; i < newGrid.length; i++) {
      if (newGrid[i].isMine) continue;
      
      const x = i % GRID_SIZE;
      const y = Math.floor(i / GRID_SIZE);
      let neighbors = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            const nIdx = ny * GRID_SIZE + nx;
            if (newGrid[nIdx].isMine) neighbors++;
          }
        }
      }
      newGrid[i].neighborMines = neighbors;
    }

    setGrid(newGrid);
    setGameState('PLAYING');
    setMineCount(MINES_COUNT);
    setTimer(0);
  }, []);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState === 'PLAYING') {
      interval = setInterval(() => {
        setTimer(t => Math.min(t + 1, 999));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Start game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  const revealCell = (idx: number) => {
    if (gameState !== 'PLAYING' || grid[idx].isFlagged || grid[idx].isRevealed) return;

    const newGrid = [...grid];
    
    if (newGrid[idx].isMine) {
      newGrid.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      });
      setGrid(newGrid);
      setGameState('LOST');
      return;
    }

    const queue = [idx];
    while (queue.length > 0) {
      const currentIdx = queue.shift()!;
      if (newGrid[currentIdx].isRevealed) continue;
      
      newGrid[currentIdx].isRevealed = true;

      if (newGrid[currentIdx].neighborMines === 0) {
        const x = currentIdx % GRID_SIZE;
        const y = Math.floor(currentIdx / GRID_SIZE);

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
              const nIdx = ny * GRID_SIZE + nx;
              if (!newGrid[nIdx].isRevealed && !newGrid[nIdx].isFlagged) {
                queue.push(nIdx);
              }
            }
          }
        }
      }
    }

    setGrid(newGrid);

    const unrevealedSafeCells = newGrid.filter(cell => !cell.isMine && !cell.isRevealed).length;
    if (unrevealedSafeCells === 0) {
      setGameState('WON');
    }
  };

  const toggleFlag = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    if (gameState !== 'PLAYING' || grid[idx].isRevealed) return;

    const newGrid = [...grid];
    newGrid[idx].isFlagged = !newGrid[idx].isFlagged;
    setGrid(newGrid);
    setMineCount(prev => newGrid[idx].isFlagged ? prev - 1 : prev + 1);
  };

  const getNumberColor = (num: number) => {
    const colors = [
      '',
      'text-blue-500',
      'text-green-500',
      'text-red-500',
      'text-purple-500',
      'text-yellow-600',
      'text-teal-500',
      'text-gray-800',
      'text-gray-800'
    ];
    return colors[num] || 'text-gray-800';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex-1 max-w-md w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
           <div>
             <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{t("games.minesweeper.name")}</h1>
             <p className="text-gray-600 dark:text-gray-400">{t("games.minesweeper.description")}</p>
           </div>
        </div>

        {/* HUD */}
        <div className="flex justify-between items-center gap-4">
          <GameScore score={mineCount} label="Mines" />
          
          <button 
            onClick={initGame}
            className="p-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm border border-gray-200 dark:border-gray-700"
            title="Reset Game"
          >
            <div className="text-3xl">
              {gameState === 'PLAYING' ? '🙂' : gameState === 'LOST' ? '😵' : gameState === 'WON' ? '😎' : '🙂'}
            </div>
          </button>

          <GameScore score={timer} label="Time" />
        </div>

        <GameGrid className="bg-gray-200 dark:bg-gray-700 p-2">
          <GameOverlay 
            isVisible={gameState === 'WON' || gameState === 'LOST'}
            title={gameState === 'WON' ? 'YOU WON!' : 'GAME OVER!'}
            onRestart={initGame}
            restartLabel={t("games.2048.try_again")}
          />

          <div 
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {grid.map((cell, i) => (
               <button
                 key={i}
                 onClick={() => revealCell(i)}
                 onContextMenu={(e) => toggleFlag(e, i)}
                 disabled={gameState === 'WON' || gameState === 'LOST'}
                 className={`
                   aspect-square flex items-center justify-center font-bold text-lg rounded-sm transition-all duration-75 select-none
                   ${cell.isRevealed 
                     ? 'bg-gray-50 dark:bg-gray-800 shadow-inner' 
                     : 'bg-gray-300 dark:bg-gray-600 hover:brightness-110 shadow-[inset_-2px_-2px_0_0_rgba(0,0,0,0.1),inset_2px_2px_0_0_rgba(255,255,255,0.4)] active:shadow-inner active:scale-95'
                   }
                   ${cell.isMine && cell.isRevealed ? 'bg-red-500 dark:bg-red-600' : ''}
                 `}
               >
                 {cell.isRevealed ? (
                   cell.isMine ? <Bomb size={20} className="text-white fill-white" /> : 
                   cell.neighborMines > 0 ? (
                     <span className={getNumberColor(cell.neighborMines)}>{cell.neighborMines}</span>
                   ) : ''
                 ) : (
                   cell.isFlagged ? <Flag size={18} className="text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" /> : ''
                 )}
               </button>
            ))}
          </div>
        </GameGrid>
        
        <div className="text-sm text-center text-gray-500 dark:text-gray-400">
          Left click to reveal • Right click to flag
        </div>
      </div>
    </div>
  );
}

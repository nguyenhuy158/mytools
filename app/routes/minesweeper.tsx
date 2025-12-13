import { useState, useEffect, useCallback } from "react";
import { RetroContainer } from "../components/RetroContainer";
import { Flag, Bomb } from "lucide-react";

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
  const [grid, setGrid] = useState<CellState[]>([]);
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [mineCount, setMineCount] = useState(MINES_COUNT);
  const [timer, setTimer] = useState(0);

  // Initialize grid
  const initGame = useCallback(() => {
    // Create empty grid
    const newGrid: CellState[] = Array(GRID_SIZE * GRID_SIZE).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0
    }));

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
      const idx = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
      if (!newGrid[idx].isMine) {
        newGrid[idx].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbors
    for (let i = 0; i < newGrid.length; i++) {
      if (newGrid[i].isMine) continue;
      
      const x = i % GRID_SIZE;
      const y = Math.floor(i / GRID_SIZE);
      let neighbors = 0;

      // Check all 8 neighbors
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
    
    // Hit mine
    if (newGrid[idx].isMine) {
      // Reveal all mines
      newGrid.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      });
      setGrid(newGrid);
      setGameState('LOST');
      return;
    }

    // Flood fill for empty cells
    const queue = [idx];
    while (queue.length > 0) {
      const currentIdx = queue.shift()!;
      if (newGrid[currentIdx].isRevealed) continue;
      
      newGrid[currentIdx].isRevealed = true;

      // If no neighbors, add neighbors to queue
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

    // Check win condition
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

  return (
    <RetroContainer title="MINESWEEPER">
      <div className="flex flex-col items-center w-full max-w-[300px]">
        
        {/* HUD */}
        <div className="flex justify-between w-full mb-4 px-2 border-2 border-[#43523d] bg-[#c7f0d8] p-1">
          <div className="flex items-center gap-1 font-bold text-xl w-16">
            <div className="bg-[#c7f0d8] text-[#43523d] px-1">{String(mineCount).padStart(3, '0')}</div>
          </div>
          
          <button onClick={initGame} className="border-2 border-[#43523d] p-1 active:border-b-0 active:translate-y-[2px]">
            {gameState === 'PLAYING' ? '🙂' : gameState === 'LOST' ? '😵' : '😎'}
          </button>

          <div className="flex items-center justify-end gap-1 font-bold text-xl w-16">
            <div className="bg-[#c7f0d8] text-[#43523d] px-1">{String(timer).padStart(3, '0')}</div>
          </div>
        </div>

        {/* Game Grid */}
        <div 
          className="relative bg-[#c7f0d8] border-4 border-[#43523d]"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: '1px',
            backgroundColor: '#43523d', // Gap color
            width: 'fit-content'
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {grid.map((cell, i) => (
             <div 
               key={i}
               onClick={() => revealCell(i)}
               onContextMenu={(e) => toggleFlag(e, i)}
               className={`
                 w-8 h-8 flex items-center justify-center font-bold text-sm cursor-pointer select-none
                 ${cell.isRevealed 
                   ? 'bg-[#c7f0d8]' 
                   : 'bg-[#c7f0d8] shadow-[inset_-2px_-2px_0_0_#43523d,inset_2px_2px_0_0_white]' // Raised effect
                 }
               `}
             >
               {cell.isRevealed ? (
                 cell.isMine ? <Bomb size={20} className="fill-[#43523d]" /> : 
                 cell.neighborMines > 0 ? cell.neighborMines : ''
               ) : (
                 cell.isFlagged ? <Flag size={16} className="fill-[#43523d]" /> : ''
               )}
             </div>
          ))}
        </div>
        
        {/* Game Over Message */}
        {(gameState === 'WON' || gameState === 'LOST') && (
           <div className="mt-4 font-bold text-center animate-bounce">
             {gameState === 'WON' ? 'YOU WON!' : 'GAME OVER!'}
           </div>
        )}

         <div className="mt-4 text-xs text-center opacity-75">
          LEFT CLICK: REVEAL • RIGHT CLICK: FLAG
        </div>
      </div>
    </RetroContainer>
  );
}

import type { MetaFunction } from "react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RotateCcw, Trophy, Pause, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { SwipeDetector } from "../../components/SwipeDetector";
import type { SwipeEvent } from "../../utils/touch";

// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 800;

type Point = { x: number; y: number };
type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

const TETROMINOES: Record<TetrominoType, { shape: number[][], color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400 border-cyan-500' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-500 border-blue-600' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500 border-orange-600' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400 border-yellow-500' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500 border-green-600' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500 border-purple-600' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500 border-red-600' },
};

const getRandomTetromino = () => {
  const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    type,
    shape: TETROMINOES[type].shape,
    color: TETROMINOES[type].color,
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Tetris - Play Online | ToolHub" },
    { name: "description", content: "Stack the falling blocks and clear lines." },
  ];
};

export default function TetrisGame() {
  const [board, setBoard] = useState<string[][]>(
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(''))
  );
  const [currentPiece, setCurrentPiece] = useState<{ shape: number[][], pos: Point, type: TetrominoType, color: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tetris-highscore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const spawnPiece = useCallback(() => {
    const piece = getRandomTetromino();
    const newPos = { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2), y: 0 };
    
    // Check collision on spawn
    if (checkCollision(piece.shape, newPos, board)) {
      setGameOver(true);
      setIsPlaying(false);
      return null;
    }
    
    setCurrentPiece({ ...piece, pos: newPos });
    return piece;
  }, [board]);

  const checkCollision = (shape: number[][], pos: Point, currentBoard: string[][]) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = pos.x + x;
          const boardY = pos.y + y;

          if (
            boardX < 0 || 
            boardX >= BOARD_WIDTH || 
            boardY >= BOARD_HEIGHT ||
            (boardY >= 0 && currentBoard[boardY][boardX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePiece = (piece: { shape: number[][], pos: Point, type: TetrominoType }) => {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          if (piece.pos.y + y >= 0) {
            newBoard[piece.pos.y + y][piece.pos.x + x] = piece.type;
          }
        }
      }
    }
    return newBoard;
  };

  const clearLines = (currentBoard: string[][]) => {
    let linesCleared = 0;
    const newBoard = currentBoard.filter(row => {
      const isFull = row.every(cell => cell !== '');
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(''));
    }

    if (linesCleared > 0) {
      const points = [0, 40, 100, 300, 1200];
      setScore(s => {
        const newScore = s + points[linesCleared];
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem("tetris-highscore", newScore.toString());
        }
        return newScore;
      });
    }

    return newBoard;
  };

  const gameTick = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const newPos = { ...currentPiece.pos, y: currentPiece.pos.y + 1 };
    
    if (checkCollision(currentPiece.shape, newPos, board)) {
      // Lock piece
      const newBoard = mergePiece(currentPiece);
      const clearedBoard = clearLines(newBoard);
      setBoard(clearedBoard);
      spawnPiece();
    } else {
      setCurrentPiece({ ...currentPiece, pos: newPos });
    }
  }, [currentPiece, board, gameOver, isPaused, spawnPiece, highScore]);

  useEffect(() => {
    if (isPlaying && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(gameTick, INITIAL_SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, isPaused, gameTick]);

  const move = (dir: number) => {
    if (!currentPiece || gameOver || isPaused) return;
    const newPos = { ...currentPiece.pos, x: currentPiece.pos.x + dir };
    if (!checkCollision(currentPiece.shape, newPos, board)) {
      setCurrentPiece({ ...currentPiece, pos: newPos });
    }
  };

  const rotate = () => {
    if (!currentPiece || gameOver || isPaused) return;
    const newShape = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map(row => row[index]).reverse()
    );
    if (!checkCollision(newShape, currentPiece.pos, board)) {
      setCurrentPiece({ ...currentPiece, shape: newShape });
    }
  };

  const drop = () => {
    if (!currentPiece || gameOver || isPaused) return;
    let newPos = { ...currentPiece.pos };
    while (!checkCollision(currentPiece.shape, { ...newPos, y: newPos.y + 1 }, board)) {
      newPos.y += 1;
    }
    setCurrentPiece({ ...currentPiece, pos: newPos });
    // Force immediate tick to lock will be handled by next interval or we could force it
  };

  const resetGame = () => {
    setBoard(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill('')));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
  };

  // Touch/swipe handler
  const handleSwipe = useCallback((event: SwipeEvent) => {
    if (!isPlaying || isPaused || gameOver) return;

    switch (event.direction) {
      case 'LEFT':
        move(-1);
        break;
      case 'RIGHT':
        move(1);
        break;
      case 'DOWN':
        gameTick(); // Soft drop
        break;
      case 'UP':
        rotate(); // Swipe up to rotate
        break;
    }
  }, [isPlaying, isPaused, gameOver]);

  useEffect(() => {
    if (isPlaying && !currentPiece && !gameOver) {
      spawnPiece();
    }
  }, [isPlaying, currentPiece, gameOver, spawnPiece]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === " " && !isPlaying) {
        resetGame();
        return;
      }

      if (e.key === "p" || e.key === "P") {
        setIsPaused(prev => !prev);
        return;
      }

      if (!isPlaying || isPaused) return;

      switch (e.key) {
        case 'ArrowLeft': move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowUp': rotate(); break;
        case 'ArrowDown': gameTick(); break; // Soft drop
        case ' ': drop(); break; // Hard drop
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isPaused, currentPiece, board, gameOver]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row max-w-4xl w-full">
        
        {/* Left Side - Game Board */}
        <div className="p-6 md:p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950/50 flex-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
          <SwipeDetector
            onSwipe={handleSwipe}
            onTap={rotate}
            disabled={!isPlaying || isPaused || gameOver}
          >
            <div className="relative">
              {/* Board Background/Container */}
              <div
                className="relative bg-gray-900 dark:bg-black rounded-lg overflow-hidden shadow-inner ring-4 ring-gray-200 dark:ring-gray-800"
                style={{
                  width: '300px', // 30px per cell
                  height: '600px',
                  display: 'grid',
                  gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                  gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
                }}
              >
              {/* Overlay for Game Over / Start */}
              {(!isPlaying && !gameOver && score === 0) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 text-center text-white p-6">
                   <h1 className="text-4xl font-black mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">TETRIS</h1>
                   <p className="mb-6 text-gray-300">Ready to play?</p>
                   <button 
                     onClick={resetGame}
                     className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-indigo-600 font-lg rounded-full hover:bg-indigo-700 hover:scale-105 focus:outline-none ring-offset-2 focus:ring-2 ring-indigo-500"
                   >
                     <Play className="w-5 h-5 mr-2 fill-current" /> START GAME
                   </button>
                </div>
              )}

              {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20 text-center text-white">
                  <h2 className="text-3xl font-bold mb-2 text-red-500">GAME OVER</h2>
                  <p className="text-xl mb-6">Score: {score}</p>
                  <button 
                     onClick={resetGame}
                     className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-colors"
                   >
                     <RotateCcw size={18} /> Try Again
                   </button>
                </div>
              )}
              
              {isPaused && isPlaying && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-20 text-center text-white">
                  <h2 className="text-2xl font-bold mb-4">PAUSED</h2>
                  <button 
                     onClick={() => setIsPaused(false)}
                     className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                   >
                     <Play size={32} className="fill-white" />
                   </button>
                 </div>
              )}

              {/* Grid Cells */}
              {Array.from({ length: BOARD_HEIGHT * BOARD_WIDTH }).map((_, i) => {
                 const x = i % BOARD_WIDTH;
                 const y = Math.floor(i / BOARD_WIDTH);
                 
                 let isFilled = board[y][x] !== '';
                 let cellColor = isFilled ? TETROMINOES[board[y][x] as TetrominoType].color : '';
                 let isPiece = false;
                 
                 if (currentPiece && !isFilled) {
                    const pieceY = y - currentPiece.pos.y;
                    const pieceX = x - currentPiece.pos.x;
                    if (
                      pieceY >= 0 && pieceY < currentPiece.shape.length &&
                      pieceX >= 0 && pieceX < currentPiece.shape[0].length &&
                      currentPiece.shape[pieceY][pieceX]
                    ) {
                      isPiece = true;
                      cellColor = currentPiece.color;
                    }
                 }

                 return (
                   <div 
                     key={i}
                     className={`
                       ${(isFilled || isPiece) ? `${cellColor} shadow-[inset_0_0_8px_rgba(0,0,0,0.25)] border-b-4 border-r-4 border-black/10 rounded-sm` : 'border border-white/5'}
                     `}
                   />
                 );
              })}
              </div>
            </div>
          </SwipeDetector>

          {/* Mobile Control Buttons */}
          <div className="mt-6 flex gap-3 md:hidden">
            <button
              onClick={() => move(-1)}
              disabled={!isPlaying || isPaused || gameOver}
              className="flex items-center justify-center w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 active:bg-gray-300 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-none"
              aria-label="Move Left"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={rotate}
              disabled={!isPlaying || isPaused || gameOver}
              className="flex items-center justify-center w-14 h-14 rounded-lg bg-indigo-500 dark:bg-indigo-600 text-white active:bg-indigo-600 dark:active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-none"
              aria-label="Rotate"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={() => move(1)}
              disabled={!isPlaying || isPaused || gameOver}
              className="flex items-center justify-center w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 active:bg-gray-300 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-none"
              aria-label="Move Right"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <button
              onClick={drop}
              disabled={!isPlaying || isPaused || gameOver}
              className="flex items-center justify-center w-14 h-14 rounded-lg bg-orange-500 dark:bg-orange-600 text-white active:bg-orange-600 dark:active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-none"
              aria-label="Drop"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right Side - Stats & Info */}
        <div className="p-6 md:p-8 flex flex-col min-w-[300px]">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-1">TETRIS</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Classic Puzzle Game</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Score</span>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{score}</span>
             </div>
             <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl flex flex-col items-center justify-center border border-yellow-100 dark:border-yellow-900/30">
                <div className="flex items-center gap-1 mb-1 text-yellow-600 dark:text-yellow-500">
                  <Trophy size={12} />
                  <span className="text-xs font-bold uppercase tracking-wider">Best</span>
                </div>
                <span className="text-3xl font-black text-yellow-700 dark:text-yellow-500">{highScore}</span>
             </div>
          </div>

          <div className="space-y-3 mb-auto">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Controls</h3>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <span>Move</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm text-xs">←</kbd>
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm text-xs">→</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <span>Rotate</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm text-xs">↑</kbd>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <span>Fast Drop</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm text-xs">↓</kbd>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <span>Instant Drop</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm text-xs font-sans">Space</kbd>
            </div>
             <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
              <span>Pause</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm text-xs font-sans">P</kbd>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
             <button 
               onClick={() => setIsPaused(prev => !prev)}
               disabled={!isPlaying || gameOver}
               className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isPaused ? <Play size={18} /> : <Pause size={18} />}
               {isPaused ? "RESUME" : "PAUSE"}
             </button>
             <button 
               onClick={resetGame}
               className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
             >
               <RotateCcw size={18} /> RESET
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

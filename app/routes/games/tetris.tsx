import { useState, useEffect, useCallback, useRef } from "react";
import { RetroContainer } from "../../components/RetroContainer";
import { Play, RotateCcw } from "lucide-react";

// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 800;

type Point = { x: number; y: number };
type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

const TETROMINOES: Record<TetrominoType, { shape: number[][], color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: '#43523d' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#43523d' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#43523d' },
  O: { shape: [[1, 1], [1, 1]], color: '#43523d' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#43523d' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#43523d' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#43523d' },
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

export default function TetrisGame() {
  const [board, setBoard] = useState<string[][]>(
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(''))
  );
  const [currentPiece, setCurrentPiece] = useState<{ shape: number[][], pos: Point, type: TetrominoType } | null>(null);
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
    // Force immediate tick to lock
    // Actually, letting the next tick handle it feels more natural or we can lock immediately
    // Let's just move it down and let the next tick lock it
  };

  const resetGame = () => {
    setBoard(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill('')));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
    // Need to spawn first piece
    // We can't call spawnPiece here directly because state updates are async
    // Instead we'll rely on a useEffect or just set initial state carefully
    // Let's trigger a spawn via effect when playing becomes true?
    // Or just clear board and let the loop handle it?
    // Actually, spawnPiece depends on board.
    // Let's set currentPiece to null and let an effect handle spawn if null and playing
  };

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
    <RetroContainer title="TETRIS">
      <div className="flex flex-col items-center w-full max-w-[300px]">
        
        {/* Score Board */}
        <div className="flex justify-between w-full mb-2 font-bold text-sm">
          <span>SCORE: {score}</span>
          <span>HI: {highScore}</span>
        </div>

        {/* Game Area */}
        <div 
          className="relative bg-[#c7f0d8] border-2 border-[#43523d]"
          style={{
            width: '250px', // 25px per cell
            height: '500px',
            display: 'grid',
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
          }}
        >
          {/* Overlay for Game Over / Start */}
          {(!isPlaying && !gameOver && score === 0) && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#c7f0d8]/80 z-10 text-center">
               <p className="mb-2 font-bold">PRESS SPACE</p>
               <button 
                 onClick={resetGame}
                 className="flex items-center gap-2 px-4 py-2 border-2 border-[#43523d] hover:bg-[#43523d] hover:text-[#c7f0d8] transition-colors font-bold"
               >
                 <Play size={16} /> PLAY
               </button>
             </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#c7f0d8]/80 z-10 text-center">
              <p className="mb-2 font-bold text-xl">GAME OVER</p>
              <button 
                 onClick={resetGame}
                 className="flex items-center gap-2 px-4 py-2 border-2 border-[#43523d] hover:bg-[#43523d] hover:text-[#c7f0d8] transition-colors font-bold"
               >
                 <RotateCcw size={16} /> RETRY
               </button>
            </div>
          )}

          {/* Grid Cells */}
          {Array.from({ length: BOARD_HEIGHT * BOARD_WIDTH }).map((_, i) => {
             const x = i % BOARD_WIDTH;
             const y = Math.floor(i / BOARD_WIDTH);
             
             let isFilled = board[y][x] !== '';
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
                }
             }

             return (
               <div 
                 key={i}
                 className={`
                   ${(isFilled || isPiece) ? 'bg-[#43523d]' : ''}
                 `}
                 style={{
                    border: '1px solid rgba(67, 82, 61, 0.1)' 
                 }}
               />
             );
          })}
        </div>
        
        <div className="mt-4 text-xs text-center opacity-75">
          ARROWS: MOVE/ROTATE • SPACE: DROP
        </div>
      </div>
    </RetroContainer>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { RetroContainer } from "../components/RetroContainer";
import { Play, RotateCcw } from "lucide-react";

// Game constants
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Use ref for direction to prevent multiple direction changes in one tick
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Load high score from local storage
    const saved = localStorage.getItem("snake-highscore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    let isOnSnake;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (isOnSnake);
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (directionRef.current) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collisions with walls
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // Check collisions with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const newScore = s + 1;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("snake-highscore", newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop(); // Remove tail
      }

      return newSnake;
    });
  }, [food, gameOver, highScore, generateFood]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === " " && !isPlaying && !gameOver) {
        resetGame();
        return;
      }

      if (!isPlaying) return;

      const currentDir = directionRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
          if (currentDir !== 'DOWN') directionRef.current = 'UP';
          break;
        case 'ArrowDown':
          if (currentDir !== 'UP') directionRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
          if (currentDir !== 'RIGHT') directionRef.current = 'LEFT';
          break;
        case 'ArrowRight':
          if (currentDir !== 'LEFT') directionRef.current = 'RIGHT';
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver]);

  return (
    <RetroContainer title="SNAKE">
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
            width: '300px',
            height: '300px',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {/* Overlay for Game Over / Start */}
          {(!isPlaying && !gameOver && score === 0) && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#c7f0d8]/80 z-10 text-center">
               <p className="mb-2 font-bold">PRESS START</p>
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
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
             const x = i % GRID_SIZE;
             const y = Math.floor(i / GRID_SIZE);
             const isSnake = snake.some(s => s.x === x && s.y === y);
             const isFood = food.x === x && food.y === y;
             
             return (
               <div 
                 key={i}
                 className={`
                   ${isSnake ? 'bg-[#43523d]' : ''}
                   ${isFood ? 'bg-[#43523d] animate-pulse rounded-full' : ''}
                 `}
                 style={{
                    // Small gap for grid effect if desired, but pixel perfect is better
                    border: '1px solid rgba(67, 82, 61, 0.05)' 
                 }}
               />
             );
          })}
        </div>
        
        <div className="mt-4 text-xs text-center opacity-75">
          USE ARROW KEYS TO MOVE
        </div>
      </div>
    </RetroContainer>
  );
}

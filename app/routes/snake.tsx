import { useState, useEffect, useCallback, useRef } from "react";
import { Play } from "lucide-react";
import { GameScore } from "../components/GameScore";
import { GameOverlay } from "../components/GameOverlay";
import { GameGrid } from "../components/GameGrid";
import { SwipeDetector } from "../components/SwipeDetector";
import { DirectionalControls } from "../components/DirectionalControls";
import type { SwipeDirection } from "../utils/touch";

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
  
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
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

  // Unified direction handler for both keyboard and touch controls
  const handleDirectionChange = useCallback((direction: SwipeDirection) => {
    if (!isPlaying) return;

    const currentDir = directionRef.current;

    // Prevent reversing direction (can't go opposite way)
    if (direction === 'UP' && currentDir !== 'DOWN') directionRef.current = 'UP';
    else if (direction === 'DOWN' && currentDir !== 'UP') directionRef.current = 'DOWN';
    else if (direction === 'LEFT' && currentDir !== 'RIGHT') directionRef.current = 'LEFT';
    else if (direction === 'RIGHT' && currentDir !== 'LEFT') directionRef.current = 'RIGHT';
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === " " && !isPlaying && !gameOver) {
        resetGame();
        return;
      }

      if (!isPlaying) return;

      let direction: SwipeDirection | null = null;
      if (e.key === 'ArrowUp') direction = 'UP';
      else if (e.key === 'ArrowDown') direction = 'DOWN';
      else if (e.key === 'ArrowLeft') direction = 'LEFT';
      else if (e.key === 'ArrowRight') direction = 'RIGHT';

      if (direction) {
        handleDirectionChange(direction);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, handleDirectionChange]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">SNAKE</h1>
          <div className="flex gap-4">
            <GameScore score={score} label="Score" />
            <GameScore score={highScore} label="Best" className="bg-yellow-600" />
          </div>
        </div>

        <SwipeDetector
          onSwipe={(event) => handleDirectionChange(event.direction)}
          disabled={!isPlaying || gameOver}
        >
          <GameGrid className="aspect-square bg-gray-900 dark:bg-black p-1 border-4 border-gray-800 dark:border-gray-800">
            <GameOverlay
              isVisible={!isPlaying || gameOver}
              title={gameOver ? "GAME OVER" : "SNAKE"}
              message={gameOver ? `Score: ${score}` : "Press Start to Play"}
              onRestart={resetGame}
              restartLabel={gameOver ? "Try Again" : "Start Game"}
            >
               {!gameOver && !isPlaying && score === 0 && (
                 <button
                   onClick={resetGame}
                   className="btn btn-primary mt-4"
                 >
                   <Play className="w-4 h-4" /> Start Game
                 </button>
               )}
            </GameOverlay>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                height: '100%',
                width: '100%'
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                 const x = i % GRID_SIZE;
                 const y = Math.floor(i / GRID_SIZE);
                 const isSnake = snake.some(s => s.x === x && s.y === y);
                 const isFood = food.x === x && food.y === y;
                 const isHead = snake[0].x === x && snake[0].y === y;

                 return (
                   <div
                     key={i}
                     className={`
                       rounded-sm border border-gray-900/50
                       ${isHead ? 'bg-green-400 z-10' : isSnake ? 'bg-green-600' : ''}
                       ${isFood ? 'bg-red-500 rounded-full scale-75' : ''}
                       ${!isSnake && !isFood ? 'bg-gray-800/20' : ''}
                     `}
                   />
                 );
              })}
            </div>
          </GameGrid>
        </SwipeDetector>

        <DirectionalControls
          onDirection={handleDirectionChange}
          disabled={!isPlaying || gameOver}
          className="mt-4"
        />

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Use arrow keys or swipe to move • Space to restart
        </div>
      </div>
    </div>
  );
}

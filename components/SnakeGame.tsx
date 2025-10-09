'use client';

import { useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onGameOver: (score: number) => void;
}

export function SnakeGame({ onGameOver }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const onGameOverRef = useRef(onGameOver);
  const hasCalledGameOverRef = useRef(false);

  const GRID_SIZE = 20;
  const CELL_SIZE = 15;

  // Keep onGameOver ref updated
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  // Call onGameOver only once when game ends
  useEffect(() => {
    if (gameOver && !hasCalledGameOverRef.current) {
      hasCalledGameOverRef.current = true;
      onGameOverRef.current(score);
    }
  }, [gameOver, score]);

  // Handle keyboard input
  useEffect(() => {
    if (gameOver) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      const newSnake = [...snake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check collision with walls
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return;
      }

      // Check collision with self
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return;
      }

      newSnake.unshift(head);

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 1);
        // Generate new food
        const newFood = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        };
        setFood(newFood);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [snake, direction, food, gameOver]);

  return (
    <div className="flex flex-col items-center py-4" ref={gameAreaRef}>
      <div className="mb-2 text-xs opacity-70">
        Score: {score} | WASD/Arrows to move
      </div>
      <div
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          border: '1px solid var(--border-color)',
          position: 'relative',
          backgroundColor: 'rgba(128, 128, 128, 0.05)',
        }}
      >
        {/* Snake */}
        {snake.map((segment, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              backgroundColor: i === 0 ? 'var(--text-color)' : 'var(--text-color)',
              opacity: i === 0 ? 1 : 0.7,
              borderRadius: i === 0 ? '2px' : '1px',
            }}
          />
        ))}
        {/* Food */}
        <div
          style={{
            position: 'absolute',
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            backgroundColor: 'var(--text-color)',
            opacity: 0.5,
            borderRadius: '50%',
          }}
        />
      </div>
      {gameOver && (
        <div className="mt-2 text-xs opacity-70">
          Game Over! Final Score: {score}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface Game2048Props {
  onGameOver: (score: number) => void;
}

type Board = number[][];

export function Game2048({ onGameOver }: Game2048Props) {
  const [board, setBoard] = useState<Board>(initBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  function initBoard(): Board {
    const newBoard: Board = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    return newBoard;
  }

  function addRandomTile(board: Board) {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }

    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  function moveLeft(board: Board): { board: Board; moved: boolean; scoreGained: number } {
    let moved = false;
    let scoreGained = 0;
    const newBoard = board.map(row => [...row]);

    for (let i = 0; i < 4; i++) {
      const row = newBoard[i].filter(val => val !== 0);
      const newRow: number[] = [];

      for (let j = 0; j < row.length; j++) {
        if (j < row.length - 1 && row[j] === row[j + 1]) {
          newRow.push(row[j] * 2);
          scoreGained += row[j] * 2;
          j++;
          moved = true;
        } else {
          newRow.push(row[j]);
        }
      }

      while (newRow.length < 4) {
        newRow.push(0);
      }

      if (newRow.join(',') !== newBoard[i].join(',')) {
        moved = true;
      }

      newBoard[i] = newRow;
    }

    return { board: newBoard, moved, scoreGained };
  }

  function rotateBoard(board: Board): Board {
    const newBoard: Board = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        newBoard[j][3 - i] = board[i][j];
      }
    }
    return newBoard;
  }

  function move(direction: 'left' | 'right' | 'up' | 'down') {
    if (gameOver) return;

    let rotations = 0;
    if (direction === 'right') rotations = 2;
    if (direction === 'up') rotations = 3;
    if (direction === 'down') rotations = 1;

    let currentBoard = [...board.map(row => [...row])];

    for (let i = 0; i < rotations; i++) {
      currentBoard = rotateBoard(currentBoard);
    }

    const { board: movedBoard, moved, scoreGained } = moveLeft(currentBoard);

    for (let i = 0; i < (4 - rotations) % 4; i++) {
      currentBoard = rotateBoard(movedBoard);
    }

    if (moved) {
      addRandomTile(currentBoard);
      setBoard(currentBoard);
      setScore(prev => prev + scoreGained);

      if (isGameOver(currentBoard)) {
        setGameOver(true);
        onGameOver(score + scoreGained);
      }
    }
  }

  function isGameOver(board: Board): boolean {
    // Check if any empty cell exists
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // Check if any merge is possible
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === board[i][j + 1]) return false;
        if (board[j][i] === board[j + 1][i]) return false;
      }
    }

    return true;
  }

  useEffect(() => {
    if (gameOver) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          move('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          move('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      0: 'rgba(128, 128, 128, 0.05)',
      2: 'rgba(128, 128, 128, 0.15)',
      4: 'rgba(128, 128, 128, 0.25)',
      8: 'rgba(128, 128, 128, 0.35)',
      16: 'rgba(128, 128, 128, 0.45)',
      32: 'rgba(128, 128, 128, 0.55)',
      64: 'rgba(128, 128, 128, 0.65)',
      128: 'rgba(128, 128, 128, 0.75)',
      256: 'rgba(128, 128, 128, 0.80)',
      512: 'rgba(128, 128, 128, 0.85)',
      1024: 'rgba(128, 128, 128, 0.90)',
      2048: 'rgba(128, 128, 128, 0.95)',
    };
    return colors[value] || 'rgba(128, 128, 128, 1)';
  };

  return (
    <div className="flex flex-col items-center py-4">
      <div className="mb-2 text-xs opacity-70">
        Score: {score} | WASD/Arrows to move
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 60px)',
          gridTemplateRows: 'repeat(4, 60px)',
          gap: '8px',
          padding: '8px',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
        }}
      >
        {board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              style={{
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: getTileColor(cell),
                color: 'var(--text-color)',
                fontWeight: 'bold',
                fontSize: cell >= 1000 ? '14px' : '18px',
                borderRadius: '2px',
              }}
            >
              {cell !== 0 && cell}
            </div>
          ))
        )}
      </div>
      {gameOver && (
        <div className="mt-2 text-xs opacity-70">
          Game Over! Final Score: {score}
        </div>
      )}
    </div>
  );
}

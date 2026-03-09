import React, { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20; // in pixels, for canvas drawing
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 80;

type Point = { x: number; y: number };
type TrailSegment = { x: number; y: number; life: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const directionRef = useRef<Direction>(direction);
  const lastMoveTimeRef = useRef<number>(0);
  const requestRef = useRef<number>();
  const trailRef = useRef<TrailSegment[]>([]);

  // Use refs for state accessed in the animation loop to avoid stale closures
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);
  const hasStartedRef = useRef(hasStarted);

  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { hasStartedRef.current = hasStarted; }, [hasStarted]);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  }, []);

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    trailRef.current = [];
    setFood(generateFood(initialSnake));
    setScore(0);
    setGameOver(false);
    setHasStarted(true);
    setIsPaused(false);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === ' ' && hasStartedRef.current && !gameOverRef.current) {
      setIsPaused(prev => !prev);
      return;
    }

    if (!hasStartedRef.current || isPausedRef.current || gameOverRef.current) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (directionRef.current !== 'DOWN') directionRef.current = 'UP';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (directionRef.current !== 'UP') directionRef.current = 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (directionRef.current !== 'RIGHT') directionRef.current = 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (directionRef.current !== 'LEFT') directionRef.current = 'RIGHT';
        break;
    }
    setDirection(directionRef.current);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000'; // Pure black
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid lines (raw, pixelated)
    ctx.strokeStyle = '#00ffff';
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Draw trail
    trailRef.current = trailRef.current.filter(t => t.life > 0);
    trailRef.current.forEach(t => {
      t.life -= 0.05; // Fade out speed
      if (t.life > 0) {
        ctx.fillStyle = `rgba(0, 255, 255, ${t.life * 0.5})`; // Cyan
        ctx.fillRect(t.x * CELL_SIZE, t.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    });

    // Draw food
    ctx.fillStyle = '#ff00ff'; // Magenta
    ctx.fillRect(
      foodRef.current.x * CELL_SIZE,
      foodRef.current.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );

    // Draw snake
    snakeRef.current.forEach((segment, index) => {
      const isHead = index === 0;
      if (isHead) {
        ctx.fillStyle = '#ffffff';
      } else {
        // Glitchy body colors
        ctx.fillStyle = Math.random() > 0.9 ? '#ff00ff' : '#00ffff';
      }
      
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });

  }, []);

  const gameLoop = useCallback((time: number) => {
    if (!lastMoveTimeRef.current) lastMoveTimeRef.current = time;
    const deltaTime = time - lastMoveTimeRef.current;

    const currentSpeed = Math.max(30, INITIAL_SPEED - score * 1.5);

    if (deltaTime >= currentSpeed) {
      if (hasStartedRef.current && !isPausedRef.current && !gameOverRef.current) {
        const currentSnake = [...snakeRef.current];
        const head = { ...currentSnake[0] };

        switch (directionRef.current) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Check collision with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
        } 
        // Check collision with self
        else if (currentSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
        } else {
          currentSnake.unshift(head);

          // Check if food eaten
          if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
            setScore(s => s + 10);
            setFood(generateFood(currentSnake));
          } else {
            const popped = currentSnake.pop();
            if (popped) {
              trailRef.current.push({ x: popped.x, y: popped.y, life: 1.0 });
            }
          }

          setSnake(currentSnake);
        }
      }
      lastMoveTimeRef.current = time;
    }

    draw();
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [draw, generateFood, score]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  return (
    <div className="flex flex-col items-center justify-center relative w-full p-4">
      <div className="flex justify-between items-end w-full max-w-[400px] mb-2 px-2 border-b-2 border-fuchsia-500">
        <div 
          className="text-cyan-400 font-digital text-4xl font-bold tracking-widest glitch-text uppercase"
          data-text={`DATA:${score.toString().padStart(4, '0')}`}
        >
          DATA:{score.toString().padStart(4, '0')}
        </div>
        <div className="text-fuchsia-500 font-digital text-2xl tracking-widest pb-1 uppercase animate-pulse">
          {isPaused ? 'HALTED' : 'ACTIVE'}
        </div>
      </div>

      <div className="relative overflow-hidden border-4 border-cyan-400 bg-black">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
          style={{ imageRendering: 'pixelated' }}
        />

        {(!hasStarted || gameOver) && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10">
            {gameOver ? (
              <>
                <h2 className="text-5xl font-bold text-fuchsia-500 mb-2 glitch-text uppercase" data-text="FATAL ERROR">FATAL ERROR</h2>
                <p className="text-cyan-400 text-2xl mb-6 uppercase">DATA RECOVERED: {score}</p>
              </>
            ) : (
              <h2 className="text-4xl font-bold text-cyan-400 mb-6 glitch-text uppercase" data-text="AWAITING INPUT">AWAITING INPUT</h2>
            )}
            
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-fuchsia-500 text-black border-2 border-fuchsia-500 font-bold tracking-widest hover:bg-black hover:text-fuchsia-500 transition-colors uppercase text-xl"
            >
              {gameOver ? 'REBOOT' : 'EXECUTE'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

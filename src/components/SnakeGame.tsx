import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, X } from 'lucide-react';

interface SnakeGameProps {
    onExit: () => void;
}

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const SPEED = 165;

export const SnakeGame: React.FC<SnakeGameProps> = ({ onExit }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Point>({ x: 15, y: 10 });
    const [gameOver, setGameOver] = useState(false);
    // const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const requestRef = useRef<number>();
    const lastUpdateRef = useRef<number>(0);

    // Check against the last PROCESSED direction to prevent self-collision
    const lastProcessedDirectionRef = useRef<Direction>('RIGHT');
    // Buffer for rapid inputs
    const moveQueueRef = useRef<Direction[]>([]);

    const generateFood = useCallback((): Point => {
        return {
            x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
        };
    }, []);

    const resetGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood(generateFood());
        lastProcessedDirectionRef.current = 'RIGHT';
        moveQueueRef.current = [];
        setGameOver(false);

        setIsPlaying(true);
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Prevent default scrolling for arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }

        const currentHeadDir = moveQueueRef.current.length > 0
            ? moveQueueRef.current[moveQueueRef.current.length - 1]
            : lastProcessedDirectionRef.current;

        let nextDir: Direction | null = null;

        switch (e.key) {
            case 'ArrowUp':
                if (currentHeadDir !== 'DOWN' && currentHeadDir !== 'UP') nextDir = 'UP';
                break;
            case 'ArrowDown':
                if (currentHeadDir !== 'UP' && currentHeadDir !== 'DOWN') nextDir = 'DOWN';
                break;
            case 'ArrowLeft':
                if (currentHeadDir !== 'RIGHT' && currentHeadDir !== 'LEFT') nextDir = 'LEFT';
                break;
            case 'ArrowRight':
                if (currentHeadDir !== 'LEFT' && currentHeadDir !== 'RIGHT') nextDir = 'RIGHT';
                break;
        }

        if (nextDir) {
            // Limit queue size to prevent massive buildup
            if (moveQueueRef.current.length < 2) {
                moveQueueRef.current.push(nextDir);
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const gameLoop = useCallback((time: number) => {
        if (!isPlaying || gameOver) return;

        if (time - lastUpdateRef.current > SPEED) {
            // Process next move from queue or continue straight
            // IMPORTANT: Calculate this OUTSIDE setSnake to avoid double execution in Strict Mode
            let nextMove = lastProcessedDirectionRef.current;
            if (moveQueueRef.current.length > 0) {
                nextMove = moveQueueRef.current.shift() as Direction;
                lastProcessedDirectionRef.current = nextMove;
            }

            setSnake(prevSnake => {
                const head = { ...prevSnake[0] };

                switch (nextMove) {
                    case 'UP': head.y -= 1; break;
                    case 'DOWN': head.y += 1; break;
                    case 'LEFT': head.x -= 1; break;
                    case 'RIGHT': head.x += 1; break;
                }

                // Check collision with walls
                if (
                    head.x < 0 ||
                    head.x >= CANVAS_SIZE / GRID_SIZE ||
                    head.y < 0 ||
                    head.y >= CANVAS_SIZE / GRID_SIZE
                ) {
                    setGameOver(true);
                    return prevSnake;
                }

                // Check collision with self
                if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
                    setGameOver(true);
                    return prevSnake;
                }

                const newSnake = [head, ...prevSnake];

                // Check food collision
                if (head.x === food.x && head.y === food.y) {

                    setFood(generateFood());
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
            lastUpdateRef.current = time;
        }
        requestRef.current = requestAnimationFrame(gameLoop);
    }, [isPlaying, gameOver, food, generateFood]);

    useEffect(() => {
        if (isPlaying && !gameOver) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, gameOver, gameLoop]);

    // Draw canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#f9fafb'; // gray-50
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw snake
        ctx.fillStyle = '#10b981'; // emerald-500
        snake.forEach((segment, index) => {
            // Head is slightly darker
            if (index === 0) ctx.fillStyle = '#059669'; // emerald-600
            else ctx.fillStyle = '#10b981'; // emerald-500

            ctx.fillRect(
                segment.x * GRID_SIZE,
                segment.y * GRID_SIZE,
                GRID_SIZE - 2,
                GRID_SIZE - 2
            );
        });

        // Draw food
        ctx.fillStyle = '#ef4444'; // red-500
        ctx.beginPath();
        ctx.arc(
            food.x * GRID_SIZE + GRID_SIZE / 2,
            food.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2 - 2,
            0,
            2 * Math.PI
        );
        ctx.fill();

    }, [snake, food]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Snake</h2>
                    <div className="flex items-center gap-4">

                        <button
                            onClick={onExit}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="relative rounded-xl overflow-hidden shadow-inner border-2 border-gray-100 bg-gray-50 flex justify-center">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        className="max-w-full"
                        style={{ width: '100%', height: 'auto', aspectRatio: '1/1' }}
                    />

                    {(!isPlaying && !gameOver) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                            <button
                                onClick={resetGame}
                                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105"
                            >
                                Játék indítása
                            </button>
                        </div>
                    )}

                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                            <h3 className="text-white text-3xl font-bold mb-4">Vége a játéknak!</h3>
                            <button
                                onClick={resetGame}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Újra
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center text-gray-500 mt-4 text-sm">
                    Használd a nyilakat az irányításhoz
                </p>

                {/* Mobile Controls */}
                <div className="mt-6 grid grid-cols-3 gap-2 max-w-[200px] mx-auto md:hidden">
                    <div />
                    <button
                        className="bg-gray-100 p-4 rounded-xl active:bg-gray-200 flex justify-center"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            // Add UP logic here for mobile if needed, matching keyboard logic
                            const currentHeadDir = moveQueueRef.current.length > 0
                                ? moveQueueRef.current[moveQueueRef.current.length - 1]
                                : lastProcessedDirectionRef.current;
                            if (currentHeadDir !== 'DOWN' && currentHeadDir !== 'UP') moveQueueRef.current.push('UP');
                        }}
                    >
                        ↑
                    </button>
                    <div />
                    <button
                        className="bg-gray-100 p-4 rounded-xl active:bg-gray-200 flex justify-center"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            const currentHeadDir = moveQueueRef.current.length > 0
                                ? moveQueueRef.current[moveQueueRef.current.length - 1]
                                : lastProcessedDirectionRef.current;
                            if (currentHeadDir !== 'RIGHT' && currentHeadDir !== 'LEFT') moveQueueRef.current.push('LEFT');
                        }}
                    >
                        ←
                    </button>
                    <button
                        className="bg-gray-100 p-4 rounded-xl active:bg-gray-200 flex justify-center"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            const currentHeadDir = moveQueueRef.current.length > 0
                                ? moveQueueRef.current[moveQueueRef.current.length - 1]
                                : lastProcessedDirectionRef.current;
                            if (currentHeadDir !== 'UP' && currentHeadDir !== 'DOWN') moveQueueRef.current.push('DOWN');
                        }}
                    >
                        ↓
                    </button>
                    <button
                        className="bg-gray-100 p-4 rounded-xl active:bg-gray-200 flex justify-center"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            const currentHeadDir = moveQueueRef.current.length > 0
                                ? moveQueueRef.current[moveQueueRef.current.length - 1]
                                : lastProcessedDirectionRef.current;
                            if (currentHeadDir !== 'LEFT' && currentHeadDir !== 'RIGHT') moveQueueRef.current.push('RIGHT');
                        }}
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
};

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { MapId } from "@/lib/game-data"
import {
  getMazeObstacles,
  getGauntletObstacles,
  generateChaosObstacle,
} from "@/lib/map-obstacles"

const CELL_SIZE = 20
const GRID_WIDTH = 20
const GRID_HEIGHT = 20
const CANVAS_WIDTH = CELL_SIZE * GRID_WIDTH
const CANVAS_HEIGHT = CELL_SIZE * GRID_HEIGHT

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type Position = { x: number; y: number }

interface SnakeGameProps {
  mapId: MapId
  onScoreChange: (score: number) => void
  onGameOver: (score: number) => void
  onGameStart: () => void
  isRunning: boolean
  setIsRunning: (running: boolean) => void
}

function getInitialObstacles(mapId: MapId): Position[] {
  switch (mapId) {
    case "maze":
      return getMazeObstacles()
    case "gauntlet":
      return getGauntletObstacles()
    default:
      return []
  }
}

function getObstacleColor(mapId: MapId): string {
  switch (mapId) {
    case "maze": return "#ffaa00"
    case "gauntlet": return "#ff4757"
    case "chaos": return "#c850c0"
    default: return "#ff4757"
  }
}

export function SnakeGame({
  mapId,
  onScoreChange,
  onGameOver,
  onGameStart,
  isRunning,
  setIsRunning,
}: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle")
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }])
  const directionRef = useRef<Direction>("RIGHT")
  const nextDirectionRef = useRef<Direction>("RIGHT")
  const foodRef = useRef<Position>({ x: 15, y: 10 })
  const scoreRef = useRef(0)
  const speedRef = useRef(150)
  const gameLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const obstaclesRef = useRef<Position[]>([])

  const isObstacle = useCallback((x: number, y: number) => {
    return obstaclesRef.current.some((o) => o.x === x && o.y === y)
  }, [])

  const generateFood = useCallback(() => {
    let newFood: Position
    let attempts = 0
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT),
      }
      attempts++
    } while (
      attempts < 500 &&
      (snakeRef.current.some((s) => s.x === newFood.x && s.y === newFood.y) ||
        obstaclesRef.current.some((o) => o.x === newFood.x && o.y === newFood.y))
    )
    foodRef.current = newFood
  }, [])

  const resetGame = useCallback(() => {
    // Find a safe spawn for the snake based on map
    let spawnX = 10
    let spawnY = 10
    if (mapId === "gauntlet") {
      spawnX = 10
      spawnY = 2 // Above first barrier
    }
    snakeRef.current = [{ x: spawnX, y: spawnY }]
    directionRef.current = "RIGHT"
    nextDirectionRef.current = "RIGHT"
    scoreRef.current = 0
    speedRef.current = 150
    obstaclesRef.current = getInitialObstacles(mapId)
    generateFood()
    onScoreChange(0)
  }, [generateFood, onScoreChange, mapId])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Background
    ctx.fillStyle = "#0d0d24"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Grid lines
    ctx.strokeStyle = "rgba(57, 255, 120, 0.04)"
    ctx.lineWidth = 0.5
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath()
      ctx.moveTo(x * CELL_SIZE, 0)
      ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT)
      ctx.stroke()
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * CELL_SIZE)
      ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE)
      ctx.stroke()
    }

    // Portal walls indicator
    if (mapId === "portal") {
      ctx.strokeStyle = "rgba(0, 212, 255, 0.3)"
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2)
      ctx.setLineDash([])
    }

    // Draw obstacles
    const obsColor = getObstacleColor(mapId)
    obstaclesRef.current.forEach((o) => {
      ctx.shadowColor = obsColor
      ctx.shadowBlur = 6
      ctx.fillStyle = obsColor
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.roundRect(
        o.x * CELL_SIZE + 1,
        o.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2,
        2
      )
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    })

    // Draw food
    const food = foodRef.current
    ctx.shadowColor = "#ff4757"
    ctx.shadowBlur = 15
    ctx.fillStyle = "#ff4757"
    ctx.beginPath()
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.shadowBlur = 0

    // Draw snake
    const snake = snakeRef.current
    snake.forEach((segment, index) => {
      const isHead = index === 0
      if (isHead) {
        ctx.shadowColor = "#39ff78"
        ctx.shadowBlur = 20
        ctx.fillStyle = "#39ff78"
      } else {
        ctx.shadowColor = "#39ff78"
        ctx.shadowBlur = 8
        const alpha = 1 - (index / snake.length) * 0.5
        ctx.fillStyle = `rgba(57, 255, 120, ${alpha})`
      }
      const padding = isHead ? 1 : 2
      ctx.beginPath()
      ctx.roundRect(
        segment.x * CELL_SIZE + padding,
        segment.y * CELL_SIZE + padding,
        CELL_SIZE - padding * 2,
        CELL_SIZE - padding * 2,
        isHead ? 4 : 3
      )
      ctx.fill()
      ctx.shadowBlur = 0
    })

    // Eyes
    if (snake.length > 0) {
      const head = snake[0]
      const dir = directionRef.current
      ctx.fillStyle = "#0d0d24"
      const eyeSize = 3
      const cx = head.x * CELL_SIZE + CELL_SIZE / 2
      const cy = head.y * CELL_SIZE + CELL_SIZE / 2
      let eye1x: number, eye1y: number, eye2x: number, eye2y: number

      if (dir === "RIGHT") {
        eye1x = cx + 3; eye1y = cy - 4; eye2x = cx + 3; eye2y = cy + 4
      } else if (dir === "LEFT") {
        eye1x = cx - 3; eye1y = cy - 4; eye2x = cx - 3; eye2y = cy + 4
      } else if (dir === "UP") {
        eye1x = cx - 4; eye1y = cy - 3; eye2x = cx + 4; eye2y = cy - 3
      } else {
        eye1x = cx - 4; eye1y = cy + 3; eye2x = cx + 4; eye2y = cy + 3
      }

      ctx.beginPath()
      ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [mapId])

  const gameStep = useCallback(() => {
    directionRef.current = nextDirectionRef.current
    const snake = [...snakeRef.current]
    const head = { ...snake[0] }

    switch (directionRef.current) {
      case "UP": head.y -= 1; break
      case "DOWN": head.y += 1; break
      case "LEFT": head.x -= 1; break
      case "RIGHT": head.x += 1; break
    }

    // Wall handling based on map
    if (mapId === "portal") {
      head.x = (head.x + GRID_WIDTH) % GRID_WIDTH
      head.y = (head.y + GRID_HEIGHT) % GRID_HEIGHT
    } else {
      if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        setGameState("gameover")
        setIsRunning(false)
        onGameOver(scoreRef.current)
        return
      }
    }

    // Self collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      setGameState("gameover")
      setIsRunning(false)
      onGameOver(scoreRef.current)
      return
    }

    // Obstacle collision
    if (isObstacle(head.x, head.y)) {
      setGameState("gameover")
      setIsRunning(false)
      onGameOver(scoreRef.current)
      return
    }

    snake.unshift(head)

    // Food check
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      scoreRef.current += 10
      onScoreChange(scoreRef.current)

      // Chaos mode: spawn new obstacles
      if (mapId === "chaos") {
        const newObs = generateChaosObstacle(
          snake,
          foodRef.current,
          obstaclesRef.current
        )
        obstaclesRef.current = [...obstaclesRef.current, ...newObs]
      }

      generateFood()
      speedRef.current = Math.max(60, speedRef.current - 2)
    } else {
      snake.pop()
    }

    snakeRef.current = snake
    draw()
  }, [draw, generateFood, onGameOver, onScoreChange, setIsRunning, mapId, isObstacle])

  const startGame = useCallback(() => {
    resetGame()
    setGameState("playing")
    setIsRunning(true)
    onGameStart()
    draw()
  }, [resetGame, setIsRunning, onGameStart, draw])

  // Game loop
  useEffect(() => {
    if (isRunning && gameState === "playing") {
      const loop = () => {
        gameStep()
        gameLoopRef.current = setTimeout(loop, speedRef.current)
      }
      gameLoopRef.current = setTimeout(loop, speedRef.current)
    }
    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current)
    }
  }, [isRunning, gameState, gameStep])

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault()
      }
      if (e.key === " " || e.key === "Enter") {
        if (gameState !== "playing") startGame()
        return
      }
      const dir = directionRef.current
      switch (e.key) {
        case "ArrowUp": case "w": case "W":
          if (dir !== "DOWN") nextDirectionRef.current = "UP"; break
        case "ArrowDown": case "s": case "S":
          if (dir !== "UP") nextDirectionRef.current = "DOWN"; break
        case "ArrowLeft": case "a": case "A":
          if (dir !== "RIGHT") nextDirectionRef.current = "LEFT"; break
        case "ArrowRight": case "d": case "D":
          if (dir !== "LEFT") nextDirectionRef.current = "RIGHT"; break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState, startGame])

  // Initial draw
  useEffect(() => {
    obstaclesRef.current = getInitialObstacles(mapId)
    draw()
  }, [draw, mapId])

  // Mobile controls
  const handleDirectionClick = useCallback(
    (dir: Direction) => {
      if (gameState !== "playing") {
        startGame()
        return
      }
      const current = directionRef.current
      if (
        (dir === "UP" && current !== "DOWN") ||
        (dir === "DOWN" && current !== "UP") ||
        (dir === "LEFT" && current !== "RIGHT") ||
        (dir === "RIGHT" && current !== "LEFT")
      ) {
        nextDirectionRef.current = dir
      }
    },
    [gameState, startGame]
  )

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Canvas */}
      <div className="relative">
        <div
          className="rounded-lg border-2 border-primary/30 overflow-hidden"
          style={{
            boxShadow:
              "0 0 30px rgba(57, 255, 120, 0.15), inset 0 0 30px rgba(57, 255, 120, 0.03)",
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block"
          />
        </div>

        {/* Overlay */}
        {gameState !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            {gameState === "gameover" && (
              <p
                className="font-sans text-xl text-destructive mb-2"
                style={{ textShadow: "0 0 20px rgba(255, 71, 87, 0.5)" }}
              >
                GAME OVER
              </p>
            )}
            <p className="font-sans text-primary text-[10px] mb-6">
              {gameState === "gameover"
                ? `Score: ${scoreRef.current}`
                : "READY?"}
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-primary text-primary-foreground font-sans text-xs rounded-lg transition-all hover:scale-105"
              style={{ boxShadow: "0 0 20px rgba(57, 255, 120, 0.3)" }}
            >
              {gameState === "gameover" ? "PLAY AGAIN" : "START"}
            </button>
            {gameState === "idle" && (
              <p className="font-mono text-muted-foreground text-xs mt-4">
                Press Space or Enter
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="flex flex-col items-center gap-2 md:hidden">
        <button
          onClick={() => handleDirectionClick("UP")}
          className="w-14 h-14 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          aria-label="Move up"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleDirectionClick("LEFT")}
            className="w-14 h-14 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
            aria-label="Move left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button
            onClick={() => handleDirectionClick("DOWN")}
            className="w-14 h-14 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
            aria-label="Move down"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <button
            onClick={() => handleDirectionClick("RIGHT")}
            className="w-14 h-14 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
            aria-label="Move right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

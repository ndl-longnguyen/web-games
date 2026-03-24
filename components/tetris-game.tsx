"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 20

type Position = { x: number; y: number }

// Tetromino shapes
const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: "#00d4ff" },
  O: { shape: [[1, 1], [1, 1]], color: "#ffaa00" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "#c850c0" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "#39ff78" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "#ff4757" },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: "#3d5af1" },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: "#ff9f43" },
}

type TetrominoType = keyof typeof TETROMINOES

interface Tetromino {
  type: TetrominoType
  shape: number[][]
  position: Position
  color: string
}

interface TetrisGameProps {
  onScoreChange: (score: number) => void
  onGameOver: (score: number) => void
  onGameStart: () => void
  onLinesChange: (lines: number) => void
  onLevelChange: (level: number) => void
  canStart?: () => boolean
  isRunning: boolean
  setIsRunning: (running: boolean) => void
}

function getRandomTetromino(): Tetromino {
  const types = Object.keys(TETROMINOES) as TetrominoType[]
  const type = types[Math.floor(Math.random() * types.length)]
  const tetromino = TETROMINOES[type]
  return {
    type,
    shape: tetromino.shape.map(row => [...row]),
    position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2), y: 0 },
    color: tetromino.color,
  }
}

function rotateMatrix(matrix: number[][]): number[][] {
  const rows = matrix.length
  const cols = matrix[0].length
  const rotated: number[][] = []
  for (let i = 0; i < cols; i++) {
    rotated[i] = []
    for (let j = rows - 1; j >= 0; j--) {
      rotated[i].push(matrix[j][i])
    }
  }
  return rotated
}

export function TetrisGame({
  onScoreChange,
  onGameOver,
  onGameStart,
  onLinesChange,
  onLevelChange,
  canStart,
  isRunning,
  setIsRunning,
}: TetrisGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle")
  const [canvasSize, setCanvasSize] = useState({ width: BOARD_WIDTH * CELL_SIZE, height: BOARD_HEIGHT * CELL_SIZE })
  
  const boardRef = useRef<(string | null)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  )
  const currentPieceRef = useRef<Tetromino | null>(null)
  const nextPieceRef = useRef<Tetromino>(getRandomTetromino())
  const scoreRef = useRef(0)
  const linesRef = useRef(0)
  const levelRef = useRef(1)
  const gameLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Responsive canvas sizing
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const maxH = vh - 380
      const maxW = vw - 32
      const cellSize = Math.min(
        Math.floor(maxH / BOARD_HEIGHT),
        Math.floor(maxW / BOARD_WIDTH),
        CELL_SIZE
      )
      setCanvasSize({
        width: cellSize * BOARD_WIDTH,
        height: cellSize * BOARD_HEIGHT,
      })
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  const cellSize = canvasSize.width / BOARD_WIDTH

  const isValidPosition = useCallback((piece: Tetromino, board: (string | null)[][]): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.position.x + x
          const newY = piece.position.y + y
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false
          }
          if (newY >= 0 && board[newY][newX]) {
            return false
          }
        }
      }
    }
    return true
  }, [])

  const lockPiece = useCallback(() => {
    const piece = currentPieceRef.current
    if (!piece) return

    const board = boardRef.current
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.position.y + y
          const boardX = piece.position.x + x
          if (boardY >= 0) {
            board[boardY][boardX] = piece.color
          }
        }
      }
    }

    // Check for completed lines
    let linesCleared = 0
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (board[y].every(cell => cell !== null)) {
        board.splice(y, 1)
        board.unshift(Array(BOARD_WIDTH).fill(null))
        linesCleared++
        y++ // Check this row again
      }
    }

    if (linesCleared > 0) {
      linesRef.current += linesCleared
      onLinesChange(linesRef.current)
      
      // Score based on lines cleared
      const lineScores = [0, 100, 300, 500, 800]
      scoreRef.current += lineScores[linesCleared] * levelRef.current
      onScoreChange(scoreRef.current)

      // Level up every 10 lines
      const newLevel = Math.floor(linesRef.current / 10) + 1
      if (newLevel !== levelRef.current) {
        levelRef.current = newLevel
        onLevelChange(newLevel)
      }
    }

    // Spawn next piece
    currentPieceRef.current = nextPieceRef.current
    nextPieceRef.current = getRandomTetromino()

    // Check game over
    if (!isValidPosition(currentPieceRef.current, board)) {
      setGameState("gameover")
      setIsRunning(false)
      onGameOver(scoreRef.current)
    }
  }, [isValidPosition, onScoreChange, onGameOver, onLinesChange, onLevelChange, setIsRunning])

  const moveDown = useCallback(() => {
    const piece = currentPieceRef.current
    if (!piece) return

    const newPiece = {
      ...piece,
      position: { ...piece.position, y: piece.position.y + 1 },
    }

    if (isValidPosition(newPiece, boardRef.current)) {
      currentPieceRef.current = newPiece
    } else {
      lockPiece()
    }
  }, [isValidPosition, lockPiece])

  const moveHorizontal = useCallback((direction: -1 | 1) => {
    const piece = currentPieceRef.current
    if (!piece) return

    const newPiece = {
      ...piece,
      position: { ...piece.position, x: piece.position.x + direction },
    }

    if (isValidPosition(newPiece, boardRef.current)) {
      currentPieceRef.current = newPiece
    }
  }, [isValidPosition])

  const rotate = useCallback(() => {
    const piece = currentPieceRef.current
    if (!piece) return

    const rotatedShape = rotateMatrix(piece.shape)
    const newPiece = { ...piece, shape: rotatedShape }

    // Wall kick: try to adjust position if rotation is blocked
    const kicks = [0, -1, 1, -2, 2]
    for (const kick of kicks) {
      const kickedPiece = {
        ...newPiece,
        position: { ...newPiece.position, x: newPiece.position.x + kick },
      }
      if (isValidPosition(kickedPiece, boardRef.current)) {
        currentPieceRef.current = kickedPiece
        return
      }
    }
  }, [isValidPosition])

  const hardDrop = useCallback(() => {
    const piece = currentPieceRef.current
    if (!piece) return

    let dropDistance = 0
    while (true) {
      const testPiece = {
        ...piece,
        position: { ...piece.position, y: piece.position.y + dropDistance + 1 },
      }
      if (isValidPosition(testPiece, boardRef.current)) {
        dropDistance++
      } else {
        break
      }
    }

    currentPieceRef.current = {
      ...piece,
      position: { ...piece.position, y: piece.position.y + dropDistance },
    }
    scoreRef.current += dropDistance * 2
    onScoreChange(scoreRef.current)
    lockPiece()
  }, [isValidPosition, lockPiece, onScoreChange])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cs = cellSize

    // Background
    ctx.fillStyle = "#0d0d24"
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

    // Grid lines
    ctx.strokeStyle = "rgba(57, 255, 120, 0.04)"
    ctx.lineWidth = 0.5
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath()
      ctx.moveTo(x * cs, 0)
      ctx.lineTo(x * cs, canvasSize.height)
      ctx.stroke()
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * cs)
      ctx.lineTo(canvasSize.width, y * cs)
      ctx.stroke()
    }

    // Draw board
    const board = boardRef.current
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          ctx.shadowColor = board[y][x]!
          ctx.shadowBlur = 8
          ctx.fillStyle = board[y][x]!
          ctx.beginPath()
          ctx.roundRect(x * cs + 1, y * cs + 1, cs - 2, cs - 2, 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }
    }

    // Draw ghost piece
    const piece = currentPieceRef.current
    if (piece) {
      let ghostY = piece.position.y
      while (true) {
        const testPiece = {
          ...piece,
          position: { ...piece.position, y: ghostY + 1 },
        }
        if (isValidPosition(testPiece, board)) {
          ghostY++
        } else {
          break
        }
      }

      ctx.globalAlpha = 0.2
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const drawX = (piece.position.x + x) * cs
            const drawY = (ghostY + y) * cs
            ctx.fillStyle = piece.color
            ctx.beginPath()
            ctx.roundRect(drawX + 1, drawY + 1, cs - 2, cs - 2, 2)
            ctx.fill()
          }
        }
      }
      ctx.globalAlpha = 1

      // Draw current piece
      ctx.shadowColor = piece.color
      ctx.shadowBlur = 12
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const drawX = (piece.position.x + x) * cs
            const drawY = (piece.position.y + y) * cs
            if (drawY >= 0) {
              ctx.fillStyle = piece.color
              ctx.beginPath()
              ctx.roundRect(drawX + 1, drawY + 1, cs - 2, cs - 2, 2)
              ctx.fill()
            }
          }
        }
      }
      ctx.shadowBlur = 0
    }
  }, [canvasSize, cellSize, isValidPosition])

  const resetGame = useCallback(() => {
    boardRef.current = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
    currentPieceRef.current = getRandomTetromino()
    nextPieceRef.current = getRandomTetromino()
    scoreRef.current = 0
    linesRef.current = 0
    levelRef.current = 1
    onScoreChange(0)
    onLinesChange(0)
    onLevelChange(1)
  }, [onScoreChange, onLinesChange, onLevelChange])

  const startGame = useCallback(() => {
    if (canStart && !canStart()) {
      onGameStart()
      return
    }
    resetGame()
    setGameState("playing")
    setIsRunning(true)
    onGameStart()
    draw()
  }, [resetGame, setIsRunning, onGameStart, canStart, draw])

  // Game loop
  useEffect(() => {
    if (isRunning && gameState === "playing") {
      const speed = Math.max(100, 500 - (levelRef.current - 1) * 50)
      const loop = () => {
        moveDown()
        draw()
        gameLoopRef.current = setTimeout(loop, speed)
      }
      gameLoopRef.current = setTimeout(loop, speed)
    }
    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current)
    }
  }, [isRunning, gameState, moveDown, draw])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault()
      }
      if (e.key === " " || e.key === "Enter") {
        if (gameState !== "playing") {
          startGame()
        } else {
          hardDrop()
        }
        return
      }
      if (gameState !== "playing") return

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          moveHorizontal(-1)
          draw()
          break
        case "ArrowRight":
        case "d":
        case "D":
          moveHorizontal(1)
          draw()
          break
        case "ArrowDown":
        case "s":
        case "S":
          moveDown()
          scoreRef.current += 1
          onScoreChange(scoreRef.current)
          draw()
          break
        case "ArrowUp":
        case "w":
        case "W":
          rotate()
          draw()
          break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState, startGame, moveHorizontal, moveDown, rotate, hardDrop, draw, onScoreChange])

  // Initial draw
  useEffect(() => {
    draw()
  }, [draw])

  // Mobile controls
  const handleControl = useCallback(
    (action: "left" | "right" | "down" | "rotate" | "drop") => {
      if (gameState !== "playing") {
        startGame()
        return
      }
      switch (action) {
        case "left":
          moveHorizontal(-1)
          break
        case "right":
          moveHorizontal(1)
          break
        case "down":
          moveDown()
          scoreRef.current += 1
          onScoreChange(scoreRef.current)
          break
        case "rotate":
          rotate()
          break
        case "drop":
          hardDrop()
          break
      }
      draw()
    },
    [gameState, startGame, moveHorizontal, moveDown, rotate, hardDrop, draw, onScoreChange]
  )

  // Draw next piece preview
  const nextPiece = nextPieceRef.current
  const previewSize = 80

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex gap-4 items-start">
        {/* Main game canvas */}
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
              width={canvasSize.width}
              height={canvasSize.height}
              className="block"
              style={{ width: canvasSize.width, height: canvasSize.height }}
            />
          </div>

          {/* Overlay */}
          {gameState !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
              {gameState === "gameover" && (
                <p
                  className="font-sans text-lg md:text-xl text-destructive mb-2"
                  style={{ textShadow: "0 0 20px rgba(255, 71, 87, 0.5)" }}
                >
                  GAME OVER
                </p>
              )}
              <p className="font-sans text-primary text-[10px] mb-4 md:mb-6">
                {gameState === "gameover"
                  ? `Score: ${scoreRef.current}`
                  : "READY?"}
              </p>
              <button
                onClick={startGame}
                className="px-5 py-2.5 md:px-6 md:py-3 bg-primary text-primary-foreground font-sans text-[10px] md:text-xs rounded-lg transition-all hover:scale-105 active:scale-95"
                style={{ boxShadow: "0 0 20px rgba(57, 255, 120, 0.3)" }}
              >
                {gameState === "gameover" ? "PLAY AGAIN" : "START"}
              </button>
              {gameState === "idle" && (
                <p className="font-mono text-muted-foreground text-[10px] mt-3 md:mt-4 hidden md:block">
                  Press Space or Enter
                </p>
              )}
            </div>
          )}
        </div>

        {/* Next piece preview */}
        <div className="hidden sm:block">
          <div className="rounded-lg border border-primary/20 bg-card p-3">
            <p className="font-mono text-[9px] text-muted-foreground mb-2">NEXT</p>
            <div
              className="relative"
              style={{ width: previewSize, height: previewSize }}
            >
              <svg width={previewSize} height={previewSize} viewBox="0 0 80 80">
                {nextPiece.shape.map((row, y) =>
                  row.map((cell, x) =>
                    cell ? (
                      <rect
                        key={`${x}-${y}`}
                        x={x * 18 + 10}
                        y={y * 18 + 20}
                        width={16}
                        height={16}
                        rx={2}
                        fill={nextPiece.color}
                        style={{ filter: `drop-shadow(0 0 4px ${nextPiece.color})` }}
                      />
                    ) : null
                  )
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="flex flex-col items-center gap-2 md:hidden">
        <button
          onClick={() => handleControl("rotate")}
          className="w-14 h-14 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          aria-label="Rotate"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleControl("left")}
            className="w-14 h-14 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
            aria-label="Move left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button
            onClick={() => handleControl("drop")}
            className="w-14 h-14 rounded-lg bg-primary/20 text-primary flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
            aria-label="Hard drop"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => handleControl("right")}
            className="w-14 h-14 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
            aria-label="Move right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <button
          onClick={() => handleControl("down")}
          className="w-14 h-14 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          aria-label="Move down"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
    </div>
  )
}

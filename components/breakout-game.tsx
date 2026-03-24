"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 600
const PADDLE_WIDTH = 80
const PADDLE_HEIGHT = 12
const BALL_SIZE = 16
const PADDLE_SPEED = 10
const INITIAL_BALL_SPEED = 3
const BRICK_ROWS = 8
const BRICK_COLS = 10
const BRICK_WIDTH = 44
const BRICK_HEIGHT = 18
const BRICK_PADDING = 4
const BRICK_OFFSET_TOP = 60
const BRICK_OFFSET_LEFT = 6

// Brick types
const BRICK_TYPES = {
  NORMAL: 1,
  HARD: 2,      // Takes 2 hits
  SUPER: 3,     // Takes 3 hits
  INDESTRUCTIBLE: 4, // Cannot be destroyed
  EXPLOSIVE: 5, // Destroys adjacent bricks
}

// Level patterns - 10 unique levels with diverse patterns including pipe/tube shapes
const LEVEL_PATTERNS: number[][][] = [
  // Level 1: Simple rows
  [
    [0,0,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ],
  // Level 2: Pipe pattern vertical
  [
    [1,0,1,0,1,1,0,1,0,1],
    [1,0,1,0,1,1,0,1,0,1],
    [1,0,1,0,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
  ],
  // Level 3: Diamond
  [
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,1,2,2,1,0,0,0],
    [0,0,1,2,1,1,2,1,0,0],
    [0,1,2,1,0,0,1,2,1,0],
    [0,0,1,2,1,1,2,1,0,0],
    [0,0,0,1,2,2,1,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ],
  // Level 4: Tube/pipe horizontal
  [
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [4,1,1,1,1,1,1,1,1,4],
    [4,0,0,0,0,0,0,0,0,4],
    [4,2,2,2,2,2,2,2,2,4],
    [4,0,0,0,0,0,0,0,0,4],
    [4,1,1,1,1,1,1,1,1,4],
    [0,0,0,0,0,0,0,0,0,0],
  ],
  // Level 5: Maze pattern
  [
    [1,1,1,0,0,0,0,1,1,1],
    [1,0,0,0,2,2,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1],
    [0,0,1,0,0,0,0,1,0,0],
    [0,0,1,0,3,3,0,1,0,0],
    [1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,2,2,0,0,0,1],
    [1,1,1,0,0,0,0,1,1,1],
  ],
  // Level 6: Inverted U pipes
  [
    [2,2,0,0,2,2,0,0,2,2],
    [2,2,0,0,2,2,0,0,2,2],
    [2,2,0,0,2,2,0,0,2,2],
    [2,2,0,0,2,2,0,0,2,2],
    [2,2,2,2,2,2,2,2,2,2],
    [0,0,0,0,0,0,0,0,0,0],
    [5,1,1,5,0,0,5,1,1,5],
    [1,1,1,1,0,0,1,1,1,1],
  ],
  // Level 7: Spiral pattern
  [
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,1],
    [1,0,3,3,3,3,0,1,0,1],
    [1,0,0,0,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,0,1],
    [0,0,0,0,0,0,0,0,0,1],
  ],
  // Level 8: Fortress with tunnels
  [
    [4,4,4,4,0,0,4,4,4,4],
    [4,3,3,0,0,0,0,3,3,4],
    [4,3,0,0,5,5,0,0,3,4],
    [0,0,0,2,2,2,2,0,0,0],
    [0,0,0,2,0,0,2,0,0,0],
    [4,3,0,2,0,0,2,0,3,4],
    [4,3,3,2,2,2,2,3,3,4],
    [4,4,4,4,4,4,4,4,4,4],
  ],
  // Level 9: Complex pipe network
  [
    [3,0,3,0,3,3,0,3,0,3],
    [3,0,3,0,0,0,0,3,0,3],
    [3,0,3,3,3,3,3,3,0,3],
    [3,0,0,0,0,0,0,0,0,3],
    [3,3,3,3,0,0,3,3,3,3],
    [0,0,0,3,0,0,3,0,0,0],
    [5,2,0,3,3,3,3,0,2,5],
    [2,2,2,0,0,0,0,2,2,2],
  ],
  // Level 10: Ultimate challenge
  [
    [4,3,3,3,3,3,3,3,3,4],
    [3,0,0,0,0,0,0,0,0,3],
    [3,0,4,5,0,0,5,4,0,3],
    [3,0,5,3,3,3,3,5,0,3],
    [3,0,0,3,4,4,3,0,0,3],
    [3,0,5,3,3,3,3,5,0,3],
    [3,0,4,5,0,0,5,4,0,3],
    [4,3,3,3,3,3,3,3,3,4],
  ],
]

// Level configurations - slower speeds for better gameplay
const LEVEL_CONFIGS = [
  { name: "Training", speedMult: 1.0, description: "Learn the basics" },
  { name: "Pipes I", speedMult: 1.05, description: "Vertical pipe maze" },
  { name: "Diamond", speedMult: 1.1, description: "Precious gem pattern" },
  { name: "Tubes", speedMult: 1.15, description: "Horizontal tube system" },
  { name: "Labyrinth", speedMult: 1.2, description: "Find your way through" },
  { name: "Pipes II", speedMult: 1.25, description: "Inverted U formation" },
  { name: "Spiral", speedMult: 1.3, description: "Circular path" },
  { name: "Fortress", speedMult: 1.35, description: "Breach the walls" },
  { name: "Network", speedMult: 1.4, description: "Complex pipe network" },
  { name: "Ultimate", speedMult: 1.45, description: "The final challenge" },
]

interface Brick {
  x: number
  y: number
  width: number
  height: number
  type: number
  hits: number
  active: boolean
}

interface BreakoutGameProps {
  onScoreChange: (score: number) => void
  onGameOver: (score: number, level: number, won: boolean) => void
  onGameStart: () => void
  onLivesChange: (lives: number) => void
  canStart?: () => boolean
  isRunning: boolean
  setIsRunning: (running: boolean) => void
  startLevel?: number
}

export function BreakoutGame({
  onScoreChange,
  onGameOver,
  onGameStart,
  onLivesChange,
  canStart,
  isRunning,
  setIsRunning,
  startLevel = 1,
}: BreakoutGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover" | "levelcomplete" | "won">("idle")
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT })

  // Game state refs
  const paddleRef = useRef({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2 })
  const ballRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 80,
    vx: INITIAL_BALL_SPEED * 0.7,
    vy: -INITIAL_BALL_SPEED,
    speed: INITIAL_BALL_SPEED,
    attached: true, // Ball attached to paddle at start
  })
  const bricksRef = useRef<Brick[]>([])
  const scoreRef = useRef(0)
  const livesRef = useRef(5)
  const levelRef = useRef(startLevel)
  const keysRef = useRef<Set<string>>(new Set())
  const animationFrameRef = useRef<number | null>(null)
  const comboRef = useRef(0)
  const lastHitTimeRef = useRef(0)

  // Responsive canvas sizing
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const maxW = Math.min(vw - 32, 480)
      const maxH = vh - 380
      const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT
      let width = maxW
      let height = width / aspectRatio
      if (height > maxH) {
        height = maxH
        width = height * aspectRatio
      }
      setCanvasSize({ width: Math.floor(width), height: Math.floor(height) })
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  const scaleX = canvasSize.width / CANVAS_WIDTH
  const scaleY = canvasSize.height / CANVAS_HEIGHT

  const initBricks = useCallback((level: number) => {
    const pattern = LEVEL_PATTERNS[(level - 1) % LEVEL_PATTERNS.length]
    const bricks: Brick[] = []
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const type = pattern[row]?.[col] || 0
        if (type > 0) {
          const maxHits = type === BRICK_TYPES.HARD ? 2 : 
                         type === BRICK_TYPES.SUPER ? 3 : 
                         type === BRICK_TYPES.INDESTRUCTIBLE ? 999 : 1
          bricks.push({
            x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
            y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT,
            type,
            hits: maxHits,
            active: true,
          })
        }
      }
    }
    bricksRef.current = bricks
  }, [])

  const resetBall = useCallback(() => {
    ballRef.current = {
      x: paddleRef.current.x + PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 80,
      vx: 0,
      vy: 0,
      speed: INITIAL_BALL_SPEED * LEVEL_CONFIGS[(levelRef.current - 1) % LEVEL_CONFIGS.length].speedMult,
      attached: true,
    }
    comboRef.current = 0
  }, [])

  const resetGame = useCallback((level: number = startLevel) => {
    paddleRef.current = { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2 }
    levelRef.current = level
    scoreRef.current = 0
    livesRef.current = 5
    comboRef.current = 0
    onScoreChange(0)
    onLivesChange(5)
    initBricks(level)
    resetBall()
  }, [initBricks, resetBall, onScoreChange, onLivesChange, startLevel])

  const getBrickColor = (type: number, hits: number): string => {
    switch (type) {
      case BRICK_TYPES.NORMAL:
        return "#39ff78"
      case BRICK_TYPES.HARD:
        return hits > 1 ? "#ffcc00" : "#ff9900"
      case BRICK_TYPES.SUPER:
        return hits > 2 ? "#ff6b6b" : hits > 1 ? "#ff4757" : "#ff3838"
      case BRICK_TYPES.INDESTRUCTIBLE:
        return "#666688"
      case BRICK_TYPES.EXPLOSIVE:
        return "#ff00ff"
      default:
        return "#39ff78"
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const sx = scaleX
    const sy = scaleY

    // Background
    ctx.fillStyle = "#0d0d24"
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

    // Draw grid lines for visual effect
    ctx.strokeStyle = "rgba(57, 255, 120, 0.03)"
    ctx.lineWidth = 1
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i * sx, 0)
      ctx.lineTo(i * sx, canvasSize.height)
      ctx.stroke()
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 20) {
      ctx.beginPath()
      ctx.moveTo(0, i * sy)
      ctx.lineTo(canvasSize.width, i * sy)
      ctx.stroke()
    }

    // Draw bricks
    bricksRef.current.forEach((brick) => {
      if (!brick.active) return
      
      const color = getBrickColor(brick.type, brick.hits)
      
      // Brick shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)"
      ctx.fillRect(
        (brick.x + 2) * sx,
        (brick.y + 2) * sy,
        brick.width * sx,
        brick.height * sy
      )
      
      // Brick body
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = brick.type === BRICK_TYPES.EXPLOSIVE ? 15 : 8
      ctx.fillRect(
        brick.x * sx,
        brick.y * sy,
        brick.width * sx,
        brick.height * sy
      )
      
      // Brick highlight
      ctx.shadowBlur = 0
      ctx.fillStyle = "rgba(255,255,255,0.2)"
      ctx.fillRect(
        brick.x * sx,
        brick.y * sy,
        brick.width * sx,
        3 * sy
      )

      // Show remaining hits for multi-hit bricks
      if (brick.type === BRICK_TYPES.HARD || brick.type === BRICK_TYPES.SUPER) {
        ctx.fillStyle = "#fff"
        ctx.font = `${10 * Math.min(sx, sy)}px monospace`
        ctx.textAlign = "center"
        ctx.fillText(
          brick.hits.toString(),
          (brick.x + brick.width / 2) * sx,
          (brick.y + brick.height / 2 + 4) * sy
        )
      }

      // Indestructible pattern
      if (brick.type === BRICK_TYPES.INDESTRUCTIBLE) {
        ctx.strokeStyle = "rgba(255,255,255,0.3)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(brick.x * sx, brick.y * sy)
        ctx.lineTo((brick.x + brick.width) * sx, (brick.y + brick.height) * sy)
        ctx.moveTo((brick.x + brick.width) * sx, brick.y * sy)
        ctx.lineTo(brick.x * sx, (brick.y + brick.height) * sy)
        ctx.stroke()
      }
    })

    // Draw paddle
    ctx.shadowColor = "#39ff78"
    ctx.shadowBlur = 15
    ctx.fillStyle = "#39ff78"
    ctx.beginPath()
    ctx.roundRect(
      paddleRef.current.x * sx,
      (CANVAS_HEIGHT - 40) * sy,
      PADDLE_WIDTH * sx,
      PADDLE_HEIGHT * sy,
      4 * Math.min(sx, sy)
    )
    ctx.fill()
    ctx.shadowBlur = 0

    // Draw ball
    ctx.shadowColor = "#00d4ff"
    ctx.shadowBlur = 20
    ctx.fillStyle = "#00d4ff"
    ctx.beginPath()
    ctx.arc(
      ballRef.current.x * sx,
      ballRef.current.y * sy,
      (BALL_SIZE / 2) * Math.min(sx, sy),
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.shadowBlur = 0

    // Draw lives indicator
    for (let i = 0; i < livesRef.current; i++) {
      ctx.fillStyle = "#ff6b6b"
      ctx.shadowColor = "#ff6b6b"
      ctx.shadowBlur = 5
      ctx.beginPath()
      ctx.arc(
        (15 + i * 18) * sx,
        20 * sy,
        5 * Math.min(sx, sy),
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
    ctx.shadowBlur = 0

    // Level indicator
    ctx.fillStyle = "#39ff78"
    ctx.font = `${12 * Math.min(sx, sy)}px monospace`
    ctx.textAlign = "right"
    ctx.fillText(`LV.${levelRef.current}`, (CANVAS_WIDTH - 15) * sx, 24 * sy)
  }, [canvasSize, scaleX, scaleY])

  const destroyBrick = useCallback((index: number) => {
    const brick = bricksRef.current[index]
    if (!brick || !brick.active) return

    brick.hits--
    
    if (brick.hits <= 0 || brick.type === BRICK_TYPES.EXPLOSIVE) {
      brick.active = false
      
      // Score based on brick type with combo multiplier
      const now = Date.now()
      if (now - lastHitTimeRef.current < 1000) {
        comboRef.current = Math.min(comboRef.current + 1, 10)
      } else {
        comboRef.current = 1
      }
      lastHitTimeRef.current = now

      const baseScore = brick.type === BRICK_TYPES.HARD ? 20 :
                       brick.type === BRICK_TYPES.SUPER ? 50 :
                       brick.type === BRICK_TYPES.EXPLOSIVE ? 30 : 10
      const levelBonus = levelRef.current * 5
      scoreRef.current += (baseScore + levelBonus) * comboRef.current
      onScoreChange(scoreRef.current)

      // Explosive brick destroys adjacent
      if (brick.type === BRICK_TYPES.EXPLOSIVE) {
        bricksRef.current.forEach((b, i) => {
          if (b.active && b.type !== BRICK_TYPES.INDESTRUCTIBLE) {
            const dx = Math.abs(b.x - brick.x)
            const dy = Math.abs(b.y - brick.y)
            if (dx <= BRICK_WIDTH + BRICK_PADDING + 5 && dy <= BRICK_HEIGHT + BRICK_PADDING + 5) {
              if (i !== index) {
                b.active = false
                scoreRef.current += 10 * comboRef.current
              }
            }
          }
        })
        onScoreChange(scoreRef.current)
      }
    }
  }, [onScoreChange])

  const checkLevelComplete = useCallback(() => {
    const remainingDestructible = bricksRef.current.filter(
      b => b.active && b.type !== BRICK_TYPES.INDESTRUCTIBLE
    ).length
    return remainingDestructible === 0
  }, [])

  const nextLevel = useCallback(() => {
    levelRef.current++
    if (levelRef.current > 10) {
      setGameState("won")
      setIsRunning(false)
      onGameOver(scoreRef.current, levelRef.current - 1, true)
    } else {
      initBricks(levelRef.current)
      resetBall()
      setGameState("playing")
      setIsRunning(true)
    }
  }, [initBricks, resetBall, setIsRunning, onGameOver])

  const gameLoop = useCallback(() => {
    if (!isRunning || gameState !== "playing") return

    const ball = ballRef.current
    const paddle = paddleRef.current
    const config = LEVEL_CONFIGS[(levelRef.current - 1) % LEVEL_CONFIGS.length]

    // Paddle movement
    if (keysRef.current.has("a") || keysRef.current.has("arrowleft")) {
      paddle.x = Math.max(0, paddle.x - PADDLE_SPEED)
    }
    if (keysRef.current.has("d") || keysRef.current.has("arrowright")) {
      paddle.x = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddle.x + PADDLE_SPEED)
    }

    // Ball attached to paddle
    if (ball.attached) {
      ball.x = paddle.x + PADDLE_WIDTH / 2
      ball.y = CANVAS_HEIGHT - 80
      draw()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
      return
    }

    // Ball movement
    ball.x += ball.vx
    ball.y += ball.vy

    // Wall collisions
    if (ball.x - BALL_SIZE / 2 <= 0 || ball.x + BALL_SIZE / 2 >= CANVAS_WIDTH) {
      ball.vx = -ball.vx
      ball.x = Math.max(BALL_SIZE / 2, Math.min(CANVAS_WIDTH - BALL_SIZE / 2, ball.x))
    }
    if (ball.y - BALL_SIZE / 2 <= 0) {
      ball.vy = -ball.vy
      ball.y = BALL_SIZE / 2
    }

    // Paddle collision
    if (
      ball.y + BALL_SIZE / 2 >= CANVAS_HEIGHT - 40 &&
      ball.y + BALL_SIZE / 2 <= CANVAS_HEIGHT - 40 + PADDLE_HEIGHT &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + PADDLE_WIDTH &&
      ball.vy > 0
    ) {
      // Calculate bounce angle based on hit position
      const hitPos = (ball.x - paddle.x) / PADDLE_WIDTH
      const angle = (hitPos - 0.5) * Math.PI * 0.7 // -63 to +63 degrees
      ball.speed = Math.min(6, ball.speed + 0.05)
      ball.vx = ball.speed * Math.sin(angle)
      ball.vy = -Math.abs(ball.speed * Math.cos(angle))
      ball.y = CANVAS_HEIGHT - 40 - BALL_SIZE / 2
    }

    // Brick collisions
    for (let i = 0; i < bricksRef.current.length; i++) {
      const brick = bricksRef.current[i]
      if (!brick.active) continue

      // Check collision
      if (
        ball.x + BALL_SIZE / 2 >= brick.x &&
        ball.x - BALL_SIZE / 2 <= brick.x + brick.width &&
        ball.y + BALL_SIZE / 2 >= brick.y &&
        ball.y - BALL_SIZE / 2 <= brick.y + brick.height
      ) {
        // Determine collision side
        const overlapLeft = ball.x + BALL_SIZE / 2 - brick.x
        const overlapRight = brick.x + brick.width - (ball.x - BALL_SIZE / 2)
        const overlapTop = ball.y + BALL_SIZE / 2 - brick.y
        const overlapBottom = brick.y + brick.height - (ball.y - BALL_SIZE / 2)

        const minOverlapX = Math.min(overlapLeft, overlapRight)
        const minOverlapY = Math.min(overlapTop, overlapBottom)

        if (minOverlapX < minOverlapY) {
          ball.vx = -ball.vx
        } else {
          ball.vy = -ball.vy
        }

        // Destroy or damage brick (skip indestructible)
        if (brick.type !== BRICK_TYPES.INDESTRUCTIBLE) {
          destroyBrick(i)
        }

        break // Only handle one collision per frame
      }
    }

    // Ball falls below paddle
    if (ball.y > CANVAS_HEIGHT + BALL_SIZE) {
      livesRef.current--
      onLivesChange(livesRef.current)
      
      if (livesRef.current <= 0) {
        setGameState("gameover")
        setIsRunning(false)
        onGameOver(scoreRef.current, levelRef.current, false)
        return
      }
      
      resetBall()
    }

    // Check level complete
    if (checkLevelComplete()) {
      setGameState("levelcomplete")
      setIsRunning(false)
      return
    }

    draw()
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [isRunning, gameState, draw, resetBall, destroyBrick, checkLevelComplete, onLivesChange, onGameOver, setIsRunning])

  // Start game loop
  useEffect(() => {
    if (isRunning && gameState === "playing") {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRunning, gameState, gameLoop])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (["arrowleft", "arrowright", "a", "d", " "].includes(key)) {
        e.preventDefault()
      }
      keysRef.current.add(key)
      
      // Launch ball
      if (key === " " || key === "enter") {
        if (gameState === "playing" && ballRef.current.attached) {
          const ball = ballRef.current
          const config = LEVEL_CONFIGS[(levelRef.current - 1) % LEVEL_CONFIGS.length]
          ball.attached = false
          ball.speed = INITIAL_BALL_SPEED * config.speedMult
          ball.vx = ball.speed * (Math.random() - 0.5)
          ball.vy = -ball.speed
        } else if (gameState === "idle" || gameState === "gameover") {
          startGame()
        } else if (gameState === "levelcomplete") {
          nextLevel()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [gameState, nextLevel])

  const startGame = useCallback(() => {
    if (canStart && !canStart()) {
      onGameStart()
      return
    }
    resetGame(startLevel)
    setGameState("playing")
    setIsRunning(true)
    onGameStart()
    draw()
  }, [resetGame, setIsRunning, onGameStart, canStart, draw, startLevel])

  const launchBall = useCallback(() => {
    if (gameState === "playing" && ballRef.current.attached) {
      const ball = ballRef.current
      const config = LEVEL_CONFIGS[(levelRef.current - 1) % LEVEL_CONFIGS.length]
      ball.attached = false
      ball.speed = INITIAL_BALL_SPEED * config.speedMult
      ball.vx = ball.speed * (Math.random() - 0.5)
      ball.vy = -ball.speed
    }
  }, [gameState])

  // Initial draw
  useEffect(() => {
    draw()
  }, [draw])

  // Touch controls
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (gameState !== "playing") return
    e.preventDefault()
    const touch = e.touches[0]
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (touch.clientX - rect.left) / scaleX
    paddleRef.current.x = Math.max(
      0,
      Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2)
    )
  }, [gameState, scaleX])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Canvas */}
      <div className="relative">
        <div
          className="rounded-lg border-2 border-primary/30 overflow-hidden touch-none"
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
            onTouchMove={handleTouchMove}
            onTouchStart={(e) => {
              if (gameState === "idle" || gameState === "gameover") {
                startGame()
              } else if (gameState === "levelcomplete") {
                nextLevel()
              } else if (gameState === "playing" && ballRef.current.attached) {
                launchBall()
              } else {
                handleTouchMove(e)
              }
            }}
          />
        </div>

        {/* Overlay */}
        {gameState !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            {gameState === "gameover" && (
              <>
                <p
                  className="font-sans text-lg md:text-xl mb-2 text-destructive"
                  style={{ textShadow: "0 0 20px rgba(255, 71, 87, 0.5)" }}
                >
                  GAME OVER
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mb-1">
                  Level {levelRef.current} - Score: {scoreRef.current}
                </p>
              </>
            )}
            {gameState === "levelcomplete" && (
              <>
                <p
                  className="font-sans text-lg md:text-xl mb-2 text-primary"
                  style={{ textShadow: "0 0 20px rgba(57, 255, 120, 0.5)" }}
                >
                  LEVEL {levelRef.current} COMPLETE!
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mb-4">
                  Score: {scoreRef.current}
                </p>
                <button
                  onClick={nextLevel}
                  className="px-5 py-2.5 md:px-6 md:py-3 bg-primary text-primary-foreground font-sans text-[10px] md:text-xs rounded-lg transition-all hover:scale-105 active:scale-95"
                  style={{ boxShadow: "0 0 20px rgba(57, 255, 120, 0.3)" }}
                >
                  NEXT LEVEL
                </button>
                <p className="font-mono text-muted-foreground text-[10px] mt-3 hidden md:block">
                  Press Space or Enter
                </p>
                <p className="font-mono text-muted-foreground text-[10px] mt-3 md:hidden">
                  Tap to continue
                </p>
                {levelRef.current < 10 && (
                  <p className="font-mono text-[9px] text-muted-foreground/60 mt-2">
                    Next: {LEVEL_CONFIGS[levelRef.current]?.name}
                  </p>
                )}
              </>
            )}
            {gameState === "won" && (
              <>
                <p
                  className="font-sans text-lg md:text-xl mb-2 text-primary"
                  style={{ textShadow: "0 0 20px rgba(57, 255, 120, 0.5)" }}
                >
                  YOU WIN!
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mb-4">
                  All 10 levels completed!
                </p>
                <p className="font-mono text-sm text-primary mb-4">
                  Final Score: {scoreRef.current}
                </p>
              </>
            )}
            {gameState === "idle" && (
              <p className="font-sans text-primary text-[10px] mb-4 md:mb-6">
                READY?
              </p>
            )}
            {(gameState === "idle" || gameState === "gameover" || gameState === "won") && (
              <>
                <button
                  onClick={startGame}
                  className="px-5 py-2.5 md:px-6 md:py-3 bg-primary text-primary-foreground font-sans text-[10px] md:text-xs rounded-lg transition-all hover:scale-105 active:scale-95"
                  style={{ boxShadow: "0 0 20px rgba(57, 255, 120, 0.3)" }}
                >
                  {gameState === "idle" ? "START" : "PLAY AGAIN"}
                </button>
                {gameState === "idle" && (
                  <p className="font-mono text-muted-foreground text-[10px] mt-3 md:mt-4 hidden md:block">
                    Press Space or Enter
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="flex gap-4 md:hidden">
        <button
          onTouchStart={() => keysRef.current.add("arrowleft")}
          onTouchEnd={() => keysRef.current.delete("arrowleft")}
          className="w-16 h-16 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          aria-label="Move left"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button
          onTouchStart={launchBall}
          className="w-16 h-16 rounded-lg bg-primary/20 text-primary flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors border border-primary/30"
          aria-label="Launch ball"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        </button>
        <button
          onTouchStart={() => keysRef.current.add("arrowright")}
          onTouchEnd={() => keysRef.current.delete("arrowright")}
          className="w-16 h-16 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          aria-label="Move right"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  )
}

export { LEVEL_CONFIGS }

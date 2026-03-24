"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 300
const PADDLE_WIDTH = 10
const PADDLE_HEIGHT = 60
const BALL_SIZE = 10
const PADDLE_SPEED = 8
const INITIAL_BALL_SPEED = 4
const MAX_BALL_SPEED = 12

// AI difficulty configurations - 10 levels
// reaction: how fast AI reacts (0-1, higher = faster)
// accuracy: how accurate AI predicts ball (0-1, higher = more accurate)
// errorChance: chance AI makes mistake (0-1, lower = fewer mistakes)
// speedMultiplier: AI paddle speed multiplier
const AI_CONFIGS = [
  { name: "Rookie", reaction: 0.2, accuracy: 0.3, errorChance: 0.4, speedMultiplier: 0.4, description: "First time playing" },
  { name: "Beginner", reaction: 0.3, accuracy: 0.4, errorChance: 0.35, speedMultiplier: 0.5, description: "Learning the basics" },
  { name: "Casual", reaction: 0.4, accuracy: 0.5, errorChance: 0.3, speedMultiplier: 0.6, description: "Relaxed gameplay" },
  { name: "Amateur", reaction: 0.5, accuracy: 0.55, errorChance: 0.25, speedMultiplier: 0.7, description: "Getting competitive" },
  { name: "Intermediate", reaction: 0.55, accuracy: 0.6, errorChance: 0.2, speedMultiplier: 0.75, description: "Decent challenge" },
  { name: "Skilled", reaction: 0.6, accuracy: 0.7, errorChance: 0.15, speedMultiplier: 0.8, description: "Requires focus" },
  { name: "Advanced", reaction: 0.7, accuracy: 0.75, errorChance: 0.1, speedMultiplier: 0.85, description: "Serious competition" },
  { name: "Expert", reaction: 0.8, accuracy: 0.85, errorChance: 0.08, speedMultiplier: 0.9, description: "Near perfect play" },
  { name: "Master", reaction: 0.9, accuracy: 0.92, errorChance: 0.05, speedMultiplier: 0.95, description: "Almost unbeatable" },
  { name: "Legendary", reaction: 0.98, accuracy: 0.98, errorChance: 0.02, speedMultiplier: 1.0, description: "Good luck!" },
]

interface PongGameProps {
  onScoreChange: (playerScore: number, aiScore: number) => void
  onGameOver: (playerScore: number) => void
  onGameStart: () => void
  canStart?: () => boolean
  isRunning: boolean
  setIsRunning: (running: boolean) => void
  winScore?: number
  aiLevel?: number
}

export function PongGame({
  onScoreChange,
  onGameOver,
  onGameStart,
  canStart,
  isRunning,
  setIsRunning,
  winScore = 11,
  aiLevel = 1,
}: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle")
  const [winner, setWinner] = useState<"player" | "ai" | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT })

  // Game state refs
  const playerPaddleRef = useRef({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 })
  const aiPaddleRef = useRef({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 })
  const ballRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: INITIAL_BALL_SPEED,
    vy: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1) * 0.5,
    speed: INITIAL_BALL_SPEED,
  })
  const playerScoreRef = useRef(0)
  const aiScoreRef = useRef(0)
  const keysRef = useRef<Set<string>>(new Set())
  const animationFrameRef = useRef<number | null>(null)
  const aiLevelRef = useRef(aiLevel)
  const aiTargetYRef = useRef(CANVAS_HEIGHT / 2)
  const aiErrorRef = useRef(0)
  const lastAiUpdateRef = useRef(0)

  // Update AI level ref when prop changes
  useEffect(() => {
    aiLevelRef.current = aiLevel
  }, [aiLevel])

  // Responsive canvas sizing
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const maxW = vw - 32
      const maxH = vh - 420
      const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT
      let width = Math.min(maxW, CANVAS_WIDTH)
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

  const resetBall = useCallback((direction: 1 | -1) => {
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: INITIAL_BALL_SPEED * direction,
      vy: INITIAL_BALL_SPEED * (Math.random() - 0.5),
      speed: INITIAL_BALL_SPEED,
    }
    // Reset AI error when ball resets
    aiErrorRef.current = (Math.random() - 0.5) * PADDLE_HEIGHT * 0.5
  }, [])

  const resetGame = useCallback(() => {
    playerPaddleRef.current = { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 }
    aiPaddleRef.current = { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 }
    resetBall(1)
    playerScoreRef.current = 0
    aiScoreRef.current = 0
    onScoreChange(0, 0)
    setWinner(null)
    aiTargetYRef.current = CANVAS_HEIGHT / 2
    aiErrorRef.current = 0
  }, [resetBall, onScoreChange])

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

    // Center line
    ctx.strokeStyle = "rgba(57, 255, 120, 0.2)"
    ctx.lineWidth = 2
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(canvasSize.width / 2, 0)
    ctx.lineTo(canvasSize.width / 2, canvasSize.height)
    ctx.stroke()
    ctx.setLineDash([])

    // Player paddle (left)
    ctx.shadowColor = "#39ff78"
    ctx.shadowBlur = 15
    ctx.fillStyle = "#39ff78"
    ctx.fillRect(
      10 * sx,
      playerPaddleRef.current.y * sy,
      PADDLE_WIDTH * sx,
      PADDLE_HEIGHT * sy
    )

    // AI paddle (right) - color changes based on difficulty
    const aiConfig = AI_CONFIGS[aiLevelRef.current - 1]
    const aiColorIntensity = Math.floor(100 + (aiLevelRef.current / 10) * 155)
    const aiColor = `rgb(255, ${Math.max(0, 150 - aiLevelRef.current * 12)}, ${Math.max(0, 150 - aiLevelRef.current * 12)})`
    ctx.shadowColor = aiColor
    ctx.shadowBlur = 15
    ctx.fillStyle = aiColor
    ctx.fillRect(
      (CANVAS_WIDTH - 20) * sx,
      aiPaddleRef.current.y * sy,
      PADDLE_WIDTH * sx,
      PADDLE_HEIGHT * sy
    )

    // Ball
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
  }, [canvasSize, scaleX, scaleY])

  const predictBallY = useCallback(() => {
    const ball = ballRef.current
    if (ball.vx < 0) return CANVAS_HEIGHT / 2 // Ball moving away

    // Predict where ball will be when it reaches AI paddle
    const timeToReach = (CANVAS_WIDTH - 20 - ball.x) / ball.vx
    let predictedY = ball.y + ball.vy * timeToReach

    // Account for bounces
    while (predictedY < 0 || predictedY > CANVAS_HEIGHT) {
      if (predictedY < 0) {
        predictedY = -predictedY
      } else if (predictedY > CANVAS_HEIGHT) {
        predictedY = 2 * CANVAS_HEIGHT - predictedY
      }
    }

    return predictedY
  }, [])

  const gameLoop = useCallback(() => {
    if (!isRunning || gameState !== "playing") return

    const ball = ballRef.current
    const playerPaddle = playerPaddleRef.current
    const aiPaddle = aiPaddleRef.current
    const config = AI_CONFIGS[aiLevelRef.current - 1]

    // Player paddle movement
    if (keysRef.current.has("w") || keysRef.current.has("arrowup")) {
      playerPaddle.y = Math.max(0, playerPaddle.y - PADDLE_SPEED)
    }
    if (keysRef.current.has("s") || keysRef.current.has("arrowdown")) {
      playerPaddle.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, playerPaddle.y + PADDLE_SPEED)
    }

    // AI paddle movement with configurable difficulty
    const now = Date.now()
    const aiUpdateInterval = 100 - config.reaction * 80 // 100ms to 20ms based on reaction

    if (now - lastAiUpdateRef.current > aiUpdateInterval) {
      lastAiUpdateRef.current = now

      // Decide if AI should make an error
      if (Math.random() < config.errorChance) {
        aiErrorRef.current = (Math.random() - 0.5) * PADDLE_HEIGHT * (1 - config.accuracy)
      }

      // Predict ball position based on accuracy
      if (ball.vx > 0) {
        const predictedY = predictBallY()
        const accuracyNoise = (Math.random() - 0.5) * PADDLE_HEIGHT * (1 - config.accuracy)
        aiTargetYRef.current = predictedY + accuracyNoise + aiErrorRef.current
      } else {
        // When ball moving away, return to center with some randomness
        aiTargetYRef.current = CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 50
      }
    }

    // Move AI paddle towards target
    const aiCenter = aiPaddle.y + PADDLE_HEIGHT / 2
    const targetY = aiTargetYRef.current
    const diff = targetY - aiCenter
    const aiSpeed = PADDLE_SPEED * config.speedMultiplier

    if (Math.abs(diff) > 5) {
      if (diff > 0) {
        aiPaddle.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, aiPaddle.y + aiSpeed)
      } else {
        aiPaddle.y = Math.max(0, aiPaddle.y - aiSpeed)
      }
    }

    // Ball movement
    ball.x += ball.vx
    ball.y += ball.vy

    // Ball collision with top/bottom walls
    if (ball.y - BALL_SIZE / 2 <= 0 || ball.y + BALL_SIZE / 2 >= CANVAS_HEIGHT) {
      ball.vy = -ball.vy
      ball.y = Math.max(BALL_SIZE / 2, Math.min(CANVAS_HEIGHT - BALL_SIZE / 2, ball.y))
    }

    // Ball collision with player paddle
    if (
      ball.x - BALL_SIZE / 2 <= 20 &&
      ball.x - BALL_SIZE / 2 >= 10 &&
      ball.y >= playerPaddle.y &&
      ball.y <= playerPaddle.y + PADDLE_HEIGHT
    ) {
      // Calculate bounce angle based on where ball hit paddle
      const hitPos = (ball.y - playerPaddle.y) / PADDLE_HEIGHT
      const angle = (hitPos - 0.5) * Math.PI * 0.7 // Max 63 degrees
      ball.speed = Math.min(MAX_BALL_SPEED, ball.speed + 0.3)
      ball.vx = Math.abs(ball.speed * Math.cos(angle))
      ball.vy = ball.speed * Math.sin(angle)
      ball.x = 21
      // Reset AI error on paddle hit
      aiErrorRef.current = (Math.random() - 0.5) * PADDLE_HEIGHT * (1 - config.accuracy)
    }

    // Ball collision with AI paddle
    if (
      ball.x + BALL_SIZE / 2 >= CANVAS_WIDTH - 20 &&
      ball.x + BALL_SIZE / 2 <= CANVAS_WIDTH - 10 &&
      ball.y >= aiPaddle.y &&
      ball.y <= aiPaddle.y + PADDLE_HEIGHT
    ) {
      const hitPos = (ball.y - aiPaddle.y) / PADDLE_HEIGHT
      const angle = (hitPos - 0.5) * Math.PI * 0.7
      ball.speed = Math.min(MAX_BALL_SPEED, ball.speed + 0.3)
      ball.vx = -Math.abs(ball.speed * Math.cos(angle))
      ball.vy = ball.speed * Math.sin(angle)
      ball.x = CANVAS_WIDTH - 21
    }

    // Score points
    if (ball.x < 0) {
      // AI scores
      aiScoreRef.current += 1
      onScoreChange(playerScoreRef.current, aiScoreRef.current)
      if (aiScoreRef.current >= winScore) {
        setWinner("ai")
        setGameState("gameover")
        setIsRunning(false)
        onGameOver(playerScoreRef.current)
        return
      }
      resetBall(-1)
    } else if (ball.x > CANVAS_WIDTH) {
      // Player scores
      playerScoreRef.current += 1
      onScoreChange(playerScoreRef.current, aiScoreRef.current)
      if (playerScoreRef.current >= winScore) {
        setWinner("player")
        setGameState("gameover")
        setIsRunning(false)
        onGameOver(playerScoreRef.current)
        return
      }
      resetBall(1)
    }

    draw()
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [isRunning, gameState, draw, resetBall, onScoreChange, onGameOver, setIsRunning, winScore, predictBallY])

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
      if (["arrowup", "arrowdown", "w", "s", " "].includes(key)) {
        e.preventDefault()
      }
      keysRef.current.add(key)
      
      if (key === " " || key === "enter") {
        if (gameState !== "playing") {
          startGame()
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
  }, [gameState])

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

  // Initial draw
  useEffect(() => {
    draw()
  }, [draw])

  // Touch/mobile controls
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (gameState !== "playing") return
    e.preventDefault()
    const touch = e.touches[0]
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const y = (touch.clientY - rect.top) / scaleY
    playerPaddleRef.current.y = Math.max(
      0,
      Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, y - PADDLE_HEIGHT / 2)
    )
  }, [gameState, scaleY])

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
              if (gameState !== "playing") {
                startGame()
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
                  className={`font-sans text-lg md:text-xl mb-2 ${
                    winner === "player" ? "text-primary" : "text-destructive"
                  }`}
                  style={{
                    textShadow: winner === "player"
                      ? "0 0 20px rgba(57, 255, 120, 0.5)"
                      : "0 0 20px rgba(255, 71, 87, 0.5)",
                  }}
                >
                  {winner === "player" ? "YOU WIN!" : "GAME OVER"}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mb-4">
                  {playerScoreRef.current} - {aiScoreRef.current}
                </p>
              </>
            )}
            {gameState === "idle" && (
              <p className="font-sans text-primary text-[10px] mb-4 md:mb-6">
                READY?
              </p>
            )}
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

      {/* Mobile Controls */}
      <div className="flex gap-8 md:hidden">
        <button
          onTouchStart={() => keysRef.current.add("w")}
          onTouchEnd={() => keysRef.current.delete("w")}
          className="w-16 h-16 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          aria-label="Move up"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
        <button
          onTouchStart={() => keysRef.current.add("s")}
          onTouchEnd={() => keysRef.current.delete("s")}
          className="w-16 h-16 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          aria-label="Move down"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
    </div>
  )
}

export { AI_CONFIGS }

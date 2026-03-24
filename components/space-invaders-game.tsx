"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 500
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 20
const PLAYER_SPEED = 6
const BULLET_SPEED = 8
const BULLET_WIDTH = 3
const BULLET_HEIGHT = 10
const INVADER_WIDTH = 30
const INVADER_HEIGHT = 20
const INVADER_ROWS = 5
const INVADER_COLS = 8
const INVADER_PADDING = 10
const INVADER_BASE_SPEED = 0.5
const INVADER_DROP = 15
const ENEMY_BULLET_SPEED = 4

interface Position {
  x: number
  y: number
}

interface Invader extends Position {
  alive: boolean
  type: 0 | 1 | 2 // Different invader types
}

interface Bullet extends Position {
  active: boolean
}

interface SpaceInvadersGameProps {
  onScoreChange: (score: number) => void
  onGameOver: (score: number) => void
  onGameStart: () => void
  onLivesChange: (lives: number) => void
  onWaveChange: (wave: number) => void
  canStart?: () => boolean
  isRunning: boolean
  setIsRunning: (running: boolean) => void
}

const INVADER_COLORS = ["#39ff78", "#00d4ff", "#c850c0"]
const INVADER_POINTS = [30, 20, 10]

export function SpaceInvadersGame({
  onScoreChange,
  onGameOver,
  onGameStart,
  onLivesChange,
  onWaveChange,
  canStart,
  isRunning,
  setIsRunning,
}: SpaceInvadersGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle")
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT })

  // Game state refs
  const playerRef = useRef({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 40 })
  const bulletsRef = useRef<Bullet[]>([])
  const enemyBulletsRef = useRef<Bullet[]>([])
  const invadersRef = useRef<Invader[]>([])
  const invaderDirectionRef = useRef<1 | -1>(1)
  const invaderSpeedRef = useRef(INVADER_BASE_SPEED)
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const waveRef = useRef(1)
  const lastShotRef = useRef(0)
  const lastEnemyShotRef = useRef(0)
  const keysRef = useRef<Set<string>>(new Set())
  const animationFrameRef = useRef<number | null>(null)

  // Responsive canvas sizing
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const maxW = vw - 32
      const maxH = vh - 340
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

  const createInvaders = useCallback((wave: number) => {
    const invaders: Invader[] = []
    const startX = 30
    const startY = 50

    for (let row = 0; row < INVADER_ROWS; row++) {
      for (let col = 0; col < INVADER_COLS; col++) {
        invaders.push({
          x: startX + col * (INVADER_WIDTH + INVADER_PADDING),
          y: startY + row * (INVADER_HEIGHT + INVADER_PADDING),
          alive: true,
          type: row < 1 ? 0 : row < 3 ? 1 : 2,
        })
      }
    }

    // Increase speed based on wave
    invaderSpeedRef.current = INVADER_BASE_SPEED + (wave - 1) * 0.3

    return invaders
  }, [])

  const resetGame = useCallback(() => {
    playerRef.current = { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 40 }
    bulletsRef.current = []
    enemyBulletsRef.current = []
    invadersRef.current = createInvaders(1)
    invaderDirectionRef.current = 1
    scoreRef.current = 0
    livesRef.current = 3
    waveRef.current = 1
    lastShotRef.current = 0
    lastEnemyShotRef.current = 0
    onScoreChange(0)
    onLivesChange(3)
    onWaveChange(1)
  }, [createInvaders, onScoreChange, onLivesChange, onWaveChange])

  const shoot = useCallback(() => {
    const now = Date.now()
    if (now - lastShotRef.current < 250) return // Rate limit shots
    lastShotRef.current = now

    bulletsRef.current.push({
      x: playerRef.current.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
      y: playerRef.current.y - BULLET_HEIGHT,
      active: true,
    })
  }, [])

  const enemyShoot = useCallback(() => {
    const now = Date.now()
    const shootInterval = Math.max(800, 2000 - waveRef.current * 150)
    if (now - lastEnemyShotRef.current < shootInterval) return
    lastEnemyShotRef.current = now

    const aliveInvaders = invadersRef.current.filter((inv) => inv.alive)
    if (aliveInvaders.length === 0) return

    // Random invader shoots
    const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)]
    enemyBulletsRef.current.push({
      x: shooter.x + INVADER_WIDTH / 2 - BULLET_WIDTH / 2,
      y: shooter.y + INVADER_HEIGHT,
      active: true,
    })
  }, [])

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

    // Stars background
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
    for (let i = 0; i < 50; i++) {
      const x = (i * 97) % CANVAS_WIDTH
      const y = (i * 53) % CANVAS_HEIGHT
      ctx.fillRect(x * sx, y * sy, 1, 1)
    }

    // Draw player
    ctx.shadowColor = "#39ff78"
    ctx.shadowBlur = 15
    ctx.fillStyle = "#39ff78"
    const player = playerRef.current
    // Ship body
    ctx.beginPath()
    ctx.moveTo((player.x + PLAYER_WIDTH / 2) * sx, player.y * sy)
    ctx.lineTo(player.x * sx, (player.y + PLAYER_HEIGHT) * sy)
    ctx.lineTo((player.x + PLAYER_WIDTH) * sx, (player.y + PLAYER_HEIGHT) * sy)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0

    // Draw player bullets
    ctx.shadowColor = "#39ff78"
    ctx.shadowBlur = 8
    ctx.fillStyle = "#39ff78"
    bulletsRef.current.forEach((bullet) => {
      if (bullet.active) {
        ctx.fillRect(bullet.x * sx, bullet.y * sy, BULLET_WIDTH * sx, BULLET_HEIGHT * sy)
      }
    })
    ctx.shadowBlur = 0

    // Draw enemy bullets
    ctx.shadowColor = "#ff4757"
    ctx.shadowBlur = 8
    ctx.fillStyle = "#ff4757"
    enemyBulletsRef.current.forEach((bullet) => {
      if (bullet.active) {
        ctx.fillRect(bullet.x * sx, bullet.y * sy, BULLET_WIDTH * sx, BULLET_HEIGHT * sy)
      }
    })
    ctx.shadowBlur = 0

    // Draw invaders
    invadersRef.current.forEach((invader) => {
      if (!invader.alive) return

      const color = INVADER_COLORS[invader.type]
      ctx.shadowColor = color
      ctx.shadowBlur = 10
      ctx.fillStyle = color

      const ix = invader.x * sx
      const iy = invader.y * sy
      const iw = INVADER_WIDTH * sx
      const ih = INVADER_HEIGHT * sy

      // Draw invader shape based on type
      if (invader.type === 0) {
        // Top row - small
        ctx.beginPath()
        ctx.roundRect(ix + iw * 0.2, iy, iw * 0.6, ih * 0.6, 2)
        ctx.fill()
        ctx.fillRect(ix, iy + ih * 0.4, iw * 0.3, ih * 0.6)
        ctx.fillRect(ix + iw * 0.7, iy + ih * 0.4, iw * 0.3, ih * 0.6)
      } else if (invader.type === 1) {
        // Middle rows
        ctx.beginPath()
        ctx.roundRect(ix + iw * 0.1, iy + ih * 0.2, iw * 0.8, ih * 0.6, 2)
        ctx.fill()
        ctx.fillRect(ix, iy, iw * 0.25, ih * 0.5)
        ctx.fillRect(ix + iw * 0.75, iy, iw * 0.25, ih * 0.5)
        ctx.fillRect(ix + iw * 0.2, iy + ih * 0.7, iw * 0.2, ih * 0.3)
        ctx.fillRect(ix + iw * 0.6, iy + ih * 0.7, iw * 0.2, ih * 0.3)
      } else {
        // Bottom rows - large
        ctx.beginPath()
        ctx.roundRect(ix, iy + ih * 0.2, iw, ih * 0.6, 3)
        ctx.fill()
        ctx.fillRect(ix + iw * 0.1, iy, iw * 0.2, ih * 0.4)
        ctx.fillRect(ix + iw * 0.7, iy, iw * 0.2, ih * 0.4)
        ctx.fillRect(ix + iw * 0.3, iy + ih * 0.7, iw * 0.15, ih * 0.3)
        ctx.fillRect(ix + iw * 0.55, iy + ih * 0.7, iw * 0.15, ih * 0.3)
      }
    })
    ctx.shadowBlur = 0
  }, [canvasSize, scaleX, scaleY])

  const gameLoop = useCallback(() => {
    if (!isRunning || gameState !== "playing") return

    const player = playerRef.current

    // Player movement
    if (keysRef.current.has("a") || keysRef.current.has("arrowleft")) {
      player.x = Math.max(0, player.x - PLAYER_SPEED)
    }
    if (keysRef.current.has("d") || keysRef.current.has("arrowright")) {
      player.x = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, player.x + PLAYER_SPEED)
    }
    if (keysRef.current.has(" ")) {
      shoot()
    }

    // Move player bullets
    bulletsRef.current = bulletsRef.current.filter((bullet) => {
      if (!bullet.active) return false
      bullet.y -= BULLET_SPEED
      return bullet.y > -BULLET_HEIGHT
    })

    // Move enemy bullets
    enemyBulletsRef.current = enemyBulletsRef.current.filter((bullet) => {
      if (!bullet.active) return false
      bullet.y += ENEMY_BULLET_SPEED
      return bullet.y < CANVAS_HEIGHT
    })

    // Move invaders
    let shouldDrop = false
    const invaders = invadersRef.current
    const aliveInvaders = invaders.filter((inv) => inv.alive)

    if (aliveInvaders.length > 0) {
      // Check if any invader hit the edge
      for (const invader of aliveInvaders) {
        if (
          (invaderDirectionRef.current === 1 && invader.x + INVADER_WIDTH >= CANVAS_WIDTH - 10) ||
          (invaderDirectionRef.current === -1 && invader.x <= 10)
        ) {
          shouldDrop = true
          break
        }
      }

      if (shouldDrop) {
        invaderDirectionRef.current *= -1
        for (const invader of invaders) {
          invader.y += INVADER_DROP
        }
        // Speed up as invaders are destroyed
        invaderSpeedRef.current += 0.1
      } else {
        for (const invader of invaders) {
          invader.x += invaderSpeedRef.current * invaderDirectionRef.current
        }
      }

      // Enemy shooting
      enemyShoot()
    }

    // Check bullet collisions with invaders
    for (const bullet of bulletsRef.current) {
      if (!bullet.active) continue
      for (const invader of invaders) {
        if (!invader.alive) continue
        if (
          bullet.x < invader.x + INVADER_WIDTH &&
          bullet.x + BULLET_WIDTH > invader.x &&
          bullet.y < invader.y + INVADER_HEIGHT &&
          bullet.y + BULLET_HEIGHT > invader.y
        ) {
          bullet.active = false
          invader.alive = false
          scoreRef.current += INVADER_POINTS[invader.type]
          onScoreChange(scoreRef.current)

          // Speed up remaining invaders
          const remaining = invaders.filter((i) => i.alive).length
          if (remaining > 0) {
            invaderSpeedRef.current = INVADER_BASE_SPEED + (waveRef.current - 1) * 0.3 + (40 - remaining) * 0.03
          }
          break
        }
      }
    }

    // Check enemy bullet collision with player
    for (const bullet of enemyBulletsRef.current) {
      if (!bullet.active) continue
      if (
        bullet.x < player.x + PLAYER_WIDTH &&
        bullet.x + BULLET_WIDTH > player.x &&
        bullet.y < player.y + PLAYER_HEIGHT &&
        bullet.y + BULLET_HEIGHT > player.y
      ) {
        bullet.active = false
        livesRef.current -= 1
        onLivesChange(livesRef.current)

        if (livesRef.current <= 0) {
          setGameState("gameover")
          setIsRunning(false)
          onGameOver(scoreRef.current)
          return
        }
      }
    }

    // Check if invaders reached the bottom
    for (const invader of aliveInvaders) {
      if (invader.y + INVADER_HEIGHT >= player.y) {
        setGameState("gameover")
        setIsRunning(false)
        onGameOver(scoreRef.current)
        return
      }
    }

    // Check if all invaders destroyed - next wave
    if (aliveInvaders.length === 0) {
      waveRef.current += 1
      onWaveChange(waveRef.current)
      invadersRef.current = createInvaders(waveRef.current)
      invaderDirectionRef.current = 1
      bulletsRef.current = []
      enemyBulletsRef.current = []
    }

    draw()
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [isRunning, gameState, draw, shoot, enemyShoot, createInvaders, onScoreChange, onLivesChange, onWaveChange, onGameOver, setIsRunning])

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

      if ((key === " " || key === "enter") && gameState !== "playing") {
        startGame()
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
    invadersRef.current = createInvaders(1)
    draw()
  }, [draw, createInvaders])

  // Mobile controls
  const handleMobileMove = useCallback((direction: "left" | "right") => {
    if (gameState !== "playing") return
    const player = playerRef.current
    if (direction === "left") {
      player.x = Math.max(0, player.x - PLAYER_SPEED * 2)
    } else {
      player.x = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, player.x + PLAYER_SPEED * 2)
    }
  }, [gameState])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
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
              <>
                <p
                  className="font-sans text-lg md:text-xl text-destructive mb-2"
                  style={{ textShadow: "0 0 20px rgba(255, 71, 87, 0.5)" }}
                >
                  GAME OVER
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mb-2">
                  Score: {scoreRef.current}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mb-4">
                  Wave: {waveRef.current}
                </p>
              </>
            )}
            {gameState === "idle" && (
              <p className="font-sans text-primary text-[10px] mb-4 md:mb-6">
                DEFEND EARTH
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
      <div className="flex gap-4 md:hidden">
        <button
          onTouchStart={() => keysRef.current.add("a")}
          onTouchEnd={() => keysRef.current.delete("a")}
          onClick={() => handleMobileMove("left")}
          className="w-16 h-16 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          aria-label="Move left"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button
          onTouchStart={() => keysRef.current.add(" ")}
          onTouchEnd={() => keysRef.current.delete(" ")}
          onClick={() => {
            if (gameState !== "playing") {
              startGame()
            } else {
              shoot()
            }
          }}
          className="w-20 h-16 rounded-lg bg-primary/20 text-primary flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          aria-label="Fire"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </button>
        <button
          onTouchStart={() => keysRef.current.add("d")}
          onTouchEnd={() => keysRef.current.delete("d")}
          onClick={() => handleMobileMove("right")}
          className="w-16 h-16 rounded-lg bg-secondary text-foreground flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          aria-label="Move right"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  )
}

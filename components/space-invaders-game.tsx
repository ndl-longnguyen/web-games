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
const POWERUP_SIZE = 15
const POWERUP_SPEED = 2

interface Position {
  x: number
  y: number
}

interface Invader extends Position {
  alive: boolean
  type: 0 | 1 | 2 // Different invader types
}

interface Boss extends Position {
  health: number
  maxHealth: number
  width: number
  height: number
  phase: number // Boss attack phase
  lastShot: number
  lastMove: number
  direction: 1 | -1
}

interface Bullet extends Position {
  active: boolean
  damage?: number
}

interface PowerUp extends Position {
  type: "spread" | "rapid" | "power" | "shield" | "bomb"
  active: boolean
}

interface SpaceInvadersGameProps {
  onScoreChange: (score: number) => void
  onGameOver: (score: number) => void
  onGameStart: () => void
  onLivesChange: (lives: number) => void
  onWaveChange: (wave: number) => void
  onWeaponLevelChange?: (level: number) => void
  canStart?: () => boolean
  isRunning: boolean
  setIsRunning: (running: boolean) => void
}

const INVADER_COLORS = ["#39ff78", "#00d4ff", "#c850c0"]
const INVADER_POINTS = [30, 20, 10]

// Power-up configurations
const POWERUP_CONFIGS = {
  spread: { color: "#ffaa00", name: "Spread Shot", description: "Fire multiple bullets" },
  rapid: { color: "#00d4ff", name: "Rapid Fire", description: "Faster shooting" },
  power: { color: "#ff4757", name: "Power Up", description: "More damage" },
  shield: { color: "#39ff78", name: "Shield", description: "Block one hit" },
  bomb: { color: "#c850c0", name: "Bomb", description: "Clear all enemies" },
}

// Boss configurations for every 10 waves
const BOSS_CONFIGS = [
  { name: "Commander", health: 50, width: 80, height: 40, color: "#ff6b35" },
  { name: "Destroyer", health: 100, width: 100, height: 50, color: "#ff4757" },
  { name: "Overlord", health: 150, width: 120, height: 60, color: "#9c27b0" },
  { name: "Titan", health: 200, width: 140, height: 70, color: "#3d5af1" },
  { name: "Leviathan", health: 300, width: 160, height: 80, color: "#00bcd4" },
]

export function SpaceInvadersGame({
  onScoreChange,
  onGameOver,
  onGameStart,
  onLivesChange,
  onWaveChange,
  onWeaponLevelChange,
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
  const powerUpsRef = useRef<PowerUp[]>([])
  const bossRef = useRef<Boss | null>(null)
  const invaderDirectionRef = useRef<1 | -1>(1)
  const invaderSpeedRef = useRef(INVADER_BASE_SPEED)
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const waveRef = useRef(1)
  const weaponLevelRef = useRef(1)
  const shieldActiveRef = useRef(false)
  const lastShotRef = useRef(0)
  const lastEnemyShotRef = useRef(0)
  const keysRef = useRef<Set<string>>(new Set())
  const animationFrameRef = useRef<number | null>(null)

  // Weapon stats based on level
  const getWeaponStats = useCallback(() => {
    const level = weaponLevelRef.current
    return {
      bulletCount: Math.min(1 + Math.floor((level - 1) / 3), 5), // 1-5 bullets
      fireRate: Math.max(50, 250 - (level - 1) * 20), // 250ms to 50ms
      damage: 1 + Math.floor((level - 1) / 2), // 1-X damage
      spreadAngle: Math.min(0.1 + (level - 1) * 0.02, 0.4), // Spread angle
    }
  }, [])

  // Responsive canvas sizing
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const maxW = vw - 32
      const maxH = vh - 380
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
    invaderSpeedRef.current = INVADER_BASE_SPEED + (wave - 1) * 0.15

    return invaders
  }, [])

  const createBoss = useCallback((wave: number) => {
    const bossIndex = Math.min(Math.floor((wave - 1) / 10), BOSS_CONFIGS.length - 1)
    const config = BOSS_CONFIGS[bossIndex]
    const waveMultiplier = 1 + Math.floor(wave / 10) * 0.5

    return {
      x: CANVAS_WIDTH / 2 - config.width / 2,
      y: 30,
      health: Math.floor(config.health * waveMultiplier),
      maxHealth: Math.floor(config.health * waveMultiplier),
      width: config.width,
      height: config.height,
      phase: 0,
      lastShot: 0,
      lastMove: 0,
      direction: 1 as 1 | -1,
    }
  }, [])

  const spawnPowerUp = useCallback((x: number, y: number) => {
    // 15% chance to spawn power-up
    if (Math.random() > 0.15) return

    const types: PowerUp["type"][] = ["spread", "rapid", "power", "shield", "bomb"]
    const weights = [0.3, 0.3, 0.25, 0.1, 0.05] // bomb is rarest
    const random = Math.random()
    let cumulative = 0
    let selectedType: PowerUp["type"] = "spread"

    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i]
      if (random < cumulative) {
        selectedType = types[i]
        break
      }
    }

    powerUpsRef.current.push({
      x: x + INVADER_WIDTH / 2 - POWERUP_SIZE / 2,
      y,
      type: selectedType,
      active: true,
    })
  }, [])

  const collectPowerUp = useCallback((powerUp: PowerUp) => {
    const level = weaponLevelRef.current

    switch (powerUp.type) {
      case "spread":
      case "rapid":
      case "power":
        weaponLevelRef.current = Math.min(level + 1, 20) // Max level 20
        onWeaponLevelChange?.(weaponLevelRef.current)
        break
      case "shield":
        shieldActiveRef.current = true
        break
      case "bomb":
        // Clear all invaders
        invadersRef.current.forEach((inv) => {
          if (inv.alive) {
            inv.alive = false
            scoreRef.current += INVADER_POINTS[inv.type] * 2
          }
        })
        onScoreChange(scoreRef.current)
        break
    }
  }, [onScoreChange, onWeaponLevelChange])

  const resetGame = useCallback(() => {
    playerRef.current = { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 40 }
    bulletsRef.current = []
    enemyBulletsRef.current = []
    powerUpsRef.current = []
    invadersRef.current = createInvaders(1)
    bossRef.current = null
    invaderDirectionRef.current = 1
    scoreRef.current = 0
    livesRef.current = 3
    waveRef.current = 1
    weaponLevelRef.current = 1
    shieldActiveRef.current = false
    lastShotRef.current = 0
    lastEnemyShotRef.current = 0
    onScoreChange(0)
    onLivesChange(3)
    onWaveChange(1)
    onWeaponLevelChange?.(1)
  }, [createInvaders, onScoreChange, onLivesChange, onWaveChange, onWeaponLevelChange])

  const shoot = useCallback(() => {
    const now = Date.now()
    const stats = getWeaponStats()
    if (now - lastShotRef.current < stats.fireRate) return
    lastShotRef.current = now

    const player = playerRef.current
    const bulletCount = stats.bulletCount

    if (bulletCount === 1) {
      bulletsRef.current.push({
        x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: player.y - BULLET_HEIGHT,
        active: true,
        damage: stats.damage,
      })
    } else {
      // Spread shot
      for (let i = 0; i < bulletCount; i++) {
        const angle = ((i - (bulletCount - 1) / 2) * stats.spreadAngle)
        bulletsRef.current.push({
          x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2 + Math.sin(angle) * 10,
          y: player.y - BULLET_HEIGHT,
          active: true,
          damage: stats.damage,
        })
      }
    }
  }, [getWeaponStats])

  const enemyShoot = useCallback(() => {
    const now = Date.now()
    const wave = waveRef.current
    const shootInterval = Math.max(400, 2000 - wave * 80)
    if (now - lastEnemyShotRef.current < shootInterval) return
    lastEnemyShotRef.current = now

    // Boss shooting
    const boss = bossRef.current
    if (boss) {
      const bulletCount = 1 + Math.floor(boss.phase / 2)
      for (let i = 0; i < bulletCount; i++) {
        const offset = (i - (bulletCount - 1) / 2) * 30
        enemyBulletsRef.current.push({
          x: boss.x + boss.width / 2 - BULLET_WIDTH / 2 + offset,
          y: boss.y + boss.height,
          active: true,
        })
      }
      return
    }

    const aliveInvaders = invadersRef.current.filter((inv) => inv.alive)
    if (aliveInvaders.length === 0) return

    // Multiple shooters based on wave
    const shooterCount = Math.min(1 + Math.floor(wave / 5), 3)
    for (let s = 0; s < shooterCount; s++) {
      const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)]
      enemyBulletsRef.current.push({
        x: shooter.x + INVADER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: shooter.y + INVADER_HEIGHT,
        active: true,
      })
    }
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

    // Draw shield indicator
    if (shieldActiveRef.current) {
      const player = playerRef.current
      ctx.strokeStyle = "#39ff78"
      ctx.lineWidth = 2
      ctx.shadowColor = "#39ff78"
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(
        (player.x + PLAYER_WIDTH / 2) * sx,
        (player.y + PLAYER_HEIGHT / 2) * sy,
        30 * Math.min(sx, sy),
        0,
        Math.PI * 2
      )
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // Draw player
    const weaponLevel = weaponLevelRef.current
    const playerColor = weaponLevel >= 10 ? "#ffaa00" : weaponLevel >= 5 ? "#00d4ff" : "#39ff78"
    ctx.shadowColor = playerColor
    ctx.shadowBlur = 15
    ctx.fillStyle = playerColor
    const player = playerRef.current
    // Ship body
    ctx.beginPath()
    ctx.moveTo((player.x + PLAYER_WIDTH / 2) * sx, player.y * sy)
    ctx.lineTo(player.x * sx, (player.y + PLAYER_HEIGHT) * sy)
    ctx.lineTo((player.x + PLAYER_WIDTH) * sx, (player.y + PLAYER_HEIGHT) * sy)
    ctx.closePath()
    ctx.fill()
    
    // Draw weapon level wings for high levels
    if (weaponLevel >= 3) {
      ctx.fillStyle = playerColor
      ctx.globalAlpha = 0.5
      const wingSize = Math.min(weaponLevel, 10) * 2
      ctx.fillRect((player.x - wingSize / 2) * sx, (player.y + 10) * sy, wingSize * sx, 5 * sy)
      ctx.fillRect((player.x + PLAYER_WIDTH - wingSize / 2) * sx, (player.y + 10) * sy, wingSize * sx, 5 * sy)
      ctx.globalAlpha = 1
    }
    ctx.shadowBlur = 0

    // Draw player bullets
    const stats = getWeaponStats()
    const bulletColor = stats.damage >= 5 ? "#ffaa00" : stats.damage >= 3 ? "#00d4ff" : "#39ff78"
    ctx.shadowColor = bulletColor
    ctx.shadowBlur = 8
    ctx.fillStyle = bulletColor
    bulletsRef.current.forEach((bullet) => {
      if (bullet.active) {
        const bulletW = BULLET_WIDTH + (bullet.damage || 1) - 1
        ctx.fillRect(bullet.x * sx, bullet.y * sy, bulletW * sx, BULLET_HEIGHT * sy)
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

    // Draw power-ups
    powerUpsRef.current.forEach((powerUp) => {
      if (!powerUp.active) return
      const config = POWERUP_CONFIGS[powerUp.type]
      ctx.shadowColor = config.color
      ctx.shadowBlur = 12
      ctx.fillStyle = config.color
      ctx.beginPath()
      ctx.arc(
        (powerUp.x + POWERUP_SIZE / 2) * sx,
        (powerUp.y + POWERUP_SIZE / 2) * sy,
        (POWERUP_SIZE / 2) * Math.min(sx, sy),
        0,
        Math.PI * 2
      )
      ctx.fill()
      
      // Draw icon
      ctx.fillStyle = "#0d0d24"
      ctx.font = `${10 * Math.min(sx, sy)}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const icons: Record<string, string> = { spread: "S", rapid: "R", power: "P", shield: "O", bomb: "B" }
      ctx.fillText(icons[powerUp.type], (powerUp.x + POWERUP_SIZE / 2) * sx, (powerUp.y + POWERUP_SIZE / 2) * sy)
      ctx.shadowBlur = 0
    })

    // Draw boss
    const boss = bossRef.current
    if (boss) {
      const bossIndex = Math.min(Math.floor((waveRef.current - 1) / 10), BOSS_CONFIGS.length - 1)
      const bossColor = BOSS_CONFIGS[bossIndex].color
      ctx.shadowColor = bossColor
      ctx.shadowBlur = 20
      ctx.fillStyle = bossColor

      // Boss body
      const bx = boss.x * sx
      const by = boss.y * sy
      const bw = boss.width * sx
      const bh = boss.height * sy

      ctx.beginPath()
      ctx.roundRect(bx + bw * 0.1, by + bh * 0.2, bw * 0.8, bh * 0.6, 8)
      ctx.fill()

      // Boss wings
      ctx.fillRect(bx, by + bh * 0.3, bw * 0.2, bh * 0.4)
      ctx.fillRect(bx + bw * 0.8, by + bh * 0.3, bw * 0.2, bh * 0.4)

      // Boss cockpit
      ctx.fillStyle = "#0d0d24"
      ctx.beginPath()
      ctx.arc(bx + bw * 0.5, by + bh * 0.5, bh * 0.2, 0, Math.PI * 2)
      ctx.fill()

      // Health bar
      ctx.shadowBlur = 0
      const healthPercent = boss.health / boss.maxHealth
      ctx.fillStyle = "#333"
      ctx.fillRect(bx, (boss.y - 15) * sy, bw, 8 * sy)
      ctx.fillStyle = healthPercent > 0.5 ? "#39ff78" : healthPercent > 0.25 ? "#ffaa00" : "#ff4757"
      ctx.fillRect(bx, (boss.y - 15) * sy, bw * healthPercent, 8 * sy)
      
      // Boss name
      ctx.fillStyle = "#fff"
      ctx.font = `bold ${10 * Math.min(sx, sy)}px monospace`
      ctx.textAlign = "center"
      ctx.fillText(
        `${BOSS_CONFIGS[bossIndex].name} - Wave ${waveRef.current}`,
        bx + bw / 2,
        (boss.y - 25) * sy
      )
    }

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
        ctx.beginPath()
        ctx.roundRect(ix + iw * 0.2, iy, iw * 0.6, ih * 0.6, 2)
        ctx.fill()
        ctx.fillRect(ix, iy + ih * 0.4, iw * 0.3, ih * 0.6)
        ctx.fillRect(ix + iw * 0.7, iy + ih * 0.4, iw * 0.3, ih * 0.6)
      } else if (invader.type === 1) {
        ctx.beginPath()
        ctx.roundRect(ix + iw * 0.1, iy + ih * 0.2, iw * 0.8, ih * 0.6, 2)
        ctx.fill()
        ctx.fillRect(ix, iy, iw * 0.25, ih * 0.5)
        ctx.fillRect(ix + iw * 0.75, iy, iw * 0.25, ih * 0.5)
        ctx.fillRect(ix + iw * 0.2, iy + ih * 0.7, iw * 0.2, ih * 0.3)
        ctx.fillRect(ix + iw * 0.6, iy + ih * 0.7, iw * 0.2, ih * 0.3)
      } else {
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
  }, [canvasSize, scaleX, scaleY, getWeaponStats])

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

    // Move power-ups
    powerUpsRef.current = powerUpsRef.current.filter((powerUp) => {
      if (!powerUp.active) return false
      powerUp.y += POWERUP_SPEED
      return powerUp.y < CANVAS_HEIGHT
    })

    // Check power-up collection
    powerUpsRef.current.forEach((powerUp) => {
      if (!powerUp.active) return
      if (
        powerUp.x < player.x + PLAYER_WIDTH &&
        powerUp.x + POWERUP_SIZE > player.x &&
        powerUp.y < player.y + PLAYER_HEIGHT &&
        powerUp.y + POWERUP_SIZE > player.y
      ) {
        powerUp.active = false
        collectPowerUp(powerUp)
      }
    })

    // Boss logic
    const boss = bossRef.current
    if (boss) {
      const now = Date.now()
      
      // Boss movement
      if (now - boss.lastMove > 50) {
        boss.lastMove = now
        boss.x += boss.direction * 2
        if (boss.x <= 0 || boss.x + boss.width >= CANVAS_WIDTH) {
          boss.direction *= -1
        }
      }

      // Boss shooting
      enemyShoot()

      // Boss phase changes
      const healthPercent = boss.health / boss.maxHealth
      boss.phase = healthPercent > 0.66 ? 0 : healthPercent > 0.33 ? 1 : 2

      // Check bullet collisions with boss
      for (const bullet of bulletsRef.current) {
        if (!bullet.active) continue
        if (
          bullet.x < boss.x + boss.width &&
          bullet.x + BULLET_WIDTH > boss.x &&
          bullet.y < boss.y + boss.height &&
          bullet.y + BULLET_HEIGHT > boss.y
        ) {
          bullet.active = false
          boss.health -= bullet.damage || 1
          scoreRef.current += 10
          onScoreChange(scoreRef.current)

          if (boss.health <= 0) {
            // Boss defeated
            const bossIndex = Math.min(Math.floor((waveRef.current - 1) / 10), BOSS_CONFIGS.length - 1)
            scoreRef.current += 500 * (bossIndex + 1)
            onScoreChange(scoreRef.current)
            bossRef.current = null

            // Next wave
            waveRef.current += 1
            onWaveChange(waveRef.current)
            invadersRef.current = createInvaders(waveRef.current)
            invaderDirectionRef.current = 1
            bulletsRef.current = []
            enemyBulletsRef.current = []
          }
        }
      }
    } else {
      // Normal invader logic
      const invaders = invadersRef.current
      const aliveInvaders = invaders.filter((inv) => inv.alive)

      if (aliveInvaders.length > 0) {
        let shouldDrop = false
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
          invaderSpeedRef.current += 0.1
        } else {
          for (const invader of invaders) {
            invader.x += invaderSpeedRef.current * invaderDirectionRef.current
          }
        }

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
            scoreRef.current += INVADER_POINTS[invader.type] * Math.ceil(waveRef.current / 5)
            onScoreChange(scoreRef.current)

            // Spawn power-up chance
            spawnPowerUp(invader.x, invader.y)

            // Speed up remaining invaders
            const remaining = invaders.filter((i) => i.alive).length
            if (remaining > 0) {
              invaderSpeedRef.current = INVADER_BASE_SPEED + (waveRef.current - 1) * 0.15 + (40 - remaining) * 0.02
            }
            break
          }
        }
      }

      // Check if all invaders destroyed
      if (aliveInvaders.length === 0) {
        waveRef.current += 1
        onWaveChange(waveRef.current)

        // Boss every 10 waves
        if (waveRef.current % 10 === 0) {
          bossRef.current = createBoss(waveRef.current)
          invadersRef.current = []
        } else {
          invadersRef.current = createInvaders(waveRef.current)
        }
        
        invaderDirectionRef.current = 1
        bulletsRef.current = []
        enemyBulletsRef.current = []
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

        if (shieldActiveRef.current) {
          shieldActiveRef.current = false
        } else {
          livesRef.current -= 1
          onLivesChange(livesRef.current)

          // Lose some weapon levels on death
          weaponLevelRef.current = Math.max(1, weaponLevelRef.current - 2)
          onWeaponLevelChange?.(weaponLevelRef.current)

          if (livesRef.current <= 0) {
            setGameState("gameover")
            setIsRunning(false)
            onGameOver(scoreRef.current)
            return
          }
        }
      }
    }

    draw()
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [isRunning, gameState, draw, shoot, enemyShoot, createInvaders, createBoss, spawnPowerUp, collectPowerUp, onScoreChange, onLivesChange, onWaveChange, onWeaponLevelChange, onGameOver, setIsRunning])

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

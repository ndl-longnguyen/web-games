"use client"

import { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { GameHeader } from "@/components/game-header"
import { Leaderboard } from "@/components/leaderboard"
import { usePlayer } from "@/components/player-provider"

const SpaceInvadersGame = dynamic(
  () =>
    import("@/components/space-invaders-game").then((mod) => ({
      default: mod.SpaceInvadersGame,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-primary/30 w-[400px] h-[500px]">
        <p className="font-mono text-xs text-muted-foreground animate-pulse">
          Loading game...
        </p>
      </div>
    ),
  }
)

export function SpaceInvadersGameClient() {
  const { player, isRegistered, setShowRegistration } = usePlayer()
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [wave, setWave] = useState(1)
  const [weaponLevel, setWeaponLevel] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore)
  }, [])

  const handleLivesChange = useCallback((newLives: number) => {
    setLives(newLives)
  }, [])

  const handleWaveChange = useCallback((newWave: number) => {
    setWave(newWave)
  }, [])

  const handleWeaponLevelChange = useCallback((newLevel: number) => {
    setWeaponLevel(newLevel)
  }, [])

  const handleGameOver = useCallback(
    async (finalScore: number) => {
      if (finalScore > highScore) {
        setHighScore(finalScore)
      }

      // Submit score to leaderboard
      if (player && finalScore > 0) {
        try {
          await fetch("/api/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              game: "space-invaders",
              map: "classic",
              name: player.name,
              age: player.age,
              score: finalScore,
            }),
          })
          setLeaderboardKey((k) => k + 1)
        } catch {
          // silently fail
        }
      }
    },
    [highScore, player]
  )

  const canStart = useCallback(() => {
    return isRegistered
  }, [isRegistered])

  const handleGameStart = useCallback(() => {
    if (!isRegistered) {
      setShowRegistration(true)
      return
    }
    setScore(0)
    setLives(3)
    setWave(1)
    setWeaponLevel(1)
  }, [isRegistered, setShowRegistration])

  // Get weapon level color and name
  const getWeaponInfo = () => {
    if (weaponLevel >= 15) return { color: "text-purple-400", name: "LEGENDARY" }
    if (weaponLevel >= 10) return { color: "text-yellow-400", name: "EPIC" }
    if (weaponLevel >= 5) return { color: "text-cyan-400", name: "RARE" }
    if (weaponLevel >= 3) return { color: "text-blue-400", name: "UNCOMMON" }
    return { color: "text-foreground/70", name: "BASIC" }
  }

  const weaponInfo = getWeaponInfo()

  return (
    <main className="min-h-dvh bg-background flex flex-col items-center px-4 py-4 sm:py-8 gap-4 sm:gap-6 relative">
      {/* Scan lines */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,120,0.3) 2px, rgba(57,255,120,0.3) 4px)",
        }}
      />

      {/* Back + Player badge */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <nav aria-label="Breadcrumb">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>BACK TO ARCADE</span>
          </Link>
        </nav>

        {/* Player badge */}
        {isRegistered && player ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[9px] text-primary truncate max-w-[80px] sm:max-w-[120px]">
                {player.name}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowRegistration(true)}
            className="font-mono text-[9px] text-muted-foreground hover:text-primary border border-border hover:border-primary/30 px-2.5 py-1 rounded-full transition-colors"
          >
            SIGN IN
          </button>
        )}
      </div>

      <GameHeader title="SPACE INVADERS" subtitle="Defend Earth" />

      {/* Stats */}
      <div className="flex items-center gap-3 md:gap-6 flex-wrap justify-center">
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Score
          </span>
          <span
            className="font-sans text-lg md:text-2xl text-primary tabular-nums"
            style={{
              textShadow: isRunning ? "0 0 20px rgba(57, 255, 120, 0.5)" : "none",
            }}
          >
            {score.toString().padStart(6, "0")}
          </span>
        </div>

        <div className="w-px h-10 bg-border" />

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Lives
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 ${i < lives ? "text-primary" : "text-muted-foreground/30"}`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L8 10H2L12 22L22 10H16L12 2Z" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className="w-px h-10 bg-border" />

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Wave
          </span>
          <span className="font-sans text-lg md:text-2xl text-foreground/70 tabular-nums">
            {wave}
          </span>
        </div>

        <div className="w-px h-10 bg-border" />

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Weapon
          </span>
          <div className="flex items-center gap-1">
            <span className={`font-sans text-lg md:text-2xl tabular-nums ${weaponInfo.color}`}>
              Lv.{weaponLevel}
            </span>
          </div>
        </div>

        <div className="w-px h-10 bg-border" />

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Best
          </span>
          <span className="font-sans text-lg md:text-2xl text-foreground/70 tabular-nums">
            {highScore.toString().padStart(6, "0")}
          </span>
        </div>
      </div>

      {/* Weapon tier indicator */}
      {isRunning && (
        <div className="flex items-center gap-2">
          <span className={`font-mono text-[9px] ${weaponInfo.color}`}>
            {weaponInfo.name}
          </span>
          {wave % 10 === 0 && wave > 0 && (
            <span className="font-mono text-[9px] text-destructive animate-pulse">
              BOSS BATTLE!
            </span>
          )}
        </div>
      )}

      <SpaceInvadersGame
        onScoreChange={handleScoreChange}
        onGameOver={handleGameOver}
        onGameStart={handleGameStart}
        onLivesChange={handleLivesChange}
        onWaveChange={handleWaveChange}
        onWeaponLevelChange={handleWeaponLevelChange}
        canStart={canStart}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
      />

      {/* Controls info */}
      <div className="hidden md:flex items-center gap-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Kbd>A</Kbd>
          <span className="font-mono text-xs">or</span>
          <Kbd>{"<"}</Kbd>
          <span className="font-mono text-xs ml-1">Left</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Kbd>D</Kbd>
          <span className="font-mono text-xs">or</span>
          <Kbd>{">"}</Kbd>
          <span className="font-mono text-xs ml-1">Right</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Kbd className="px-3">Space</Kbd>
          <span className="font-mono text-xs">Fire</span>
        </div>
      </div>

      {/* Power-up legend */}
      <div className="flex flex-wrap justify-center gap-3 text-muted-foreground max-w-md">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ffaa00]" />
          <span className="font-mono text-[8px]">Spread</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#00d4ff]" />
          <span className="font-mono text-[8px]">Rapid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff4757]" />
          <span className="font-mono text-[8px]">Power</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#39ff78]" />
          <span className="font-mono text-[8px]">Shield</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#c850c0]" />
          <span className="font-mono text-[8px]">Bomb</span>
        </div>
      </div>

      {/* Boss info */}
      <p className="font-mono text-[9px] text-muted-foreground/60 text-center">
        Boss appears every 10 waves | Collect power-ups to upgrade weapon
      </p>

      {/* Leaderboard */}
      <Leaderboard game="space-invaders" mapId="classic" refreshKey={leaderboardKey} />

      <footer className="font-mono text-[10px] text-muted-foreground/50 text-center mt-auto pt-4">
        <p>Built by NDL</p>
      </footer>
    </main>
  )
}

function Kbd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded border border-border bg-secondary text-foreground font-mono text-[10px] ${className}`}
    >
      {children}
    </kbd>
  )
}

"use client"

import { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { GameHeader } from "@/components/game-header"
import { Leaderboard } from "@/components/leaderboard"
import { usePlayer } from "@/components/player-provider"
import { LEVEL_CONFIGS } from "@/components/breakout-game"

const BreakoutGame = dynamic(
  () =>
    import("@/components/breakout-game").then((mod) => ({
      default: mod.BreakoutGame,
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

export function PongGameClient() {
  const { player, isRegistered, setShowRegistration } = usePlayer()
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(5)
  const [highScore, setHighScore] = useState(0)
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const [showLevelSelect, setShowLevelSelect] = useState(true)

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore)
    if (newScore > highScore) {
      setHighScore(newScore)
    }
  }, [highScore])

  const handleLivesChange = useCallback((newLives: number) => {
    setLives(newLives)
  }, [])

  const handleGameOver = useCallback(
    async (finalScore: number, level: number, won: boolean) => {
      setShowLevelSelect(true)
      setCurrentLevel(level)

      // Submit score to leaderboard
      if (player && finalScore > 0) {
        try {
          await fetch("/api/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              game: "pong",
              map: `level-${selectedLevel}`,
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
    [player, selectedLevel]
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
    setLives(5)
    setCurrentLevel(selectedLevel)
    setShowLevelSelect(false)
  }, [isRegistered, setShowRegistration, selectedLevel])

  const handleSelectLevel = (lvl: number) => {
    setSelectedLevel(lvl)
  }

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

      <GameHeader title="BREAKOUT" subtitle="Break the bricks!" />

      {/* Level selector */}
      {showLevelSelect && !isRunning && (
        <div className="w-full max-w-md">
          <p className="font-mono text-[9px] text-muted-foreground text-center mb-3">SELECT START LEVEL</p>
          <div className="grid grid-cols-5 gap-2">
            {LEVEL_CONFIGS.map((config, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectLevel(idx + 1)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  selectedLevel === idx + 1
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <span className="font-sans text-lg font-bold">{idx + 1}</span>
                <span className="font-mono text-[7px] truncate w-full text-center">{config.name}</span>
              </button>
            ))}
          </div>
          <p className="font-mono text-[9px] text-center mt-2 text-muted-foreground">
            {LEVEL_CONFIGS[selectedLevel - 1].description}
          </p>
        </div>
      )}

      {/* Score display */}
      <div className="flex items-center gap-6 md:gap-12">
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            SCORE
          </span>
          <span
            className="font-sans text-2xl md:text-4xl text-primary tabular-nums"
            style={{
              textShadow: isRunning ? "0 0 20px rgba(57, 255, 120, 0.5)" : "none",
            }}
          >
            {score}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            LIVES
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < lives ? "bg-destructive shadow-lg shadow-destructive/50" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            LEVEL
          </span>
          <span className="font-sans text-2xl md:text-4xl text-foreground tabular-nums">
            {isRunning ? currentLevel : selectedLevel}
          </span>
        </div>
      </div>

      {/* High score */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-muted-foreground">HIGH SCORE:</span>
        <span className="font-mono text-xs text-primary">{highScore}</span>
      </div>

      <BreakoutGame
        onScoreChange={handleScoreChange}
        onLivesChange={handleLivesChange}
        onGameOver={handleGameOver}
        onGameStart={handleGameStart}
        canStart={canStart}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        startLevel={selectedLevel}
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
          <Kbd>Space</Kbd>
          <span className="font-mono text-xs ml-1">Launch Ball</span>
        </div>
      </div>

      {/* Brick legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm bg-[#39ff78]" />
          <span className="font-mono text-[9px]">Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm bg-[#ffcc00]" />
          <span className="font-mono text-[9px]">Hard (2 hits)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm bg-[#ff6b6b]" />
          <span className="font-mono text-[9px]">Super (3 hits)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm bg-[#666688]" />
          <span className="font-mono text-[9px]">Steel</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm bg-[#ff00ff]" />
          <span className="font-mono text-[9px]">Explosive</span>
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard game="pong" mapId={`level-${selectedLevel}`} refreshKey={leaderboardKey} />

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

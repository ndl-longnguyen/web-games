"use client"

import { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { GameHeader } from "@/components/game-header"
import { Leaderboard } from "@/components/leaderboard"
import { usePlayer } from "@/components/player-provider"

const TetrisGame = dynamic(
  () =>
    import("@/components/tetris-game").then((mod) => ({
      default: mod.TetrisGame,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-primary/30 w-[200px] h-[400px]">
        <p className="font-mono text-xs text-muted-foreground animate-pulse">
          Loading game...
        </p>
      </div>
    ),
  }
)

export function TetrisGameClient() {
  const { player, isRegistered, setShowRegistration } = usePlayer()
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore)
  }, [])

  const handleLinesChange = useCallback((newLines: number) => {
    setLines(newLines)
  }, [])

  const handleLevelChange = useCallback((newLevel: number) => {
    setLevel(newLevel)
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
              game: "tetris",
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
    setLines(0)
    setLevel(1)
  }, [isRegistered, setShowRegistration])

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

      <GameHeader title="TETRIS" subtitle="Stack & Clear" />

      {/* Stats */}
      <div className="flex items-center gap-4 md:gap-8">
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
            Lines
          </span>
          <span className="font-sans text-lg md:text-2xl text-foreground/70 tabular-nums">
            {lines}
          </span>
        </div>

        <div className="w-px h-10 bg-border" />

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Level
          </span>
          <span className="font-sans text-lg md:text-2xl text-foreground/70 tabular-nums">
            {level}
          </span>
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

      <TetrisGame
        onScoreChange={handleScoreChange}
        onGameOver={handleGameOver}
        onGameStart={handleGameStart}
        onLinesChange={handleLinesChange}
        onLevelChange={handleLevelChange}
        canStart={canStart}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
      />

      {/* Controls info */}
      <div className="hidden md:flex items-center gap-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Kbd>{"<"}</Kbd>
          <Kbd>{">"}</Kbd>
          <span className="font-mono text-xs ml-1">Move</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Kbd>{"^"}</Kbd>
          <span className="font-mono text-xs ml-1">Rotate</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Kbd>v</Kbd>
          <span className="font-mono text-xs ml-1">Soft Drop</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Kbd className="px-3">Space</Kbd>
          <span className="font-mono text-xs">Hard Drop</span>
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard game="tetris" mapId="classic" refreshKey={leaderboardKey} />

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

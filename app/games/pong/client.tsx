"use client"

import { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { GameHeader } from "@/components/game-header"
import { Leaderboard } from "@/components/leaderboard"
import { usePlayer } from "@/components/player-provider"

const PongGame = dynamic(
  () =>
    import("@/components/pong-game").then((mod) => ({
      default: mod.PongGame,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-primary/30 w-[400px] h-[300px]">
        <p className="font-mono text-xs text-muted-foreground animate-pulse">
          Loading game...
        </p>
      </div>
    ),
  }
)

export function PongGameClient() {
  const { player, isRegistered, setShowRegistration } = usePlayer()
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [wins, setWins] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const handleScoreChange = useCallback((newPlayerScore: number, newAiScore: number) => {
    setPlayerScore(newPlayerScore)
    setAiScore(newAiScore)
  }, [])

  const handleGameOver = useCallback(
    async (finalPlayerScore: number) => {
      // Player wins if they reached win score
      const won = finalPlayerScore >= 11

      if (won) {
        setWins((w) => w + 1)
      }

      // Submit score to leaderboard (wins count as score)
      if (player && won) {
        try {
          await fetch("/api/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              game: "pong",
              map: "classic",
              name: player.name,
              age: player.age,
              score: 1, // Each win = 1 point
            }),
          })
          setLeaderboardKey((k) => k + 1)
        } catch {
          // silently fail
        }
      }
    },
    [player]
  )

  const canStart = useCallback(() => {
    return isRegistered
  }, [isRegistered])

  const handleGameStart = useCallback(() => {
    if (!isRegistered) {
      setShowRegistration(true)
      return
    }
    setPlayerScore(0)
    setAiScore(0)
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

      <GameHeader title="PONG" subtitle="You vs Machine" />

      {/* Score display */}
      <div className="flex items-center gap-8 md:gap-16">
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-primary uppercase tracking-wider">
            YOU
          </span>
          <span
            className="font-sans text-3xl md:text-5xl text-primary tabular-nums"
            style={{
              textShadow: isRunning ? "0 0 20px rgba(57, 255, 120, 0.5)" : "none",
            }}
          >
            {playerScore}
          </span>
        </div>

        <div className="font-mono text-2xl text-muted-foreground">:</div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-destructive uppercase tracking-wider">
            AI
          </span>
          <span
            className="font-sans text-3xl md:text-5xl text-destructive tabular-nums"
            style={{
              textShadow: isRunning ? "0 0 20px rgba(255, 71, 87, 0.5)" : "none",
            }}
          >
            {aiScore}
          </span>
        </div>
      </div>

      {/* Win counter */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-muted-foreground">WINS:</span>
        <span className="font-mono text-xs text-primary">{wins}</span>
      </div>

      <PongGame
        onScoreChange={handleScoreChange}
        onGameOver={handleGameOver}
        onGameStart={handleGameStart}
        canStart={canStart}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        winScore={11}
      />

      {/* Controls info */}
      <div className="hidden md:flex items-center gap-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Kbd>W</Kbd>
          <span className="font-mono text-xs">or</span>
          <Kbd>{"^"}</Kbd>
          <span className="font-mono text-xs ml-1">Up</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Kbd>S</Kbd>
          <span className="font-mono text-xs">or</span>
          <Kbd>v</Kbd>
          <span className="font-mono text-xs ml-1">Down</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-muted-foreground/60">First to 11 wins</span>
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard game="pong" mapId="classic" refreshKey={leaderboardKey} />

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

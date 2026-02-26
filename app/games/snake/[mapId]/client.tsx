"use client"

import { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import type { MapId, MapInfo } from "@/lib/game-data"
import { GameHeader } from "@/components/game-header"
import { Scoreboard } from "@/components/scoreboard"
import { ControlsInfo } from "@/components/controls-info"
import { Leaderboard } from "@/components/leaderboard"
import { usePlayer } from "@/components/player-provider"

const SnakeGame = dynamic(
  () =>
    import("@/components/snake-game").then((mod) => ({
      default: mod.SnakeGame,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-primary/30 w-full max-w-[400px] aspect-square">
        <p className="font-mono text-xs text-muted-foreground animate-pulse">
          Loading game...
        </p>
      </div>
    ),
  }
)

interface SnakeGameClientProps {
  mapId: MapId
  mapInfo: MapInfo
}

export function SnakeGameClient({ mapId, mapInfo }: SnakeGameClientProps) {
  const { player, isRegistered, setShowRegistration } = usePlayer()
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore)
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
              game: "snake",
              map: mapId,
              name: player.name,
              age: player.age,
              score: finalScore,
            }),
          })
          // Trigger leaderboard refresh
          setLeaderboardKey((k) => k + 1)
        } catch {
          // silently fail — don't disrupt game experience
        }
      }
    },
    [highScore, player, mapId]
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
            href="/games/snake"
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
            <span>BACK TO MAPS</span>
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

      <GameHeader title="SNAKE GAME" subtitle={mapInfo.name} />

      {/* Difficulty badge */}
      <span
        className="font-mono text-[9px] px-3 py-1 rounded border"
        style={{
          color: mapInfo.color,
          borderColor: `${mapInfo.color}40`,
        }}
      >
        {mapInfo.difficulty.toUpperCase()}
      </span>

      <Scoreboard score={score} highScore={highScore} isPlaying={isRunning} />

      <SnakeGame
        mapId={mapId}
        onScoreChange={handleScoreChange}
        onGameOver={handleGameOver}
        onGameStart={handleGameStart}
        canStart={canStart}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
      />

      <ControlsInfo />

      {/* Leaderboard */}
      <Leaderboard game="snake" mapId={mapId} refreshKey={leaderboardKey} />

      <footer className="font-mono text-[10px] text-muted-foreground/50 text-center mt-auto pt-4">
        <p>Built by NDL</p>
      </footer>
    </main>
  )
}

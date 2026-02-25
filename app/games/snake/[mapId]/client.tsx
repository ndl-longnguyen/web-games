"use client"

import { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import type { MapId, MapInfo } from "@/lib/game-data"
import { GameHeader } from "@/components/game-header"
import { Scoreboard } from "@/components/scoreboard"
import { ControlsInfo } from "@/components/controls-info"

const SnakeGame = dynamic(
  () => import("@/components/snake-game").then((mod) => ({ default: mod.SnakeGame })),
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
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore)
  }, [])

  const handleGameOver = useCallback(
    (finalScore: number) => {
      if (finalScore > highScore) {
        setHighScore(finalScore)
      }
    },
    [highScore]
  )

  const handleGameStart = useCallback(() => {
    setScore(0)
  }, [])

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

      {/* Back to maps */}
      <nav className="w-full max-w-lg" aria-label="Breadcrumb">
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
        isRunning={isRunning}
        setIsRunning={setIsRunning}
      />

      <ControlsInfo />

      <footer className="font-mono text-[10px] text-muted-foreground/50 text-center mt-auto pt-4">
        <p>Built by NDL</p>
      </footer>
    </main>
  )
}

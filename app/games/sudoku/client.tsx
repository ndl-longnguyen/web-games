"use client"

import { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { GameHeader } from "@/components/game-header"
import { Leaderboard } from "@/components/leaderboard"
import { usePlayer } from "@/components/player-provider"
import { SUDOKU_LEVEL_CONFIGS } from "@/components/sudoku-game"

const SudokuGame = dynamic(
  () =>
    import("@/components/sudoku-game").then((mod) => ({
      default: mod.SudokuGame,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-primary/30" style={{ width: 'min(360px, 90vw)', height: 'min(360px, 90vw)' }}>
        <p className="font-mono text-xs text-muted-foreground animate-pulse">
          Loading game...
        </p>
      </div>
    ),
  }
)

export function SudokuGameClient() {
  const { player, isRegistered, setShowRegistration } = usePlayer()
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [time, setTime] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [startingLevel, setStartingLevel] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const [showLevelSelect, setShowLevelSelect] = useState(true)

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore)
  }, [])

  const handleTimeChange = useCallback((newTime: number) => {
    setTime(newTime)
  }, [])

  const handleMistakesChange = useCallback((newMistakes: number) => {
    setMistakes(newMistakes)
  }, [])

  const handleGameOver = useCallback(
    async (finalScore: number, finalTime: number, won: boolean) => {
      if (finalScore > highScore) {
        setHighScore(finalScore)
      }
      setShowLevelSelect(true)

      // Submit score to leaderboard
      if (player && finalScore > 0 && won) {
        try {
          await fetch("/api/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              game: "sudoku",
              map: `level-${startingLevel}`,
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
    [highScore, player, startingLevel]
  )

  const canStart = useCallback(() => {
    return isRegistered
  }, [isRegistered])

  const handleGameStart = useCallback(() => {
    // Show registration prompt if not registered, but don't block game start
    if (!isRegistered) {
      setShowRegistration(true)
    }
    setScore(0)
    setTime(0)
    setMistakes(0)
    setShowLevelSelect(false)
  }, [isRegistered, setShowRegistration])

  const handleSelectLevel = (lvl: number) => {
    setStartingLevel(lvl)
  }

  // Format time
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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

      <GameHeader title="SUDOKU" subtitle="Logic Puzzle" />

      {/* Level selector */}
      {showLevelSelect && !isRunning && (
        <div className="w-full max-w-md">
          <p className="font-mono text-[9px] text-muted-foreground text-center mb-3">SELECT DIFFICULTY</p>
          <div className="grid grid-cols-5 gap-2">
            {SUDOKU_LEVEL_CONFIGS.map((config, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectLevel(idx + 1)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  startingLevel === idx + 1
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <span className="font-sans text-lg font-bold">{idx + 1}</span>
                <span className="font-mono text-[8px] truncate w-full text-center">{config.name}</span>
              </button>
            ))}
          </div>
          <p className="font-mono text-[9px] text-center mt-2 text-muted-foreground">
            {SUDOKU_LEVEL_CONFIGS[startingLevel - 1].description}
          </p>
        </div>
      )}

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
            {score.toString().padStart(5, "0")}
          </span>
        </div>

        <div className="w-px h-10 bg-border" />

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Time
          </span>
          <span className="font-sans text-lg md:text-2xl text-foreground/70 tabular-nums">
            {formatTime(time)}
          </span>
        </div>

        <div className="w-px h-10 bg-border" />

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Level
          </span>
          <span className="font-sans text-lg md:text-2xl text-foreground/70 tabular-nums">
            {startingLevel}
          </span>
        </div>

        <div className="w-px h-10 bg-border" />

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            Best
          </span>
          <span className="font-sans text-lg md:text-2xl text-foreground/70 tabular-nums">
            {highScore.toString().padStart(5, "0")}
          </span>
        </div>
      </div>

      <SudokuGame
        onScoreChange={handleScoreChange}
        onGameOver={handleGameOver}
        onGameStart={handleGameStart}
        onTimeChange={handleTimeChange}
        onMistakesChange={handleMistakesChange}
        canStart={canStart}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        startingLevel={startingLevel}
      />

      {/* Controls info */}
      <div className="hidden md:flex items-center gap-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Kbd>1-9</Kbd>
          <span className="font-mono text-xs ml-1">Place Number</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Kbd>N</Kbd>
          <span className="font-mono text-xs ml-1">Toggle Notes</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Kbd>H</Kbd>
          <span className="font-mono text-xs ml-1">Hint</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Kbd>Del</Kbd>
          <span className="font-mono text-xs">Clear</span>
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard game="sudoku" mapId={`level-${startingLevel}`} refreshKey={leaderboardKey} />

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

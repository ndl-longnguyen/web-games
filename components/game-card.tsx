"use client"

import { memo, useCallback, useRef } from "react"
import Link from "next/link"
import type { GameInfo } from "@/lib/game-data"

const GAME_ICONS: Record<string, React.ReactNode> = {
  snake: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="4" y="20" width="8" height="8" rx="1" fill="currentColor" opacity="1" />
      <rect x="12" y="20" width="8" height="8" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="20" y="20" width="8" height="8" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="20" y="12" width="8" height="8" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="28" y="12" width="8" height="8" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="36" y="12" width="8" height="8" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="36" y="20" width="8" height="8" rx="1" fill="currentColor" opacity="0.4" />
      <circle cx="40" cy="35" r="4" fill="#ff4757" />
    </svg>
  ),
  tetris: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="12" y="8" width="8" height="8" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="12" y="16" width="8" height="8" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="20" y="16" width="8" height="8" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="20" y="24" width="8" height="8" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="8" y="32" width="32" height="8" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  pong: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="14" width="4" height="20" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="38" y="14" width="4" height="20" rx="2" fill="currentColor" opacity="0.6" />
      <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.6" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
    </svg>
  ),
  "space-invaders": (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="16" y="8" width="4" height="4" fill="currentColor" opacity="0.6" />
      <rect x="28" y="8" width="4" height="4" fill="currentColor" opacity="0.6" />
      <rect x="12" y="12" width="24" height="4" fill="currentColor" opacity="0.6" />
      <rect x="8" y="16" width="32" height="4" fill="currentColor" opacity="0.6" />
      <rect x="8" y="20" width="8" height="4" fill="currentColor" opacity="0.6" />
      <rect x="20" y="20" width="8" height="4" fill="currentColor" opacity="0.6" />
      <rect x="32" y="20" width="8" height="4" fill="currentColor" opacity="0.6" />
      <rect x="12" y="24" width="4" height="4" fill="currentColor" opacity="0.6" />
      <rect x="20" y="24" width="4" height="4" fill="currentColor" opacity="0.6" />
      <rect x="32" y="24" width="4" height="4" fill="currentColor" opacity="0.6" />
      <rect x="20" y="36" width="8" height="4" rx="1" fill="currentColor" opacity="0.4" />
    </svg>
  ),
}

export const GameCard = memo(function GameCard({ game }: { game: GameInfo }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const onEnter = useCallback(() => {
    if (cardRef.current && game.available) {
      cardRef.current.style.boxShadow =
        "0 0 25px rgba(57, 255, 120, 0.15), inset 0 0 25px rgba(57, 255, 120, 0.03)"
    }
  }, [game.available])

  const onLeave = useCallback(() => {
    if (cardRef.current && game.available) {
      cardRef.current.style.boxShadow = "0 0 0px rgba(57, 255, 120, 0)"
    }
  }, [game.available])

  const icon = GAME_ICONS[game.id]

  const card = (
    <div
      ref={cardRef}
      className={`group relative flex flex-col items-center gap-4 rounded-xl border-2 p-6 transition-all ${
        game.available
          ? "border-primary/20 bg-card hover:border-primary/60 hover:bg-card/80 cursor-pointer"
          : "border-border/30 bg-card/50 cursor-not-allowed opacity-60"
      }`}
      style={
        game.available
          ? {
              boxShadow: "0 0 0px rgba(57, 255, 120, 0)",
              transition:
                "box-shadow 0.3s, border-color 0.3s, background-color 0.3s",
            }
          : undefined
      }
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      role={game.available ? undefined : "presentation"}
      aria-disabled={!game.available}
    >
      {!game.available && (
        <span className="absolute top-3 right-3 font-mono text-[9px] text-muted-foreground bg-secondary px-2 py-1 rounded">
          COMING SOON
        </span>
      )}

      <div
        className={`text-primary ${!game.available ? "text-muted-foreground" : ""}`}
      >
        {icon}
      </div>

      <div className="text-center">
        <h3 className="font-sans text-sm text-foreground mb-2">{game.name}</h3>
        <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
          {game.description}
        </p>
      </div>

      {game.available && (
        <span className="font-sans text-[10px] text-primary group-hover:tracking-widest transition-all">
          PLAY
        </span>
      )}
    </div>
  )

  if (game.available) {
    return (
      <Link href={game.href} aria-label={`Play ${game.name}`}>
        {card}
      </Link>
    )
  }

  return card
})

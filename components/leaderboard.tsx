"use client"

import useSWR from "swr"
import { usePlayer } from "./player-provider"
import type { PlayerScore } from "@/lib/leaderboard"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface LeaderboardProps {
  game: string
  mapId: string
  /** SWR refresh key — change to trigger refetch */
  refreshKey?: number
}

export function Leaderboard({ game, mapId, refreshKey }: LeaderboardProps) {
  const { player } = usePlayer()

  const { data, isLoading } = useSWR<{ leaderboard: PlayerScore[] }>(
    `/api/scores?game=${game}&map=${mapId}&r=${refreshKey ?? 0}`,
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: true }
  )

  const leaderboard = data?.leaderboard ?? []

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-xl border border-primary/20 bg-card overflow-hidden"
        style={{
          boxShadow: "0 0 25px rgba(57, 255, 120, 0.06)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="font-sans text-[10px] sm:text-xs text-primary tracking-wider">
            LEADERBOARD
          </h3>
          <span className="font-mono text-[9px] text-muted-foreground">
            TOP 10
          </span>
        </div>

        {/* Table */}
        <div className="divide-y divide-border/30">
          {/* Column headers */}
          <div className="grid grid-cols-[2rem_1fr_4rem_3.5rem] px-4 py-2 font-mono text-[8px] text-muted-foreground uppercase tracking-wider">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">Best</span>
            <span className="text-right">Games</span>
          </div>

          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <p className="font-mono text-[10px] text-muted-foreground animate-pulse">
                Loading...
              </p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-mono text-[10px] text-muted-foreground">
                No scores yet. Be the first!
              </p>
            </div>
          ) : (
            leaderboard.map((entry, i) => {
              const isCurrentPlayer =
                player?.name?.toLowerCase() === entry.name.toLowerCase()
              const rank = i + 1

              return (
                <div
                  key={entry.name}
                  className={`grid grid-cols-[2rem_1fr_4rem_3.5rem] px-4 py-2.5 items-center transition-colors ${
                    isCurrentPlayer
                      ? "bg-primary/10 border-l-2 border-l-primary"
                      : ""
                  }`}
                >
                  {/* Rank */}
                  <span
                    className={`font-mono text-[10px] ${
                      rank === 1
                        ? "text-yellow-400"
                        : rank === 2
                        ? "text-gray-300"
                        : rank === 3
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {rank <= 3 ? (
                      <span className="text-xs">
                        {rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"}
                      </span>
                    ) : (
                      rank
                    )}
                  </span>

                  {/* Name */}
                  <span
                    className={`font-mono text-[10px] sm:text-xs truncate pr-2 ${
                      isCurrentPlayer ? "text-primary font-bold" : "text-foreground"
                    }`}
                  >
                    {entry.name}
                    {isCurrentPlayer && (
                      <span className="text-[8px] text-primary/70 ml-1">
                        (you)
                      </span>
                    )}
                  </span>

                  {/* Best Score */}
                  <span
                    className={`font-mono text-[10px] sm:text-xs text-right tabular-nums ${
                      rank === 1 ? "text-yellow-400" : "text-foreground/80"
                    }`}
                  >
                    {entry.bestScore.toLocaleString()}
                  </span>

                  {/* Games Played */}
                  <span className="font-mono text-[10px] text-right text-muted-foreground tabular-nums">
                    {entry.gamesPlayed}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

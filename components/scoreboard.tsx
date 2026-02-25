"use client"

interface ScoreboardProps {
  score: number
  highScore: number
  isPlaying: boolean
}

export function Scoreboard({ score, highScore, isPlaying }: ScoreboardProps) {
  return (
    <div className="flex items-center gap-6 md:gap-10">
      {/* Current Score */}
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          Score
        </span>
        <span
          className="font-sans text-2xl md:text-3xl text-primary tabular-nums"
          style={{
            textShadow: isPlaying ? "0 0 20px rgba(57, 255, 120, 0.5)" : "none",
          }}
        >
          {score.toString().padStart(4, "0")}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-12 bg-border" />

      {/* High Score */}
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          Best
        </span>
        <span className="font-sans text-2xl md:text-3xl text-foreground/70 tabular-nums">
          {highScore.toString().padStart(4, "0")}
        </span>
      </div>
    </div>
  )
}

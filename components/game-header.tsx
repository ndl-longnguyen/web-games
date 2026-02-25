"use client"

interface GameHeaderProps {
  title: string
  subtitle?: string
}

export function GameHeader({ title, subtitle }: GameHeaderProps) {
  return (
    <header className="text-center">
      <h1
        className="font-sans text-2xl md:text-4xl text-primary tracking-wider"
        style={{
          textShadow:
            "0 0 30px rgba(57, 255, 120, 0.4), 0 0 60px rgba(57, 255, 120, 0.15)",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="font-mono text-xs text-muted-foreground mt-2">
          {`// ${subtitle}`}
        </p>
      )}
    </header>
  )
}

import type { Metadata } from "next"
import { GAMES } from "@/lib/game-data"
import { GameCard } from "@/components/game-card"
import { JsonLd } from "@/components/json-ld"

export const metadata: Metadata = {
  title: "NDL Arcade - Classic Retro Games Collection | Free Online",
  description:
    "A collection of free online retro arcade games. Play Snake with 5 unique maps, and stay tuned for Tetris, Pong, and Space Invaders. Chơi game arcade cổ điển: Rắn săn mồi và nhiều trò chơi hấp dẫn khác.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NDL Arcade - Free Online Retro Games Collection",
    description:
      "Play classic arcade games online for free. Snake, Tetris, Pong, and more. Chơi game rắn săn mồi và game arcade cổ điển trực tuyến miễn phí.",
    url: "/",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "NDL Arcade",
  description:
    "Free online arcade game collection including Snake, Tetris, Pong, and classic retro games.",
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "NDL",
  },
  inLanguage: ["en", "vi"],
}

export default function DashboardPage() {
  return (
    <main className="min-h-dvh bg-background flex flex-col items-center px-4 py-8 sm:py-12 gap-8 sm:gap-10 relative">
      <JsonLd data={jsonLd} />

      {/* Scan lines overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,120,0.3) 2px, rgba(57,255,120,0.3) 4px)",
        }}
      />

      {/* Header */}
      <header className="text-center px-2">
        <h1
          className="font-sans text-xl sm:text-3xl md:text-5xl text-primary tracking-wider text-balance"
          style={{
            textShadow:
              "0 0 30px rgba(57, 255, 120, 0.4), 0 0 60px rgba(57, 255, 120, 0.15)",
          }}
        >
          NDL ARCADE
        </h1>
        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-3">
          {"// choose a game to play"}
        </p>
      </header>

      {/* Game Grid */}
      <section className="w-full max-w-3xl" aria-label="Available games">
        <h2 className="sr-only">Game Selection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="font-mono text-[10px] text-muted-foreground/50 text-center mt-auto pt-8">
        <p>Built by NDL</p>
      </footer>
    </main>
  )
}

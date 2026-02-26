import type { Metadata } from "next"
import Link from "next/link"
import { SNAKE_MAPS } from "@/lib/game-data"
import { MapCard } from "@/components/map-card"
import { JsonLd } from "@/components/json-ld"

export const metadata: Metadata = {
  title: "Snake Game Online - 5 Unique Levels & Maps | NDL Arcade",
  description:
    "Play Snake online with 5 unique maps: Classic, Portal Walls, Maze Runner, The Gauntlet, and Random Chaos. Free retro arcade experience. Chơi game rắn săn mồi online với nhiều bản đồ đa dạng.",
  keywords: [
    "snake game online",
    "play snake free",
    "snake game levels",
    "snake game portal walls",
    "snake maze challenge",
    "game rắn săn mồi online",
    "rắn săn mồi xuyên tường",
    "thử thách rắn săn mồi",
  ],
  alternates: {
    canonical: "/games/snake",
  },
  openGraph: {
    title: "Snake Game Online - Play with 5 Unique Maps",
    description:
      "Challenge yourself with 5 unique Snake maps. Classic, Portal, Maze, and more. Chơi game rắn săn mồi miễn phí với nhiều cấp độ hấp dẫn.",
    url: "/games/snake",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Snake Game - NDL Arcade",
  description:
    "Classic snake game with 5 unique maps including portal walls, maze, gauntlet corridors, and random chaos obstacles.",
  genre: ["Arcade", "Puzzle"],
  gamePlatform: "Web Browser",
  applicationCategory: "Game",
  numberOfPlayers: {
    "@type": "QuantitativeValue",
    value: 1,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  author: {
    "@type": "Person",
    name: "NDL",
  },
  inLanguage: ["en", "vi"],
}

export default function SnakeMapSelectPage() {
  return (
    <main className="min-h-dvh bg-background flex flex-col items-center px-4 py-8 sm:py-12 gap-8 sm:gap-10 relative">
      <JsonLd data={jsonLd} />

      {/* Scan lines */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,120,0.3) 2px, rgba(57,255,120,0.3) 4px)",
        }}
      />

      {/* Back Button */}
      <nav className="w-full max-w-4xl" aria-label="Breadcrumb">
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

      {/* Header */}
      <header className="text-center px-2">
        <h1
          className="font-sans text-lg sm:text-2xl md:text-4xl text-primary tracking-wider text-balance"
          style={{
            textShadow:
              "0 0 30px rgba(57, 255, 120, 0.4), 0 0 60px rgba(57, 255, 120, 0.15)",
          }}
        >
          SNAKE GAME
        </h1>
        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-3">
          {"// select a map"}
        </p>
      </header>

      {/* Map Grid */}
      <section className="w-full max-w-4xl" aria-label="Snake game maps">
        <h2 className="sr-only">Available Maps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SNAKE_MAPS.map((map) => (
            <MapCard key={map.id} map={map} />
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

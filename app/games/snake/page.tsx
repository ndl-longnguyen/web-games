import type { Metadata } from "next"
import Link from "next/link"
import { SNAKE_MAPS } from "@/lib/game-data"
import { MapCard } from "@/components/map-card"
import { JsonLd } from "@/components/json-ld"

export const metadata: Metadata = {
  title: "Snake Game - Choose Your Map",
  description:
    "Play Snake with 5 unique maps: Classic, Portal Walls, Maze Runner, The Gauntlet, and Random Chaos. Free online snake game. Choi game ran san moi voi nhieu ban do khac nhau.",
  keywords: [
    "snake game maps",
    "snake game portal walls",
    "snake maze game",
    "snake obstacle game",
    "game ran san moi ban do",
    "game ran xuyen tuong",
    "game ran chuong ngai vat",
    "game ran me cung",
  ],
  alternates: {
    canonical: "/games/snake",
  },
  openGraph: {
    title: "Snake Game - 5 Unique Maps to Play",
    description:
      "Classic, Portal Walls, Maze Runner, The Gauntlet, Random Chaos. Pick your challenge! Chon ban do va choi game ran san moi mien phi.",
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
    <main className="min-h-screen bg-background flex flex-col items-center px-4 py-12 gap-10 relative">
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
      <header className="text-center">
        <h1
          className="font-sans text-2xl md:text-4xl text-primary tracking-wider"
          style={{
            textShadow:
              "0 0 30px rgba(57, 255, 120, 0.4), 0 0 60px rgba(57, 255, 120, 0.15)",
          }}
        >
          SNAKE GAME
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-3">
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

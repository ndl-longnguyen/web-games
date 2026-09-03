import type { Metadata } from "next"
import Image from "next/image"
import { GAMES } from "@/lib/game-data"
import { GameCard } from "@/components/game-card"
import { JsonLd } from "@/components/json-ld"

export const metadata: Metadata = {
  title: "NDL Arcade - Play Free Online Arcade Games | Snake, Tetris, Breakout, Space Invaders",
  description:
    "Play free online arcade games instantly. Snake game with 5 unique maps, Tetris with 10 difficulty levels, Breakout brick breaker, and Space Invaders with boss battles. No download required, works on all devices. Choi game online mien phi: Ran san moi, Tetris, Breakout, Space Invaders.",
  keywords: [
    'free online games',
    'arcade games free',
    'play games online',
    'snake game online',
    'tetris free',
    'breakout brick breaker',
    'space invaders game',
    'retro games',
    'browser games',
    'game online mien phi',
  ],
  alternates: {
    canonical: "https://game-online-free.vercel.app",
  },
  openGraph: {
    title: "NDL Arcade - Play Free Online Arcade Games",
    description:
      "Play Snake, Tetris, Breakout & Space Invaders free online. Classic arcade games, no download needed. Choi game arcade co dien mien phi.",
    url: "https://game-online-free.vercel.app",
    type: "website",
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'NDL Arcade - Free Online Arcade Games Collection',
      },
    ],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://game-online-free.vercel.app/#website",
  name: "NDL Arcade",
  url: "https://game-online-free.vercel.app",
  description: "Free online arcade games: Snake, Tetris, Breakout, Space Invaders. Play classic retro games instantly in your browser.",
  inLanguage: ["en-US", "vi-VN"],
  potentialAction: {
    "@type": "SearchAction",
    target: "https://game-online-free.vercel.app/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  publisher: {
    "@type": "Organization",
    "@id": "https://game-online-free.vercel.app/#organization",
    name: "NDL Arcade",
    url: "https://game-online-free.vercel.app"
  }
}

const gameCollectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "VideoGame",
        name: "Snake Game",
        description: "Classic Snake game with 5 unique maps: Classic, Portal, Maze, Gauntlet, Chaos",
        url: "https://game-online-free.vercel.app/games/snake",
        genre: ["Arcade", "Puzzle"],
        gamePlatform: "Web Browser",
        applicationCategory: "Game",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      }
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "VideoGame",
        name: "Tetris",
        description: "Classic Tetris puzzle game with 10 difficulty levels",
        url: "https://game-online-free.vercel.app/games/tetris",
        genre: ["Puzzle", "Arcade"],
        gamePlatform: "Web Browser",
        applicationCategory: "Game",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      }
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "VideoGame",
        name: "Breakout",
        description: "Brick breaker game with 10 unique levels and pipe patterns",
        url: "https://game-online-free.vercel.app/games/pong",
        genre: ["Arcade", "Action"],
        gamePlatform: "Web Browser",
        applicationCategory: "Game",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      }
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "VideoGame",
        name: "Space Invaders",
        description: "Classic alien shooter with power-ups, unlimited waves, and boss battles",
        url: "https://game-online-free.vercel.app/games/space-invaders",
        genre: ["Arcade", "Shooter"],
        gamePlatform: "Web Browser",
        applicationCategory: "Game",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      }
    }
  ]
}

export default function DashboardPage() {
  return (
    <main className="min-h-dvh bg-background flex flex-col items-center px-4 py-8 sm:py-12 gap-8 sm:gap-10 relative">
      <JsonLd data={jsonLd} />
      <JsonLd data={gameCollectionJsonLd} />

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
      <header className="text-center px-2 flex flex-col items-center">
        <div className="relative mb-5 group">
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-400/35 to-amber-600/25 blur-lg opacity-80 group-hover:opacity-100 transition-all duration-500" />
          <div className="relative rounded-full p-1 border border-amber-500/40 shadow-2xl bg-black/60 backdrop-blur-sm">
            <Image
              src="/logo.png"
              alt="NDL Arcade Logo"
              width={96}
              height={96}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-inner transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>
        </div>
        <h1
          className="font-sans text-xl sm:text-3xl md:text-5xl text-primary tracking-wider text-balance"
          style={{
            textShadow:
              "0 0 30px rgba(57, 255, 120, 0.4), 0 0 60px rgba(57, 255, 120, 0.15)",
          }}
        >
          NDL ARCADE
        </h1>
        <p className="font-mono text-xs sm:text-sm text-muted-foreground mt-3 max-w-lg mx-auto">
          Free Online Arcade Games - Play Snake, Tetris, Breakout & Space Invaders
        </p>
        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground/70 mt-2">
          {"// choose a game to play"}
        </p>
      </header>

      {/* Game Grid */}
      <section className="w-full max-w-3xl" aria-label="Free online arcade games collection">
        <h2 className="font-mono text-xs text-muted-foreground mb-4 text-center uppercase tracking-wider">
          Choose Your Game
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="font-mono text-[10px] text-muted-foreground/50 text-center mt-auto pt-8 flex items-center justify-center gap-2">
        <Image
          src="/logo.png"
          alt="NDL Logo"
          width={16}
          height={16}
          className="w-4 h-4 rounded-full opacity-70"
        />
        <p>Built by NDL</p>
      </footer>
    </main>
  )
}

import { SITE_URL, MAIN_SITE_URL } from "@/lib/config/site"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
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
    canonical: SITE_URL,
  },
  openGraph: {
    title: "NDL Arcade - Play Free Online Arcade Games",
    description:
      "Play Snake, Tetris, Breakout & Space Invaders free online. Classic arcade games, no download needed. Choi game arcade co dien mien phi.",
    url: SITE_URL,
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
  "@id": `${SITE_URL}/#website`,
  name: "NDL Arcade",
  url: SITE_URL,
  description: "Free online arcade games: Snake, Tetris, Breakout, Space Invaders. Play classic retro games instantly in your browser.",
  inLanguage: ["en-US", "vi-VN"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  },
  publisher: {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "NDL Arcade",
    url: SITE_URL
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
        url: `${SITE_URL}/games/snake`,
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
        url: `${SITE_URL}/games/tetris`,
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
        url: `${SITE_URL}/games/pong`,
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
        url: `${SITE_URL}/games/space-invaders`,
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

      {/* Informational & SEO Content Section for Compliance */}
      <section className="w-full max-w-3xl mt-12 pt-10 border-t border-border/40 font-mono text-xs text-muted-foreground space-y-8">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-primary uppercase tracking-wider mb-3">
            About NDL Arcade
          </h2>
          <p className="leading-relaxed text-foreground/80">
            NDL Arcade is a curated collection of classic retro browser games engineered with modern HTML5 Canvas, Web Audio, and responsive touch controls. All games run 100% in your web browser with zero installation, zero downloads, and zero plugins required. Whether you are reliving the golden era of 8-bit gaming or challenging global players on real-time leaderboards, NDL Arcade provides an instant, lightweight gaming experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg border border-border/40 bg-card/30 space-y-2">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wide text-primary">
              Classic Retro Lineup
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed text-foreground/75">
              <li><strong>Snake Game:</strong> 5 distinct maps including Portal, Maze, Gauntlet, and Chaos.</li>
              <li><strong>Tetris:</strong> 10 difficulty levels with instant hard drop and hold queue.</li>
              <li><strong>Breakout:</strong> 10 challenging brick patterns and paddle power-ups.</li>
              <li><strong>Space Invaders:</strong> Unlimited waves, mystery UFOs, and boss battles.</li>
              <li><strong>Sudoku:</strong> Logic puzzle generation with multiple difficulty presets.</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border/40 bg-card/30 space-y-2">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wide text-primary">
              Universal Controls
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed text-foreground/75">
              <li><strong>Desktop / Keyboard:</strong> Arrow Keys or WASD for direction, Spacebar for action / drop, Esc or P for pause.</li>
              <li><strong>Mobile / Tablet:</strong> Intuitive on-screen D-pad and swipe gestures.</li>
              <li><strong>Audio:</strong> Toggle chiptune sound effects and retro background audio anytime.</li>
              <li><strong>Leaderboard:</strong> Instant score submission with global rankings.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border/40 bg-card/20 space-y-2">
          <h3 className="font-bold text-foreground text-xs uppercase tracking-wide text-primary">
            Frequently Asked Questions (FAQ)
          </h3>
          <div className="space-y-2 text-[11px] leading-relaxed text-foreground/75">
            <p><strong>Q: Are all games free to play?</strong><br />Yes, every game on NDL Arcade is completely free with no subscriptions or paywalls.</p>
            <p><strong>Q: Can I play on mobile devices?</strong><br />Yes, all arcade games are optimized for responsive touch displays on iOS and Android smartphones.</p>
            <p><strong>Q: How does score saving work?</strong><br />Your high scores are recorded locally on your device and submitted to the global hall of fame if connected online.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-3xl font-mono text-xs text-muted-foreground/70 text-center mt-auto pt-10 pb-6 border-t border-border/30 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <Link href={MAIN_SITE_URL} className="hover:text-primary transition-colors underline-offset-4 hover:underline">
            NDL Home
          </Link>
          <span>•</span>
          <Link href={`${MAIN_SITE_URL}/blog`} className="hover:text-primary transition-colors underline-offset-4 hover:underline">
            Engineering Blog
          </Link>
          <span>•</span>
          <Link href={`${MAIN_SITE_URL}/privacy-policy`} className="hover:text-primary transition-colors underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href={`${MAIN_SITE_URL}/terms`} className="hover:text-primary transition-colors underline-offset-4 hover:underline">
            Terms of Service
          </Link>
        </div>
        <p className="text-[10px] text-muted-foreground/50">
          © {new Date().getFullYear()} NDL Arcade — Part of the <a href={MAIN_SITE_URL} className="text-primary hover:underline">{MAIN_SITE_URL.replace("https://", "")}</a> ecosystem.
        </p>
      </footer>
    </main>
  )
}

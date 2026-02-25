import type { Metadata } from "next"
import { GAMES } from "@/lib/game-data"
import { GameCard } from "@/components/game-card"
import { JsonLd } from "@/components/json-ld"

export const metadata: Metadata = {
  title: "NDL Arcade - Free Online Retro Games | Snake, Tetris & More",
  description:
    "Play free retro arcade games online. Choose from Snake with 5 unique maps, and more classic games coming soon. Choi game arcade co dien mien phi, game ran san moi online.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NDL Arcade - Free Online Retro Games",
    description:
      "Play free retro arcade games online. Snake game with 5 unique maps. Choi game ran san moi, game arcade co dien truc tuyen.",
    url: "/",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "NDL Arcade",
  description:
    "Free online retro arcade game collection. Play Snake and more classic games in your browser.",
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
    <main className="min-h-screen bg-background flex flex-col items-center px-4 py-12 gap-10 relative">
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
      <header className="text-center">
        <h1
          className="font-sans text-3xl md:text-5xl text-primary tracking-wider"
          style={{
            textShadow:
              "0 0 30px rgba(57, 255, 120, 0.4), 0 0 60px rgba(57, 255, 120, 0.15)",
          }}
        >
          NDL ARCADE
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-3">
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

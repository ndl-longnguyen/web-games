import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import { TetrisGameClient } from "./client"

export const metadata: Metadata = {
  title: "Tetris Game Online - Play Free Classic Tetris | NDL Arcade",
  description:
    "Play Tetris online for free. Stack blocks, clear lines, and chase high scores in this classic puzzle game. Choi game xep hinh Tetris mien phi.",
  keywords: [
    "tetris online",
    "play tetris free",
    "classic tetris",
    "tetris game",
    "block puzzle game",
    "game xep hinh tetris",
    "choi tetris online",
    "tetris mien phi",
  ],
  alternates: {
    canonical: "/games/tetris",
  },
  openGraph: {
    title: "Tetris Game Online - Play Free | NDL Arcade",
    description:
      "Play classic Tetris online for free. Stack blocks, clear lines, beat your high score. Choi game xep hinh Tetris mien phi.",
    url: "/games/tetris",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Tetris Game - NDL Arcade",
      },
    ],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Tetris Game - NDL Arcade",
  description:
    "Classic Tetris puzzle game. Stack falling blocks, clear lines, and achieve high scores.",
  genre: ["Puzzle", "Arcade"],
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

export default function TetrisPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <TetrisGameClient />
    </>
  )
}

import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import { TetrisGameClient } from "./client"

export const metadata: Metadata = {
  title: "Tetris Game Online - Play Free Classic Block Puzzle | NDL Arcade",
  description:
    "Play Tetris online for free with 10 difficulty levels from Beginner to Impossible. Stack blocks, clear lines, chase high scores. Ghost piece preview, hold piece, next piece display. No download. Choi game xep hinh Tetris mien phi 10 cap do.",
  keywords: [
    "tetris online",
    "tetris free",
    "play tetris",
    "classic tetris",
    "tetris game online",
    "tetris unblocked",
    "block puzzle game",
    "falling blocks game",
    "tetris no download",
    "game xep hinh tetris",
    "choi tetris online",
    "tetris mien phi",
    "game xep gach",
    "tetris 10 levels",
  ],
  alternates: {
    canonical: "https://game-online-free.vercel.app/games/tetris",
  },
  openGraph: {
    title: "Tetris Online - Play Free Classic Block Puzzle Game",
    description:
      "Play Tetris free online with 10 difficulty levels. Ghost piece, hold feature, next piece preview. Classic block puzzle in your browser. Choi Tetris mien phi.",
    url: "https://game-online-free.vercel.app/games/tetris",
    type: "website",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Tetris Game - Free Online Block Puzzle",
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

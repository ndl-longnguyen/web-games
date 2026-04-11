import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import { SudokuGameClient } from "./client"

export const metadata: Metadata = {
  title: "Sudoku Game Online - Play Free with 10 Difficulty Levels | NDL Arcade",
  description:
    "Play Sudoku online for free with 10 difficulty levels from Beginner to Impossible. Notes feature, hints, mistake tracking. Classic number puzzle game. No download required. Choi Sudoku online mien phi 10 cap do.",
  keywords: [
    "sudoku online",
    "sudoku free",
    "play sudoku",
    "sudoku game",
    "sudoku puzzle",
    "sudoku unblocked",
    "number puzzle game",
    "logic puzzle",
    "brain game",
    "sudoku 9x9",
    "game sudoku",
    "choi sudoku online",
    "sudoku mien phi",
    "do vui sudoku",
    "sudoku 10 levels",
  ],
  alternates: {
    canonical: "https://game-online-free.vercel.app/games/sudoku",
  },
  openGraph: {
    title: "Sudoku Online - Play Free Number Puzzle Game",
    description:
      "Play Sudoku free online with 10 difficulty levels. Notes, hints, mistake tracking. Classic logic puzzle in your browser. Choi Sudoku mien phi.",
    url: "https://game-online-free.vercel.app/games/sudoku",
    type: "website",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Sudoku Game - Free Online Number Puzzle",
      },
    ],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Sudoku Game - NDL Arcade",
  description:
    "Classic Sudoku number puzzle game with 10 difficulty levels. Fill the 9x9 grid so each row, column, and 3x3 box contains numbers 1-9.",
  genre: ["Puzzle", "Logic", "Brain Game"],
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

export default function SudokuPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <SudokuGameClient />
    </>
  )
}

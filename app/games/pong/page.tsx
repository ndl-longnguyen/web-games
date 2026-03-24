import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import { PongGameClient } from "./client"

export const metadata: Metadata = {
  title: "Pong Game Online - Play Free Classic Pong | NDL Arcade",
  description:
    "Play Pong online for free. The original competitive arcade game. You vs the AI machine. Choi game Pong co dien mien phi.",
  keywords: [
    "pong online",
    "play pong free",
    "classic pong",
    "pong game",
    "arcade pong",
    "ping pong game",
    "game pong co dien",
    "choi pong online",
  ],
  alternates: {
    canonical: "/games/pong",
  },
  openGraph: {
    title: "Pong Game Online - Play Free | NDL Arcade",
    description:
      "Play classic Pong online for free. Compete against AI in this legendary arcade game. Choi game Pong co dien mien phi.",
    url: "/games/pong",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Pong Game - NDL Arcade",
      },
    ],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Pong Game - NDL Arcade",
  description:
    "Classic Pong arcade game. Compete against AI in this legendary paddle game.",
  genre: ["Arcade", "Sports"],
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

export default function PongPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <PongGameClient />
    </>
  )
}

import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import { PongGameClient } from "./client"

export const metadata: Metadata = {
  title: "Breakout Game Online - Play Free Brick Breaker | NDL Arcade",
  description:
    "Play Breakout online for free. Break the bricks in 10 unique levels with pipes and tube patterns. 5 lives, multiple brick types. Choi game pha gach mien phi.",
  keywords: [
    "breakout online",
    "play breakout free",
    "brick breaker",
    "breakout game",
    "arcade breakout",
    "block breaker game",
    "game pha gach",
    "choi breakout online",
  ],
  alternates: {
    canonical: "/games/pong",
  },
  openGraph: {
    title: "Breakout Game Online - Play Free | NDL Arcade",
    description:
      "Play Breakout online for free. Break bricks in 10 unique levels with diverse patterns. Choi game pha gach mien phi.",
    url: "/games/pong",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Breakout Game - NDL Arcade",
      },
    ],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Breakout Game - NDL Arcade",
  description:
    "Classic Breakout brick breaker arcade game. 10 unique levels with pipe patterns, multiple brick types, 5 lives.",
  genre: ["Arcade", "Action"],
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

import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import { PongGameClient } from "./client"

export const metadata: Metadata = {
  title: "Breakout Game Online - Play Free Brick Breaker | NDL Arcade",
  description:
    "Play Breakout brick breaker online for free. 10 unique levels with pipe and tube patterns, 5 brick types including explosive bricks, combo scoring system. 5 lives. No download required. Choi game pha gach breakout mien phi 10 man.",
  keywords: [
    "breakout online",
    "breakout free",
    "play breakout",
    "brick breaker game",
    "breakout game online",
    "arkanoid free",
    "block breaker",
    "breakout unblocked",
    "paddle ball game",
    "game pha gach",
    "choi breakout online",
    "game breakout mien phi",
    "brick breaker arcade",
    "breakout 10 levels",
  ],
  alternates: {
    canonical: "https://game-online-free.vercel.app/games/pong",
  },
  openGraph: {
    title: "Breakout Online - Free Brick Breaker Game with 10 Levels",
    description:
      "Play Breakout free online. 10 unique levels, pipe patterns, explosive bricks, combo system. Classic brick breaker in your browser. Choi game pha gach mien phi.",
    url: "https://game-online-free.vercel.app/games/pong",
    type: "website",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Breakout Game - Free Online Brick Breaker",
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

import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import { SpaceInvadersGameClient } from "./client"

export const metadata: Metadata = {
  title: "Space Invaders Game Online - Play Free Alien Shooter | NDL Arcade",
  description:
    "Play Space Invaders online for free. Defend Earth from alien waves with power-ups, weapon upgrades up to level 20, and epic boss battles every 10 waves. No download required. Choi game ban may bay co dien mien phi voi boss va power-up.",
  keywords: [
    "space invaders online",
    "space invaders free",
    "play space invaders",
    "alien shooter game",
    "classic space invaders",
    "space invaders unblocked",
    "arcade shooter game",
    "retro shooter",
    "game ban may bay",
    "game space invaders online",
    "ban may bay co dien",
    "game ban alien",
    "space invaders boss battle",
    "space invaders power ups",
  ],
  alternates: {
    canonical: "https://game-online-free.vercel.app/games/space-invaders",
  },
  openGraph: {
    title: "Space Invaders Online - Free Alien Shooter with Boss Battles",
    description:
      "Play Space Invaders free online. Power-ups, weapon upgrades, epic boss battles. Classic arcade shooter in your browser. Choi game ban may bay mien phi.",
    url: "https://game-online-free.vercel.app/games/space-invaders",
    type: "website",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Space Invaders Game - Free Online Alien Shooter",
      },
    ],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Space Invaders Game - NDL Arcade",
  description:
    "Classic Space Invaders arcade shooter. Defend Earth from waves of descending alien invaders.",
  genre: ["Arcade", "Shooter"],
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

export default function SpaceInvadersPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <SpaceInvadersGameClient />
    </>
  )
}

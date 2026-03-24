import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import { SpaceInvadersGameClient } from "./client"

export const metadata: Metadata = {
  title: "Space Invaders Game Online - Play Free | NDL Arcade",
  description:
    "Play Space Invaders online for free. Defend Earth from waves of alien invaders in this classic arcade shooter. Choi game ban may bay co dien mien phi.",
  keywords: [
    "space invaders online",
    "play space invaders free",
    "classic space invaders",
    "alien shooter game",
    "arcade shooter",
    "game ban may bay",
    "game space invaders",
    "ban may bay co dien",
  ],
  alternates: {
    canonical: "/games/space-invaders",
  },
  openGraph: {
    title: "Space Invaders Game Online - Play Free | NDL Arcade",
    description:
      "Play classic Space Invaders online for free. Defend Earth from alien waves. Choi game ban may bay co dien mien phi.",
    url: "/games/space-invaders",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Space Invaders Game - NDL Arcade",
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

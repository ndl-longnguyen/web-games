import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SNAKE_MAPS, type MapId } from "@/lib/game-data"
import { JsonLd } from "@/components/json-ld"
import { SnakeGameClient } from "./client"

const validMapIds = new Set<string>(["classic", "portal", "maze", "gauntlet", "chaos"])

const MAP_SEO: Record<string, { titleEn: string; titleVi: string; descEn: string; descVi: string }> = {
  classic: {
    titleEn: "Classic Snake Game",
    titleVi: "Game Ran San Moi Co Dien",
    descEn: "Play the classic snake game. Eat food, grow longer, avoid walls. Pure skill gameplay.",
    descVi: "Choi game ran san moi co dien. An moi, lon dan, tranh tuong.",
  },
  portal: {
    titleEn: "Portal Walls Snake Game",
    titleVi: "Game Ran Xuyen Tuong",
    descEn: "Snake game with portal walls. Pass through one side and appear on the other!",
    descVi: "Game ran san moi xuyen tuong. Di qua mot ben va xuat hien phia ben kia!",
  },
  maze: {
    titleEn: "Maze Runner Snake Game",
    titleVi: "Game Ran Me Cung",
    descEn: "Navigate through a maze of obstacles in this challenging snake game variant.",
    descVi: "Di chuyen qua me cung chuong ngai vat trong game ran san moi.",
  },
  gauntlet: {
    titleEn: "The Gauntlet Snake Game",
    titleVi: "Game Ran Vuot Chuong Ngai Vat",
    descEn: "Tight corridors with narrow gaps. The hardest snake game map. Can you survive?",
    descVi: "Hanh lang hep voi khe nho. Ban do kho nhat. Ban co the song sot?",
  },
  chaos: {
    titleEn: "Random Chaos Snake Game",
    titleVi: "Game Ran Ngau Nhien",
    descEn: "New obstacles spawn every time you eat. The arena shrinks around you!",
    descVi: "Chuong ngai vat moi xuat hien moi khi an. San dau thu hep dan!",
  },
}

type PageProps = { params: Promise<{ mapId: string }> }

export async function generateStaticParams() {
  return Array.from(validMapIds).map((mapId) => ({ mapId }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { mapId } = await params

  if (!validMapIds.has(mapId)) return {}

  const seo = MAP_SEO[mapId]
  const mapInfo = SNAKE_MAPS.find((m) => m.id === mapId)!

  return {
    title: `${seo.titleEn} - Play Free Online`,
    description: `${seo.descEn} ${seo.descVi}`,
    keywords: [
      seo.titleEn.toLowerCase(),
      seo.titleVi.toLowerCase(),
      "snake game",
      "game ran san moi",
      `${mapInfo.name.toLowerCase()} snake`,
      `snake game ${mapInfo.difficulty.toLowerCase()}`,
      "play free online",
      "choi mien phi",
    ],
    alternates: {
      canonical: `/games/snake/${mapId}`,
    },
    openGraph: {
      title: `${seo.titleEn} - NDL Arcade`,
      description: `${seo.descEn} ${seo.descVi}`,
      url: `/games/snake/${mapId}`,
      images: [
        {
          url: '/android-chrome-512x512.png',
          width: 512,
          height: 512,
          alt: `${seo.titleEn}`,
        },
      ],
    },
  }
}

export default async function SnakeGamePage({ params }: PageProps) {
  const { mapId } = await params

  if (!validMapIds.has(mapId)) {
    notFound()
  }

  const mapInfo = SNAKE_MAPS.find((m) => m.id === mapId)!

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: `${MAP_SEO[mapId].titleEn} - NDL Arcade`,
    description: MAP_SEO[mapId].descEn,
    genre: "Arcade",
    gamePlatform: "Web Browser",
    numberOfPlayers: { "@type": "QuantitativeValue", value: 1 },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", name: "NDL" },
    inLanguage: ["en", "vi"],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <SnakeGameClient mapId={mapId as MapId} mapInfo={mapInfo} />
    </>
  )
}

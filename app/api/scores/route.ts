import { put, head } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import {
  getBlobPath,
  type LeaderboardData,
  type PlayerScore,
} from "@/lib/leaderboard"

async function getLeaderboard(
  game: string,
  mapId: string
): Promise<LeaderboardData> {
  try {
    const blobPath = getBlobPath(game, mapId)
    const blob = await head(blobPath)
    if (blob) {
      const res = await fetch(blob.url, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        },
      })
      return (await res.json()) as LeaderboardData
    }
  } catch {
    // blob does not exist yet
  }
  return { players: [] }
}

async function saveLeaderboard(
  game: string,
  mapId: string,
  data: LeaderboardData
) {
  const blobPath = getBlobPath(game, mapId)
  await put(blobPath, JSON.stringify(data), {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
  })
}

// GET /api/scores?game=snake&map=classic  — get top-10 leaderboard
export async function GET(request: NextRequest) {
  const game = request.nextUrl.searchParams.get("game")
  const mapId = request.nextUrl.searchParams.get("map")

  if (!game || !mapId) {
    return NextResponse.json(
      { error: "Missing game or map param" },
      { status: 400 }
    )
  }

  const data = await getLeaderboard(game, mapId)
  const top = data.players
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 10)

  return NextResponse.json({ leaderboard: top })
}

// POST /api/scores  — submit a score { game, map, name, age, score }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { game, map, name, age, score } = body as {
      game?: string
      map?: string
      name?: string
      age?: number
      score?: number
    }

    if (!game || !map || !name || typeof score !== "number" || typeof age !== "number") {
      return NextResponse.json(
        { error: "Missing required fields: game, map, name, age, score" },
        { status: 400 }
      )
    }

    if (score <= 0) {
      return NextResponse.json({ success: true, updated: false })
    }

    const data = await getLeaderboard(game, map)

    const existing = data.players.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    )

    if (existing) {
      existing.bestScore = Math.max(existing.bestScore, score)
      existing.gamesPlayed += 1
      existing.lastPlayed = new Date().toISOString()
    } else {
      const entry: PlayerScore = {
        name,
        age,
        bestScore: score,
        gamesPlayed: 1,
        lastPlayed: new Date().toISOString(),
      }
      data.players.push(entry)
    }

    await saveLeaderboard(game, map, data)

    return NextResponse.json({ success: true, updated: true })
  } catch (error) {
    console.error("Error in POST /api/scores:", error)
    return NextResponse.json(
      { error: "Invalid request body", details: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    )
  }
}

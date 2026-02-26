import { put, head } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import {
  PLAYERS_BLOB_PATH,
  type PlayerRegistry,
} from "@/lib/leaderboard"

async function getRegistry(): Promise<PlayerRegistry> {
  try {
    const blob = await head(PLAYERS_BLOB_PATH)
    if (blob) {
      const res = await fetch(blob.url, { cache: "no-store" })
      return (await res.json()) as PlayerRegistry
    }
  } catch {
    // blob does not exist yet
  }
  return { players: [] }
}

async function saveRegistry(registry: PlayerRegistry) {
  await put(PLAYERS_BLOB_PATH, JSON.stringify(registry), {
    access: "public",
    addRandomSuffix: false,
  })
}

// GET /api/players?name=xxx  — check if a name is taken
export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")
  if (!name) {
    return NextResponse.json({ error: "Missing name param" }, { status: 400 })
  }

  const registry = await getRegistry()
  const exists = registry.players.some(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  )
  return NextResponse.json({ exists })
}

// POST /api/players  — register a new player { name, age }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, age } = body as { name?: string; age?: number }

    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 20) {
      return NextResponse.json(
        { error: "Name must be 2-20 characters" },
        { status: 400 }
      )
    }

    if (!age || typeof age !== "number" || age < 1 || age > 120) {
      return NextResponse.json(
        { error: "Age must be between 1 and 120" },
        { status: 400 }
      )
    }

    const registry = await getRegistry()
    const trimmed = name.trim()

    if (
      registry.players.some(
        (p) => p.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      return NextResponse.json(
        { error: "Name already taken" },
        { status: 409 }
      )
    }

    registry.players.push({
      name: trimmed,
      age,
      registeredAt: new Date().toISOString(),
    })

    await saveRegistry(registry)

    return NextResponse.json({ success: true, name: trimmed, age })
  } catch (error) {
    console.error("Error in POST /api/players:", error)
    return NextResponse.json(
      { error: "Invalid request body", details: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    )
  }
}

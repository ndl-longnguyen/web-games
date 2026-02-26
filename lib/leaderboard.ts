export interface PlayerScore {
  name: string
  age: number
  bestScore: number
  gamesPlayed: number
  lastPlayed: string // ISO date
}

export interface LeaderboardData {
  players: PlayerScore[]
}

/** Blob path for a specific game + map leaderboard */
export function getBlobPath(game: string, mapId: string): string {
  return `leaderboard/${game}/${mapId}.json`
}

/** Blob path for the global player registry */
export const PLAYERS_BLOB_PATH = "players/registry.json"

export interface PlayerRegistry {
  players: { name: string; age: number; registeredAt: string }[]
}

import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/config/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const snakeMapIds = ["classic", "portal", "maze", "gauntlet", "chaos"]

  return [
    // Homepage - highest priority
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // Snake game hub
    {
      url: `${SITE_URL}/games/snake`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Snake maps
    ...snakeMapIds.map((id) => ({
      url: `${SITE_URL}/games/snake/${id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // Tetris game
    {
      url: `${SITE_URL}/games/tetris`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Breakout game (pong path)
    {
      url: `${SITE_URL}/games/pong`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Space Invaders game
    {
      url: `${SITE_URL}/games/space-invaders`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Sudoku game
    {
      url: `${SITE_URL}/games/sudoku`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ]
}

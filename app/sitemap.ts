import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://game-online-free.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const snakeMapIds = ['classic', 'portal', 'maze', 'gauntlet', 'chaos']

  return [
    // Homepage - highest priority
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Snake game hub
    {
      url: `${BASE_URL}/games/snake`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Snake maps
    ...snakeMapIds.map((id) => ({
      url: `${BASE_URL}/games/snake/${id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // Tetris game
    {
      url: `${BASE_URL}/games/tetris`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Breakout game (pong path)
    {
      url: `${BASE_URL}/games/pong`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Space Invaders game
    {
      url: `${BASE_URL}/games/space-invaders`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Sudoku game
    {
      url: `${BASE_URL}/games/sudoku`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
}

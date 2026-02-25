import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ndl-arcade.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const mapIds = ['classic', 'portal', 'maze', 'gauntlet', 'chaos']

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/games/snake`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...mapIds.map((id) => ({
      url: `${BASE_URL}/games/snake/${id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}

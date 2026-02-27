import type { Metadata, Viewport } from 'next'
import { Press_Start_2P, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PlayerProvider } from '@/components/player-provider'
import { PlayerRegistration } from '@/components/player-registration'
import './globals.css'

const _pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
  display: 'swap',
})
const _geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://game-online-free.vercel.app'),
  title: {
    default: 'NDL Arcade - Free Online Games',
    template: '%s | NDL Arcade',
  },
  description:
    'Play classic arcade games online for free. Enjoy Snake with unique maps, Tetris, Pong, and more retro games coming soon. Chơi game online miễn phí: Rắn săn mồi, Tetris, Pong và nhiều trò chơi arcade cổ điển khác.',
  generator: 'NDL',
  applicationName: 'NDL Arcade',
  authors: [{ name: 'NDL' }],
  creator: 'NDL',
  publisher: 'NDL',
  keywords: [
    // General Arcade Keywords
    'free online games',
    'web games',
    'retro arcade games',
    'classic arcade collection',
    'browser games',
    'HTML5 games',
    'no download games',
    'chơi game online miễn phí',
    'game web hay',
    'game arcade cổ điển',
    // Related & Adjacent Keywords
    'io games',
    'casual mini games',
    '8-bit games',
    'cool math games style',
    'unblocked games at school',
    'nostalgic games',
    'game tuổi thơ',
    'game giải trí nhẹ nhàng',
    'game xả stress',
    'game chơi trên trình duyệt',
    'game không cần tải',
    // Snake Game
    'snake game',
    'play snake online',
    'classic snake game',
    'game rắn săn mồi',
    'chơi game rắn săn mồi',
    'game rắn săn mồi online',

    // Tetris & Others
    'tetris online',
    'play tetris free',
    'classic tetris',
    'game xếp hình tetris',
    'pong online',
    'space invaders arcade',
    'game bắn máy bay cổ điển',
  ],
  category: 'Games',
  classification: 'Game',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'vi_VN',
    siteName: 'NDL Arcade',
    title: 'NDL Arcade - Free Online Retro Games | Snake Game & More',
    description:
      'Play free retro arcade games online. Snake game with 5 unique maps including Portal Walls, Maze Runner, and Random Chaos. Choi game ran san moi mien phi.',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'NDL Arcade - Free Online Games',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NDL Arcade - Free Online Games',
    description:
      'Play Snake with 5 unique maps. Free retro arcade games in your browser.',
    creator: '@NDL',
    images: ['/android-chrome-512x512.png'],
  },
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'vi': '/',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      {
        url: '/favicon-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_pressStart.variable} font-mono antialiased`}>
        <PlayerProvider>
          <PlayerRegistration />
          {children}
        </PlayerProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

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
    default: 'NDL Arcade - Free Online Games | Play Snake, Tetris, Breakout & Space Invaders',
    template: '%s | NDL Arcade - Free Online Games',
  },
  description:
    'Play free online arcade games: Snake with 5 unique maps, Tetris with 10 difficulty levels, Breakout brick breaker, and Space Invaders with boss battles. No download required. Choi game online mien phi: Ran san moi, Tetris, Breakout, Space Invaders.',
  generator: 'Next.js',
  applicationName: 'NDL Arcade',
  referrer: 'origin-when-cross-origin',
  authors: [{ name: 'NDL', url: 'https://game-online-free.vercel.app' }],
  creator: 'NDL',
  publisher: 'NDL Arcade',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    // Primary Keywords - High Search Volume
    'free online games',
    'play games online free',
    'browser games no download',
    'arcade games free',
    'retro games online',
    'classic games free',
    
    // Snake Game Keywords
    'snake game',
    'snake game online',
    'play snake online free',
    'classic snake game',
    'snake io game',
    'snake game unblocked',
    'game ran san moi',
    'choi game ran san moi online',
    'ran san moi mien phi',
    
    // Tetris Keywords
    'tetris game',
    'tetris online',
    'play tetris free',
    'classic tetris game',
    'tetris unblocked',
    'block puzzle game',
    'game xep hinh tetris',
    'choi tetris online mien phi',
    
    // Breakout Keywords
    'breakout game',
    'brick breaker',
    'breakout online',
    'brick breaker game free',
    'arkanoid game',
    'game pha gach',
    'choi breakout mien phi',
    
    // Space Invaders Keywords
    'space invaders',
    'space invaders online',
    'alien shooter game',
    'classic space invaders',
    'space invaders free',
    'game ban may bay',
    'game ban alien',
    
    // Long-tail & Vietnamese Keywords
    'game arcade co dien',
    'game web hay nhat',
    'game giai tri online',
    'game khong can tai',
    'game choi tren trinh duyet',
    'game tuoi tho 8x 9x',
    'best free browser games 2024',
    'html5 games no flash',
    'unblocked games at school',
    'cool math games alternative',
  ],
  category: 'Games',
  classification: 'Game',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['vi_VN'],
    siteName: 'NDL Arcade',
    title: 'NDL Arcade - Play Free Online Arcade Games | Snake, Tetris, Breakout, Space Invaders',
    description:
      'Play classic arcade games free online. Snake with 5 maps, Tetris 10 levels, Breakout brick breaker, Space Invaders with bosses. No download, play instantly in browser.',
    url: 'https://game-online-free.vercel.app',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'NDL Arcade - Free Online Arcade Games Collection',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@NDLArcade',
    creator: '@NDL',
    title: 'NDL Arcade - Free Online Arcade Games',
    description:
      'Play Snake, Tetris, Breakout & Space Invaders free online. Classic retro arcade games in your browser.',
    images: {
      url: '/android-chrome-512x512.png',
      alt: 'NDL Arcade Games',
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: 'https://game-online-free.vercel.app',
    languages: {
      'en-US': 'https://game-online-free.vercel.app',
      'vi-VN': 'https://game-online-free.vercel.app',
    },
  },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
    'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
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

import type { Metadata, Viewport } from 'next'
import { Press_Start_2P, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ndl-arcade.vercel.app'),
  title: {
    default: 'NDL Arcade - Free Online Retro Games | Snake Game & More',
    template: '%s | NDL Arcade',
  },
  description:
    'Play free retro arcade games online. Snake game with 5 unique maps, classic arcade experience. Choi game ran san moi mien phi, game arcade co dien truc tuyen.',
  generator: 'NDL',
  applicationName: 'NDL Arcade',
  authors: [{ name: 'NDL' }],
  creator: 'NDL',
  publisher: 'NDL',
  keywords: [
    // English keywords
    'snake game',
    'play snake online',
    'free online games',
    'retro arcade games',
    'classic snake game',
    'browser games',
    'arcade games free',
    'snake game with maps',
    'portal walls snake',
    'maze snake game',
    'HTML5 games',
    'no download games',
    // Vietnamese keywords
    'game ran san moi',
    'choi game ran san moi',
    'game ran san moi online',
    'game ran san moi mien phi',
    'tro choi ran san moi',
    'game arcade',
    'game co dien',
    'choi game online mien phi',
    'game ran san moi nhieu map',
    'game ran xuyen tuong',
    'game ran chuong ngai vat',
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NDL Arcade - Free Online Retro Games',
    description:
      'Play Snake with 5 unique maps. Free retro arcade games in your browser.',
    creator: '@NDL',
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
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
        {children}
        <Analytics />
      </body>
    </html>
  )
}

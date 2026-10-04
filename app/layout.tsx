import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'
import { getAllCategories } from '@/lib/posts'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://realnaijagist.com'),
  title: {
    default: 'RealNaijaGist - Nigeria Breaking News, Entertainment & Lifestyle Hub',
    template: '%s | RealNaijaGist',
  },
  description:
    'RealNaijaGist delivers verified breaking Nigerian news, political affairs, Nollywood updates, Afrobeats culture, sports, and viral gist 24/7.',
  keywords: [
    'Nigerian news',
    'breaking news Nigeria',
    'Naija gist',
    'Nollywood',
    'Afrobeats',
    'Lagos news',
    'Abuja politics',
    'RealNaijaGist',
  ],
  authors: [{ name: 'RealNaijaGist Editorial Team' }],
  creator: 'RealNaijaGist Media Network',
  publisher: 'RealNaijaGist Media Network',
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
    locale: 'en_NG',
    url: 'https://realnaijagist.com',
    siteName: 'RealNaijaGist',
    title: 'RealNaijaGist - Nigeria Breaking News, Entertainment & Lifestyle Hub',
    description:
      'Verified breaking Nigerian news, political analysis, entertainment gist, and cultural stories.',
    images: [
      {
        url: 'https://realnaijagist.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RealNaijaGist Breaking News',
      },
    ],
  },
  icons: {
    icon: '/favicon.ico?v=2',
    shortcut: '/favicon.ico?v=2',
    apple: '/logo.png?v=2',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@RealNaijaGist',
    creator: '@RealNaijaGist',
  },
  verification: {
    google: 'DX0lLnauAFtejFlc2UzmIri1JbxYDH1OXMo8yDFfbAg',
  },
  other: {
    'google-adsense-account': 'ca-pub-5426911739752799',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getAllCategories().catch(() => [])

  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" type="image/png" href="/logo.png?v=2" />
        <link rel="apple-touch-icon" href="/logo.png?v=2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5426911739752799"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
        <Navbar categories={categories} />
        <div id="main-content" className="flex-1">
          {children}
        </div>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  )
}
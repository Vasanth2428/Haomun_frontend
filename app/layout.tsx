import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/layout/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'HaoMun – The Intelligence Pavilion',
  description: 'Ancient wisdom meets modern intelligence. The ultimate analysis platform for seekers of digital mastery.',
  generator: 'v0.app',
  metadataBase: new URL('https://haomun.vercel.app'), // Placeholder, would be replaced by actual domain
  openGraph: {
    title: 'HaoMun | Ancient Wisdom meets AI',
    description: 'The convergence of strategic wisdom and artificial intelligence for competitive programmers.',
    url: 'https://haomun.vercel.app',
    siteName: 'HaoMun',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HaoMun - Ancient Wisdom meets AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HaoMun | Ancient Wisdom meets AI',
    description: 'The convergence of strategic wisdom and artificial intelligence for competitive programmers.',
    images: ['/og-image.png'],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

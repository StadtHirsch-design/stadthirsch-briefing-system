import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './styles/globals.css'
import './styles/agency.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'StadtHirsch KI-Agentur',
  description: 'Vollautomatisierte KI-gesteuerte Werbe- & Grafikagentur',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StadtHirsch',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FFFFFF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}

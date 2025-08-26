// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Belleza, Alegreya } from 'next/font/google'
import './globals.css'
import { Providers } from './Providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
 
const belleza = Belleza({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-belleza',
})
 
const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-alegreya',
})

export const metadata: Metadata = {
  title: {
    default: 'ABBES AHMED',
    template: '%s | Accueil Zen'
  },
  description: 'A simple and serene personalized greeting application.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable} ${belleza.variable} ${alegreya.variable}`}>
      <body className="bg-background font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

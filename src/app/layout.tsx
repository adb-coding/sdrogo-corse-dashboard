import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '@/components'
import { GameModeProvider } from '@/lib/game-mode'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Sdrogo Corse Dashboard 2026',
  description: 'Racing telemetry dashboard for Sdrogo Corse - GTA V racing championships',
  icons: {
    icon: '/assets/melagoodo-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className="bg-zinc-950 text-white min-h-screen">
        <GameModeProvider>
          {children}
          <BottomNav />
        </GameModeProvider>
        <Analytics />
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '@/components'
import { GameModeProvider } from '@/lib/game-mode'
import { buildThemeBootstrapScript } from '@/lib/game-config'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Sdrogo Corse Dashboard 2026',
  description: 'Racing telemetry dashboard for Sdrogo Corse and Golfatine - GTA V & Golf with your Friends championships',
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
        {/* Blocking, and first thing in the body: applies the saved game's
            accents before any content paints, so a refresh never flashes the
            default red theme. */}
        <script dangerouslySetInnerHTML={{ __html: buildThemeBootstrapScript() }} />
        <GameModeProvider>
          {children}
          <BottomNav />
        </GameModeProvider>
        <Analytics />
      </body>
    </html>
  )
}
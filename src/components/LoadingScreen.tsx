'use client'

import Image from 'next/image'
import { useGameMode } from '@/lib/game-mode'
import { Header } from './Header'

/**
 * Full-screen branded loader shown while the CSV is fetched and parsed.
 * The logo pulses/glows in the active accent color with orbiting dots below.
 */
export function LoadingScreen() {
  const { mode } = useGameMode()
  const logo = mode === 'golf' ? '/assets/golf-logo.png' : '/assets/melagoodo-logo.png'

  return (
    <main className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950">
      <Header />
      <div className="loader-logo relative w-24 h-24 md:w-32 md:h-32">
        <Image
          src={logo}
          alt="Loading"
          fill
          priority
          className="object-contain"
        />
      </div>

      <div className="flex items-center gap-2 mt-10">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="loader-dot w-2.5 h-2.5 rounded-full"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>

      <p className="mt-6 text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-600">
        Caricamento dati
      </p>
    </main>
  )
}

'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { GAME_CONFIGS, GAME_ORDER, GameMode, hexToRgbChannels } from '@/lib/game-config'
import { useGameMode } from '@/lib/game-mode'

/**
 * Landing page: pick one of the championships. Selecting a card sets the game
 * mode (and therefore the theme + CSV) and drops the user on the dashboard.
 */
export default function GamePicker() {
  const { setMode } = useGameMode()
  const router = useRouter()

  const enter = (id: GameMode) => {
    setMode(id)
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-zinc-950 noise-texture flex flex-col">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-16 md:py-24 flex flex-col justify-center">
        <div className="flex flex-col items-center text-center mb-14">
          <Image
            src="/assets/melagoodo-logo.png"
            alt="Melagoodo"
            width={96}
            height={96}
            priority
            className="object-contain"
          />
          <h1 className="font-condensed text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mt-6">
            Melagoodo Dashboard
          </h1>
          <p className="text-zinc-500 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] mt-3">
            Scegli il campionato
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GAME_ORDER.map((id, index) => {
            const game = GAME_CONFIGS[id]

            return (
              <motion.button
                key={id}
                onClick={() => enter(id)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                // Each card wears its own game's accent rather than the active theme.
                style={{ '--accent': hexToRgbChannels(game.colors.accent) } as React.CSSProperties}
                className="group text-left flex flex-col p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-accent/60 hover:bg-zinc-900 transition-all duration-300 shadow-xl hover:shadow-[0_0_40px_rgb(var(--accent)_/_0.15)]"
              >
                <div className="h-24 flex items-center justify-center mb-6">
                  <Image
                    src={game.logo}
                    alt={game.title}
                    width={160}
                    height={96}
                    className="object-contain max-h-24 w-auto transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <h2 className="font-condensed text-2xl font-black uppercase tracking-tight text-accent leading-none">
                  {game.title}
                </h2>
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.25em] mt-2">
                  {game.brandShort}
                </span>

                <p className="text-sm text-zinc-400 leading-relaxed mt-4 flex-1">
                  {game.description}
                </p>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                    Agg. {game.update}
                  </span>
                  <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-accent">
                    Entra
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      <footer className="border-t border-zinc-800 py-8">
        <p className="text-center text-zinc-600 text-[10px] font-mono uppercase tracking-[0.3em]">
          &copy; 2026 Melagoodo Dashboard
        </p>
      </footer>
    </main>
  )
}

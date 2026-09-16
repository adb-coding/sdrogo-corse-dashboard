'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Home, Users, Trophy, ChevronDown, Check } from 'lucide-react'
import Image from 'next/image'
import { useGameMode } from '@/lib/game-mode'
import { GAME_CONFIGS, GAME_ORDER, GameMode } from '@/lib/game-config'

export function Header() {
  const { config } = useGameMode()

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {/* The Melagoodo logo is the way back to the game picker. */}
          <Link href="/" aria-label="Scegli gioco" className="group shrink-0">
            <Image
              src="/assets/melagoodo-logo.png"
              alt="Melagoodo Logo"
              width={64}
              height={64}
              className="object-contain transition-transform group-hover:scale-110 duration-300"
            />
          </Link>
          <div className="w-px h-16 bg-zinc-700 shrink-0" />
          <GameSwitcher />
        </div>

        <nav className="hidden md:flex items-center gap-6 shrink-0">
          <NavLink href="/dashboard" icon={<Home className="w-4 h-4" />} label={config.nav.home} />
          <NavLink href="/playlists" icon={<Trophy className="w-4 h-4" />} label={config.nav.playlists} />
          <NavLink href="/drivers" icon={<Users className="w-4 h-4" />} label={config.nav.drivers} />
        </nav>
      </div>
    </header>
  )
}

/** Dropdown listing every available game; replaces the old two-brand toggle. */
function GameSwitcher() {
  const { mode, config, setMode } = useGameMode()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape so the panel never traps the page.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const select = (next: GameMode) => {
    setMode(next)
    setOpen(false)
  }

  return (
    <div className="relative min-w-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Cambia gioco"
        className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-accent/50 transition-all group min-w-0"
      >
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0">
          <Image
            src={config.logo}
            alt={config.title}
            width={42}
            height={42}
            className="object-contain transition-transform group-hover:scale-110 duration-300"
          />
        </div>
        <div className="hidden sm:flex flex-col text-left leading-none min-w-0">
          <h2 className="font-condensed font-black text-lg md:text-xl uppercase tracking-tight text-accent leading-none truncate">
            {config.title}
          </h2>
          <span className="text-[9px] md:text-[10px] text-zinc-500 font-mono tracking-[0.3em] mt-1">
            DASHBOARD 2026
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden z-50"
        >
          {GAME_ORDER.map(id => {
            const game = GAME_CONFIGS[id]
            const isActive = id === mode

            return (
              <button
                key={id}
                role="option"
                aria-selected={isActive}
                onClick={() => select(id)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${
                  isActive ? 'bg-zinc-800/80' : 'hover:bg-zinc-800/50'
                }`}
              >
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <Image
                    src={game.logo}
                    alt={game.title}
                    width={36}
                    height={36}
                    className={`object-contain transition-all ${isActive ? '' : 'opacity-50 grayscale'}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-condensed font-bold uppercase tracking-tight text-sm truncate ${
                      isActive ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    {game.title}
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest truncate">
                    {game.brandShort}
                  </div>
                </div>
                {isActive && <Check className="w-4 h-4 text-accent shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-condensed uppercase text-sm tracking-wider"
    >
      {icon}
      {label}
    </Link>
  )
}

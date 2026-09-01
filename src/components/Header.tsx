'use client'

import Link from 'next/link'
import { Home, Users, Trophy } from 'lucide-react'
import Image from 'next/image'
import { useGameMode } from '@/lib/game-mode'

export function Header() {
  const { mode, config, setMode, toggleMode } = useGameMode()
  const melagoodoLogo = '/assets/melagoodo-logo.png'
  const gta5Logo = '/assets/gta5-logo.png'
  const golfLogo = '/assets/golf-logo.png'
  const isGolf = mode === 'golf'

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Image
            src={melagoodoLogo}
            alt="Melagoodo Logo"
            width={64}
            height={64}
            className="object-contain transition-transform group-hover:scale-110 duration-300"
          />
          <div className="w-px h-16 bg-zinc-700 shrink-0" />
          {/* Racing brand */}
          <button
            onClick={() => setMode('racing')}
            aria-label="Sdrogo Corse"
            className={`flex items-center gap-3 group transition-all ${
              isGolf ? 'opacity-40 grayscale hover:opacity-70' : 'opacity-100'
            }`}
          >
            <div className="w-11 h-11 md:w-14 md:h-14 flex items-center justify-center relative shrink-0">
              <Image
                src={gta5Logo}
                alt="Melagoodo Logo"
                width={42}
                height={42}
                className="object-contain transition-transform group-hover:scale-110 duration-300"
              />
            </div>
            <div className="hidden lg:flex flex-col text-left leading-none">
              <h2 className="font-condensed font-black text-lg md:text-xl uppercase tracking-tight text-accent leading-none">
                Sdrogo Corse
              </h2>
              <span className="text-[9px] md:text-[10px] text-zinc-500 font-mono tracking-[0.3em] mt-1">
                DASHBOARD 2026
              </span>
            </div>
          </button>

          {/* Game toggle */}
          <ModeToggle isGolf={isGolf} onToggle={toggleMode} />

          {/* Golf brand (text logo placeholder) */}
          <button
            onClick={() => setMode('golf')}
            aria-label="Golf With Your Friends"
            className={`flex items-center gap-2 md:gap-3 group transition-all ${
              isGolf ? 'opacity-100' : 'opacity-40 grayscale hover:opacity-70'
            }`}
          >
            <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300">
              <span className="font-condensed font-black text-base md:text-xl uppercase tracking-tighter text-accent leading-none">
                <Image
                  src={golfLogo}
                  alt="Golf Logo"
                  width={42}
                  height={42}
                  className="object-contain transition-transform group-hover:scale-110 duration-300"
                />  
              </span>
            </div>
            <div className="hidden lg:flex flex-col text-left leading-none">
              <h2 className="font-condensed font-black text-lg md:text-xl uppercase tracking-tight text-accent leading-none">
                GOLFATINE
              </h2>
              <span className="text-[9px] md:text-[10px] text-zinc-500 font-mono tracking-[0.3em] mt-1">
                DASHBOARD 2026
              </span>
            </div>
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-6 shrink-0">
          <NavLink href="/" icon={<Home className="w-4 h-4" />} label={config.nav.home} />
          <NavLink href="/playlists" icon={<Trophy className="w-4 h-4" />} label={config.nav.playlists} />
          <NavLink href="/drivers" icon={<Users className="w-4 h-4" />} label={config.nav.drivers} />
        </nav>
      </div>
    </header>
  )
}

function ModeToggle({ isGolf, onToggle }: { isGolf: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={isGolf}
      aria-label="Cambia gioco"
      className="relative w-14 h-7 rounded-full border border-zinc-700 bg-zinc-800/80 transition-colors shrink-0 hover:border-zinc-600"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-accent shadow-neon-accent transition-transform duration-300 ${
          isGolf ? 'translate-x-7' : 'translate-x-0'
        }`}
      />
    </button>
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

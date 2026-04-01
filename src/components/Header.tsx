import Link from 'next/link'
import { Home, Users, Trophy } from 'lucide-react'
import Image from 'next/image'

export function Header() {
  const melagoodoLogo = '/assets/melagoodo-logo.png'

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-14 h-14 flex items-center justify-center relative">
            <Image 
              src={melagoodoLogo} 
              alt="Melagoodo Logo" 
              width={56}
              height={56}
              className="object-contain transition-transform group-hover:scale-110 duration-300"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-condensed font-bold text-2xl uppercase tracking-wider text-white leading-none">
              Sdrogo Corse
            </h1>
            <span className="text-[10px] text-zinc-500 font-mono tracking-[0.3em] mt-1">DASHBOARD 2026</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/" icon={<Home className="w-4 h-4" />} label="Classifica" />
          <NavLink href="/playlists" icon={<Trophy className="w-4 h-4" />} label="Elenchi" />
          <NavLink href="/drivers" icon={<Users className="w-4 h-4" />} label="Sdrogo Piloti" />
        </nav>
      </div>
    </header>
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
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: <Home className="w-5 h-5" />, label: 'Classifica' },
    { href: '/playlists', icon: <Trophy className="w-5 h-5" />, label: 'Elenchi' },
    { href: '/drivers', icon: <Users className="w-5 h-5" />, label: 'Piloti' },
  ]

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] max-w-sm">
      <div className="bg-zinc-900/60 backdrop-blur-lg border border-zinc-800/50 rounded-2xl p-2 flex items-center justify-around shadow-2xl shadow-black/50">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="relative flex flex-col items-center gap-1 px-4 py-2"
            >
              <div className={`transition-all duration-300 ${isActive ? 'text-red-500 scale-110' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-condensed font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="bottomNavTab"
                  className="absolute -bottom-1 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

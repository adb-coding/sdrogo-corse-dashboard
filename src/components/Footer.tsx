'use client'

import { useGameMode } from "@/lib/game-mode"
import Link from "next/link"
import { Youtube, Instagram, Github, ArrowUp } from 'lucide-react'

export function Footer() {
    const { config } = useGameMode()

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }

    return (
        <footer className="border-t border-zinc-800 mt-16 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
                    {/* Column 1: Brand & Copyright */}
                    <div className="space-y-3">
                        <h4 className="font-mono font-bold text-xs text-zinc-400 uppercase tracking-widest">
                            {config.title}
                        </h4>
                        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                        &copy; 2026 Dashboard Ufficiale.<br />
                        Tutti i video e i contenuti sono di proprietà dei rispettivi creatori (Melagoodo).
                        </p>
                    </div>
    
                    {/* Column 2: Quick Links */}
                    <div className="space-y-3 md:justify-self-center md:text-center">
                        <h4 className="font-mono font-bold text-xs text-zinc-400 uppercase tracking-widest">
                                Navigazione
                        </h4>
                        <ul className="flex flex-col gap-2 text-[11px] font-mono font-bold uppercase tracking-widest md:items-center">
                            <li>
                                <Link href="/" className="text-zinc-600 hover:text-accent transition-colors">Classifica Generale</Link>
                            </li>
                            <li>
                                <Link href="/playlists" className="text-zinc-600 hover:text-accent transition-colors">Storico Elenchi</Link>
                            </li>
                            <li>
                                <Link href="/drivers" className="text-zinc-600 hover:text-accent transition-colors">Griglia {config.nav.drivers}</Link>
                            </li>
                        </ul>
                    </div>
    
                    {/* Column 3: Credits & Socials */}
                    <div className="space-y-3">
                        <h4 className="font-mono font-bold text-xs text-zinc-400 uppercase tracking-widest">
                        Classifiche
                        </h4>
                        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
                        Le classifiche delle {config.title} sono aggiornate al <span className="text-zinc-300">{config.update}</span>
                        </p>
                        {/* Example Social/External Icons */}
                        {/* <div className="flex items-center justify-center md:justify-start gap-4 pt-2"> */}
                        {/* <a href="#" className="text-zinc-600 hover:text-red-500 transition-colors"><Youtube className="w-4 h-4" /></a>
                        <a href="#" className="text-zinc-600 hover:text-pink-500 transition-colors"><Instagram className="w-4 h-4" /></a>
                        <a href="#" className="text-zinc-600 hover:text-white transition-colors"><Github className="w-4 h-4" /></a> */}
                        {/* </div> */}
                        <h4 className="font-mono font-bold text-xs text-zinc-400 uppercase tracking-widest">
                        Changelog
                        </h4>
                        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
                            <li>
                                <Link href="/changelog">
                                Patch Notes
                                </Link>
                            </li>
                        </p>
                    </div>
                </div>

                {/* Bottom Bar: Back to Top Button */}
                <div className="pt-8 border-t border-zinc-800/50 flex justify-between items-center">
                <div className="text-[9px] text-zinc-600 font-mono font-bold tracking-widest uppercase">
                    V 2.0.0 — Sdrogo Corse
                </div>
                <button 
                    onClick={scrollToTop}
                    className="flex items-center gap-2 text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors group"
                >
                    Torna su
                    <ArrowUp className="w-3 h-3 group-hover:-translate-y-1 transition-transform" />
                </button>
                </div>

            </div>
        </footer>
    )
}
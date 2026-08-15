'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, Driver } from 'framer-motion'
import { Trophy, Calendar, ChevronDown, Check, X } from 'lucide-react'
import { GameMode, GAME_CONFIGS } from '@/lib/game-config'


interface DriverFilterProps {
    availableDrivers: string[]
    selectedDrivers: string[]
    onDriverChange: (drivers: string[]) => void
}


export function DriverFilter({ availableDrivers, selectedDrivers, onDriverChange }: DriverFilterProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
                setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleDrivers = (drivers: string) => {
        if (drivers == 'all') {
            onDriverChange(['all'])
            return
        }

        let newSelection = selectedDrivers.filter(s => s !== 'all')
        if (newSelection.includes(drivers)) { 
            newSelection = newSelection.filter(s => s !== drivers)
        } else {
            newSelection = [...newSelection, drivers]
        }

        if (newSelection.length === 0) { 
            onDriverChange(['all'])
        } else {
            onDriverChange(newSelection)
        }
    }

    const isAllSelected = selectedDrivers.includes('all')

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-4 bg-zinc--900/50 p-2.5 rounded-xl order border-zinc-800 hover:border-zinc-700 transition-all min--w-[200px] text-left"
            >
                <div className="flex items-center gap-2 px-3 py-1.5 border-r border-zinc-800">
                    <Trophy className="w-4 h-4 text-zinc-500" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Pilota</span>
                </div>

                <div className="flex-1 flex items-center justify-between gap-2 pr-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white truncate">
                        {isAllSelected ? 'All' : selectedDrivers.sort().join(', ')}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-full min-w-[240px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                    <div className="p-2 space-y-1">
                    <button
                        onClick={() => {
                        toggleDrivers('all')
                        setIsOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                        isAllSelected ? 'bg-accent text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        }`}
                    >
                        All
                        {isAllSelected && <Check className="w-3 h-3" />}
                    </button>
                    
                    <div className="h-px bg-zinc-800 my-1 mx-2" />
                    {availableDrivers.map((driver) => {
                        const isSelected = selectedDrivers.includes(driver)
                        return (
                        <button
                            key={driver}
                            onClick={() => toggleDrivers(driver)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                            isSelected ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                            }`}
                        >
                            {driver}
                            {isSelected && <Check className="w-3 h-3 text-accent" />}
                        </button>
                        )
                    })}
                    </div>
            
                    {!isAllSelected && (
                    <div className="p-2 border-t border-zinc-800 bg-zinc-900/30 flex justify-between gap-2">
                        <button
                        onClick={() => onDriverChange(['all'])}
                        className="flex-1 px-3 py-1.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-tighter text-zinc-500 hover:text-white transition-colors"
                        >
                        Reset
                        </button>
                        <button
                        onClick={() => setIsOpen(false)}
                        className="flex-1 px-3 py-1.5 bg-zinc-800 rounded-md text-[9px] font-mono font-bold uppercase tracking-tighter text-white hover:bg-zinc-700 transition-colors"
                        >
                        Apply
                        </button>
                    </div>
                    )}
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { summarizeSelection } from '@/lib/filter-utils'

interface MultiSelectFilterProps {
  /** Short label shown on the left of the trigger (e.g. Circuito, Vettura) */
  label: string
  icon: React.ReactNode
  /** Text shown when nothing specific is selected */
  allLabel?: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

/**
 * Generic "all / pick many" dropdown, same shape as the Season and Driver
 * filters. `['all']` is the neutral state, matching the convention those use.
 */
export function MultiSelectFilter({
  label,
  icon,
  allLabel = 'All',
  options,
  selected,
  onChange,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggle = (option: string) => {
    if (option === 'all') {
      onChange(['all'])
      return
    }

    let newSelection = selected.filter(s => s !== 'all')
    if (newSelection.includes(option)) {
      newSelection = newSelection.filter(s => s !== option)
    } else {
      newSelection = [...newSelection, option]
    }

    onChange(newSelection.length === 0 ? ['all'] : newSelection)
  }

  const isAllSelected = selected.includes('all') || selected.length === 0

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all w-full sm:w-[210px] text-left"
      >
        <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 border-r border-zinc-800 shrink-0">
          <span className="text-zinc-500">{icon}</span>
          <span className="hidden xs:inline text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">{label}</span>
        </div>

        <div className="flex-1 flex items-center justify-between gap-2 pr-2 min-w-0">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white truncate">
            {summarizeSelection(selected, allLabel)}
          </span>
          <ChevronDown className={`w-3 h-3 text-zinc-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[min(280px,calc(100vw-2rem))] sm:w-[240px] max-h-[320px] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50"
          >
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  toggle('all')
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                  isAllSelected ? 'bg-accent text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                {allLabel}
                {isAllSelected && <Check className="w-3 h-3" />}
              </button>

              <div className="h-px bg-zinc-800 my-1 mx-2" />

              {options.length === 0 && (
                <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                  Nessun dato
                </div>
              )}

              {options.map(option => {
                const isSelected = !isAllSelected && selected.includes(option)
                return (
                  <button
                    key={option}
                    onClick={() => toggle(option)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                      isSelected ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <span className="truncate text-left">{option}</span>
                    {isSelected && <Check className="w-3 h-3 text-accent shrink-0" />}
                  </button>
                )
              })}
            </div>

            {!isAllSelected && (
              <div className="p-2 border-t border-zinc-800 bg-zinc-900/30 flex justify-between gap-2 sticky bottom-0">
                <button
                  onClick={() => onChange(['all'])}
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

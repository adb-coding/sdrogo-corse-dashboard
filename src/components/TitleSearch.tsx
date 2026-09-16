'use client'

import { Search, X } from 'lucide-react'

interface TitleSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/** Free-text filter matched against the elenco's YouTube video title. */
export function TitleSearch({ value, onChange, placeholder = 'Cerca nel titolo...' }: TitleSearchProps) {
  return (
    <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800 focus-within:border-accent/50 transition-all w-full sm:w-[260px]">
      <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 border-r border-zinc-800 shrink-0">
        <Search className="w-4 h-4 text-zinc-500" />
        <span className="hidden xs:inline text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Titolo</span>
      </div>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent pr-2 text-[10px] font-mono font-bold uppercase tracking-widest text-white placeholder:text-zinc-600 placeholder:normal-case placeholder:tracking-normal focus:outline-none"
      />

      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Cancella ricerca"
          className="p-1.5 mr-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

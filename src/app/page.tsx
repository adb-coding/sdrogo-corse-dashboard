'use client'

import { useEffect, useState, useMemo } from 'react'
import { Header, TopThree, Leaderboard, PlaylistViewer, SeasonFilter } from '@/components'
import { PerformanceChart } from '@/components/PerformanceChart'
import { parseCSV, processPlayerStats, getPlaylistData, filterEntriesBySeason, getAvailableYears } from '@/lib/data'
import { PlayerStats, PlaylistData, RaceEntry } from '@/types'

export default function Home() {
  const [seasons, setSeasons] = useState<string[]>(['all'])
  const [allEntries, setAllEntries] = useState<RaceEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const entries = await parseCSV('/sdrogo_corse_chronological.csv')
      setAllEntries(entries)
      setLoading(false)
    }
    loadData()
  }, [])

  const availableYears = useMemo(() => getAvailableYears(allEntries), [allEntries])

  const filteredData = useMemo(() => {
    const filtered = filterEntriesBySeason(allEntries, seasons)
    return {
      players: processPlayerStats(filtered),
      playlists: getPlaylistData(filtered)
    }
  }, [seasons, allEntries])

  const { players, playlists } = filteredData

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 pt-20">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse mb-12" />
          <div className="h-96 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 noise-texture pt-20 pb-32 md:pb-8">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-condensed text-4xl font-black uppercase tracking-tighter text-white">
              Sdrogo Corse
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">
              Statistiche Ufficiali del Campionato
            </p>
          </div>
          <SeasonFilter 
            availableYears={availableYears}
            selectedSeasons={seasons} 
            onSeasonChange={setSeasons} 
          />
        </div>

        <section>
          <TopThree players={players} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="font-condensed text-2xl font-bold uppercase tracking-wider text-zinc-300">
              Classifica {seasons.includes('all') ? 'Globale' : seasons.sort().join(' + ')}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-bold">
                {players.length} Piloti Attivi
              </span>
            </div>
          </div>
          <Leaderboard 
            players={players} 
          />
        </section>

        <section>
          <PerformanceChart players={players} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="font-condensed text-2xl font-bold uppercase tracking-wider text-zinc-300">
              Storico Elenchi
            </h2>
          </div>
          <PlaylistViewer playlists={playlists} />
        </section>
      </div>

      <footer className="border-t border-zinc-800 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">
            Sdrogo Corse Dashboard 2026 &copy; Tutti i video e i contenuti sono di proprietà dei rispettivi creatori.
          </p>
          <p className="text-zinc-500 text-[10px] font-mono tracking-[0.3em]">
          Si ringrazia @antobeviz per la creazione delle statistiche
          </p>
        </div>
      </footer>
    </main>
  )
}


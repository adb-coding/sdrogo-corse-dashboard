'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Header, TopThree, Leaderboard, SeasonFilter, Footer, LoadingScreen } from '@/components'
import { parseCSV, processPlayerStats, getPlaylistData, filterEntriesBySeason, getAvailableYears } from '@/lib/data'

// Recharts is heavy; keep it out of the initial bundle. These two sections sit
// below the fold, so load them on demand. Animations are unchanged once mounted.
const chartFallback = (
  <div className="w-full h-80 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse" />
)
const PerformanceChart = dynamic(
  () => import('@/components/PerformanceChart').then(m => m.PerformanceChart),
  { ssr: false, loading: () => chartFallback }
)
const PlaylistViewer = dynamic(
  () => import('@/components/PlaylistViewer').then(m => m.PlaylistViewer),
  { ssr: false, loading: () => chartFallback }
)
import { PlayerStats, PlaylistData, RaceEntry } from '@/types'
import { useGameMode } from '@/lib/game-mode'

export default function Home() {
  const { config } = useGameMode()
  const [seasons, setSeasons] = useState<string[]>(['all'])
  const [allEntries, setAllEntries] = useState<RaceEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const entries = await parseCSV(config.csvPath)
      setAllEntries(entries)
      setLoading(false)
    }
    loadData()
  }, [config.csvPath])

  const availableYears = useMemo(() => getAvailableYears(allEntries), [allEntries])

  const filteredData = useMemo(() => {
    const filtered = filterEntriesBySeason(allEntries, seasons)
    const minPlaylists = seasons.includes('all') ? config.minPlaylistsAllTime : 0
    return {
      players: processPlayerStats(filtered, minPlaylists, config.lowerIsBetter),
      // Most recent elenchi first on the dashboard.
      playlists: getPlaylistData(filtered, config.lowerIsBetter).reverse()
    }
  }, [seasons, allEntries, config.minPlaylistsAllTime, config.lowerIsBetter])

  const { players, playlists } = filteredData

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-screen bg-zinc-950 noise-texture pt-20 pb-32 md:pb-8">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-condensed text-4xl font-black uppercase tracking-tighter text-white">
              {config.title}
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">
              {config.subtitle}
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
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-bold">
                {players.length} {config.nav.drivers} Attivi
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

      {/* <footer className="border-t border-zinc-800 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">
            {config.title} Dashboard 2026 &copy; Tutti i video e i contenuti sono di proprietà dei rispettivi creatori.
          </p>
          <p className="text-zinc-500 text-[10px] font-mono tracking-[0.3em]">
          Si ringrazia @antobeviz per la creazione delle statistiche
          </p>
        </div>
      </footer> */}
      <Footer />
    </main>
  )
}


'use client'

import { useEffect, useState, useMemo } from 'react'
import { Header, SeasonFilter,  DriverFilter, Footer } from '@/components'
import { parseCSV, getPlaylistData, filterEntriesBySeason, getAvailableYears, processPlayerStats } from '@/lib/data'
import { getPlayerColor, normalizePlayerName } from '@/lib/colors'
import { PlaylistData, RaceEntry } from '@/types'
import { motion } from 'framer-motion'
import { Trophy, User, ExternalLink, Youtube } from 'lucide-react'
import { useGameMode } from '@/lib/game-mode'
import { CartesianGrid, ResponsiveContainer, LineChart, Tooltip, Line, XAxis, YAxis } from 'recharts'
import Link from 'next/link'


export default function PlaylistsPage() {
  const { config } = useGameMode()
  const [seasons, setSeasons] = useState<string[]>(['all'])
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([])
  const [allEntries, setAllEntries] = useState<RaceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const entries = await parseCSV(config.csvPath)
        setAllEntries(entries)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [config.csvPath])

  const availableYears = useMemo(() => getAvailableYears(allEntries), [allEntries])

  const availableDrivers = useMemo(() => {
    const drivers = new Set<string>()
    allEntries.forEach(entry => {
      if (entry.giocatore.trim().toUpperCase() !== 'PAR'){
        drivers.add(entry.giocatore)
      }
    })
    return Array.from(drivers).sort()
  }, [allEntries])

  const playlists = useMemo(() => {
    const filteredBySeason = filterEntriesBySeason(allEntries, seasons)
    const allPlaylists = getPlaylistData(filteredBySeason, config.lowerIsBetter)
    if (selectedDrivers.length === 0 || selectedDrivers.includes('all')) return allPlaylists;
    return allPlaylists.filter(playlists => {
      const playerInPlaylist = playlists.results.map(r => r.player)
      return selectedDrivers.some(driver => playerInPlaylist.includes(driver))
    })
  }, [allEntries, seasons, config.lowerIsBetter, selectedDrivers])

  useEffect(() => {
    if (selectedId !== null && !playlists.find(p => p.elencoId === selectedId)) {
      setSelectedId(null)
    }
  }, [playlists, selectedId])

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 pt-20">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse grid grid-cols-3 gap-4">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="h-32 bg-zinc-800 rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 noise-texture pt-20 pb-32 md:pb-8">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-condensed text-3xl font-bold uppercase tracking-wider text-white">
              Elenchi
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">
              Database Completo Gare {seasons.includes('all') ? 'All-Time' : seasons.sort().join(' + ')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <DriverFilter
              availableDrivers={availableDrivers}
              selectedDrivers={selectedDrivers}
              onDriverChange={setSelectedDrivers}
              />
            <SeasonFilter 
              availableYears={availableYears}
              selectedSeasons={seasons} 
              onSeasonChange={setSeasons} 
              />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {playlists.map((playlist, index) => {
            const winner = playlist.results[0]
            const isSelected = selectedId === playlist.elencoId

            return (
              <div key={playlist.elencoId} className="contents">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => setSelectedId(isSelected ? null : playlist.elencoId)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-800 border-accent shadow-lg shadow-accent/10'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-zinc-500 text-sm">#{playlist.elencoId}</span>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-600" />
                      <span className="text-xs text-zinc-500">{playlist.videoOwner}</span>
                    </div>
                  </div>

                  <div 
                    className="font-condensed font-bold uppercase truncate"
                    style={{ color: getPlayerColor(winner.player) }}
                  >
                    <Trophy className="w-3 h-3 inline mr-1" />
                    {winner.player}
                  </div>
                  <div className="font-mono text-xl font-bold mt-1 text-white">{winner.totalPoints} {config.lowerIsBetter ? 'colpi' : 'pts'}</div>

                  <div className="flex gap-1 mt-2">
                    {playlist.results.slice(0, 5).map((r, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPlayerColor(r.player) }}
                        title={`${r.player}: ${r.totalPoints}`}
                      />
                    ))}
                  </div>
                </motion.div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 mt-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div>
                        <h2 className="font-condensed text-3xl font-black uppercase tracking-tighter text-white">
                          Elenco {playlist.elencoId}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest font-bold">Host:</span>
                          <span className="text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider">{playlist.videoOwner}</span>
                        </div>
                      </div>

                      {playlist.videoTitle && (
                        <div className="flex-1 md:max-w-md">
                          <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest font-bold mb-2">Video Originale</div>
                          <a 
                            href={playlist.videoLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center gap-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl hover:border-red-500/50 transition-all shadow-xl backdrop-blur-sm"
                          >
                            <div className="p-3 bg-red-600/10 rounded-full group-hover:bg-red-600/20 transition-colors">
                              <Youtube className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                                {playlist.videoTitle}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono mt-1 font-bold">
                                <span>WATCH ON YOUTUBE</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </div>
                            </div>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4">Classifica</h3>
                        <div className="space-y-2">
                          {playlist.results.map((result, index) => (
                            <motion.div
                              key={result.player}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/50 border-l-2 hover:bg-zinc-700/50 hover:border-zinc-500/50"
                              style={{ borderLeftColor: getPlayerColor(result.player) }}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700 font-mono font-bold text-sm text-white">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <Link
                                href={`/drivers?player=${normalizePlayerName(result.player)}`}
                                className="font-condensed font-bold hover:opactiy-80 transition--all cursor-pointer block"
                                style={{ color: getPlayerColor(result.player) }}
                                >
                                {/* <div className="font-condensed font-bold" style={{ color: getPlayerColor(result.player) }}> */}
                                  {result.player}
                                </Link>
                                {/* </div> */}
                                <div className="text-xs text-zinc-500 font-mono">
                                  {result.raceScores.join(' + ')}
                                </div>
                              </div>
                              <div className="font-mono text-xl font-bold text-white">{result.totalPoints}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4">Distribuzione</h3>
                        <div className="space-y-3">
                          {playlist.results.map((result, index) => {
                            const maxPoints = Math.max(...playlist.results.map(r => r.totalPoints), 1);
                            const percentage = (result.totalPoints / maxPoints) * 100

                            return (
                              <div key={result.player} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span style={{ color: getPlayerColor(result.player) }} className="font-condensed uppercase">
                                    {result.player}
                                  </span>
                                  <span className="font-mono text-zinc-300">{result.totalPoints}</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: getPlayerColor(result.player) }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      {(() => {
                        const raceEvolutionData: any[] = [];
                        const numRaces = playlist.results[0]?.raceScores.length || 0;
                        const cumulativePoints: Record<string, number> = {};

                        playlist.results.forEach(r => cumulativePoints[r.player] = 0);

                        for (let i = 0; i < numRaces; i++) {
                          const prefix = config.id === 'golf' ? 'B' : 'G';
                          const racePoint: any = { name: `${prefix}${i + 1}` };

                          playlist.results.forEach(r => {
                            cumulativePoints[r.player] += r.raceScores[i] || 0;
                            racePoint[r.player] = cumulativePoints[r.player];
                          });
                          raceEvolutionData.push(racePoint);
                        }
                        
                        return (
                          <div className="md:col-span-2">
                            <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4">Andamento Gara</h3>
                            <div className="h-[350px] w-full bg-zinc-800/20 rounded-xl border border-zinc-800/20 p-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={raceEvolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                  <XAxis 
                                    dataKey="name" 
                                    stroke="#52525b" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#71717a', fontFamily: 'monospace' }}
                                  />
                                  <YAxis 
                                    stroke="#52525b" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#71717a', fontFamily: 'monospace' }}
                                  />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: '#09090b', 
                                      border: '1px solid #27272a',
                                      borderRadius: '8px',
                                      fontSize: '11px',
                                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                    }}
                                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', marginBottom: '4px' }}
                                    itemStyle={{ padding: '2px 0' }}
                                  />
                                  {playlist?.results.slice(0, 7).map((result) => (
                                    <Line
                                      key={result.player}
                                      type="monotone"
                                      dataKey={result.player}
                                      stroke={getPlayerColor(result.player)}
                                      strokeWidth={2}
                                      dot={{ r: 3, fill: getPlayerColor(result.player), strokeWidth: 0 }}
                                      activeDot={{ r: 5, strokeWidth: 0 }}
                                      animationDuration={1500}
                                    />
                                  ))}
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {/* <footer className="border-t border-zinc-800 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">
            {config.title} Dashboard 2026 &copy; Tutti i video e i contenuti sono di proprietà dei rispettivi creatori
          </p>
          <p className="text-zinc-500 text-[10px] font-mono tracking-[0.3em]">
            Si ringrazia @antobeviz per la creazione delle statistiche
          </p>
          <p className="text-zinc-500 text-[10px] font-mono tracking-[0.3em]">
            Ultimo aggiornamento classifica il {config.update}
          </p>
        </div>
      </footer> */}
      <Footer />
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components'
import { parseCSV, getPlaylistData } from '@/lib/data'
import { getPlayerColor } from '@/lib/colors'
import { PlaylistData } from '@/types'
import { motion } from 'framer-motion'
import { Trophy, User, ExternalLink, Youtube } from 'lucide-react'

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const entries = await parseCSV('/sdrogo_corse_stats.csv')
        const playlistData = getPlaylistData(entries)
        setPlaylists(playlistData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

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

  const selectedPlaylist = selectedId !== null 
    ? playlists.find(p => p.elencoId === selectedId) 
    : null

  return (
    <main className="min-h-screen bg-zinc-950 noise-texture pt-20 pb-32 md:pb-8">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-condensed text-3xl font-bold uppercase tracking-wider mb-8">
          Elenchi
        </h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {playlists.map((playlist, index) => {
            const winner = playlist.results[0]
            const isSelected = selectedId === playlist.elencoId
            
            return (
              <motion.div
                key={playlist.elencoId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setSelectedId(isSelected ? null : playlist.elencoId)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-zinc-800 border-racing-red'
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
                <div className="font-mono text-xl font-bold mt-1">{winner.totalPoints} pts</div>
                
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
            )
          })}
        </div>

        {selectedPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="font-condensed text-3xl font-black uppercase tracking-tighter text-white">
                  Elenco {selectedPlaylist.elencoId}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest font-bold">Host:</span>
                  <span className="text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider">{selectedPlaylist.videoOwner}</span>
                </div>
              </div>

              {selectedPlaylist.videoTitle && (
                <div className="flex-1 md:max-w-md">
                  <div className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest font-bold mb-2">Video Originale</div>
                  <a 
                    href={selectedPlaylist.videoLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl hover:border-red-500/50 transition-all shadow-xl backdrop-blur-sm"
                  >
                    <div className="p-3 bg-red-600/10 rounded-full group-hover:bg-red-600/20 transition-colors">
                      <Youtube className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                        {selectedPlaylist.videoTitle}
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
                  {selectedPlaylist.results.map((result, index) => (
                    <motion.div
                      key={result.player}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/50 border-l-2"
                      style={{ borderLeftColor: getPlayerColor(result.player) }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700 font-mono font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-condensed font-bold" style={{ color: getPlayerColor(result.player) }}>
                          {result.player}
                        </div>
                        <div className="text-xs text-zinc-500 font-mono">
                          {result.raceScores.join(' + ')}
                        </div>
                      </div>
                      <div className="font-mono text-xl font-bold">{result.totalPoints}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4">Distribuzione</h3>
                <div className="space-y-3">
                  {selectedPlaylist.results.map((result, index) => {
                    const maxPoints = selectedPlaylist.results[0]?.totalPoints || 100
                    const percentage = (result.totalPoints / maxPoints) * 100
                    
                    return (
                      <div key={result.player} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span style={{ color: getPlayerColor(result.player) }} className="font-condensed uppercase">
                            {result.player}
                          </span>
                          <span className="font-mono">{result.totalPoints}</span>
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
            </div>
          </motion.div>
        )}
      </div>
      <footer className="border-t border-zinc-800 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">
            Sdrogo Corse Dashboard 2026 &copy; Tutti i video e i contenuti sono di proprietà dei rispettivi creatori
          </p>
          <p className="text-zinc-500 text-[10px] font-mono tracking-[0.3em]">
          Si ringrazia @antobeviz per la creazione delle statistiche
          </p>
        </div>
      </footer>
    </main>
  )
}
'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, User, Info, BarChart2, Activity, Youtube, ExternalLink } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { PlaylistData } from '@/types'
import { getPlayerColor } from '@/lib/colors'

interface PlaylistViewerProps {
  playlists: PlaylistData[]
}

export function PlaylistViewer({ playlists }: PlaylistViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = playlists[selectedIndex]

  const maxPointsInPlaylist = selected 
    ? Math.max(...selected.results.map(r => r.totalPoints), 1)
    : 100

  const raceEvolutionData = useMemo(() => {
    if (!selected) return []
    
    const numRaces = Math.max(...selected.results.map(r => r.raceScores.length), 0)
    const data = []
    const cumulativePoints: { [key: string]: number } = {}
    
    selected.results.forEach(result => {
      cumulativePoints[result.player] = 0
    })
    
    for (let i = 0; i < numRaces; i++) {
      const racePoint: { name: string; [key: string]: number | string } = { name: `Gara ${i + 1}` }
      selected.results.forEach(result => {
        cumulativePoints[result.player] += result.raceScores[i] ?? 0
        racePoint[result.player] = cumulativePoints[result.player]
      })
      data.push(racePoint)
    }
    return data
  }, [selected])

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 shadow-xl space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex flex-col">
            <h3 className="font-condensed text-4xl font-black uppercase tracking-tighter text-white">
              Elenco {selected?.elencoId}
            </h3>
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1">
              <User className="w-3 h-3 text-zinc-600" />
              <span>Host: <span className="text-zinc-300 font-bold uppercase tracking-wider">{selected?.videoOwner}</span></span>
            </div>
          </div>

          {selected?.videoTitle && (
            <a 
              href={selected.videoLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-2.5 bg-zinc-950/40 border border-zinc-800 rounded-lg hover:border-red-500/50 transition-all shadow-md max-w-xs md:max-w-sm"
            >
              <div className="p-1.5 bg-red-600/10 rounded-full group-hover:bg-red-600/20 transition-colors">
                <Youtube className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-zinc-300 truncate group-hover:text-white transition-colors">
                  {selected.videoTitle}
                </div>
                <div className="flex items-center gap-1 text-[8px] text-zinc-500 font-mono mt-0.5 font-bold">
                  <span>WATCH ON YOUTUBE</span>
                  <ExternalLink className="w-2 h-2" />
                </div>
              </div>
            </a>
          )}
        </div>
        
        <div className="flex items-center gap-3 self-end lg:self-center">
          <button
            onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
            disabled={selectedIndex === 0}
            className="p-2.5 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md font-mono text-xs font-bold text-zinc-300">
            {selectedIndex + 1} / {playlists.length}
          </div>
          <button
            onClick={() => setSelectedIndex(Math.min(playlists.length - 1, selectedIndex + 1))}
            disabled={selectedIndex === playlists.length - 1}
            className="p-2.5 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 mb-4 text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
            <Info className="w-3.5 h-3.5" />
            Classifica Elenco
          </div>
          {selected?.results.map((result, index) => (
            <motion.div
              key={result.player}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-md bg-zinc-800/30 border border-zinc-700/50 hover:border-zinc-500/50 transition-colors"
              style={{ borderLeftWidth: '3px', borderLeftColor: getPlayerColor(result.player) }}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded bg-zinc-700/50 font-mono font-bold text-xs text-zinc-400">
                {result.position}
              </div>
              <div className="flex-1 min-w-0">
                <div 
                  className="font-condensed font-bold uppercase truncate text-sm tracking-wide"
                  style={{ color: getPlayerColor(result.player) }}
                >
                  {result.player}
                </div>
                <div className="font-mono text-[9px] text-zinc-500 mt-0.5">
                  {result.raceScores.join(' + ') || 'DNF'}
                </div>
              </div>
              <div className="font-mono text-xl font-black text-white">{result.totalPoints}</div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
            <BarChart2 className="w-3.5 h-3.5" />
            Distribuzione Punti
          </div>
          <div className="flex-1 bg-zinc-800/20 border border-zinc-800/50 rounded-xl p-6 min-h-[300px]">
            <div className="h-full flex items-end justify-around gap-2 md:gap-4">
              {selected?.results.slice(0, 10).map((result, index) => {
                const heightPercent = (result.totalPoints / maxPointsInPlaylist) * 100
                const playerColor = getPlayerColor(result.player)
                
                return (
                  <motion.div
                    key={result.player}
                    className="flex flex-col items-center gap-3 flex-1 h-full justify-end group relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="font-mono text-xs font-bold text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity mb-auto">
                      {result.totalPoints}
                    </div>
                    <div 
                      className="w-full rounded-t-sm transition-all duration-700 ease-out relative group-hover:brightness-125 absolute bottom-0 left-0 right-0"
                      style={{ 
                        height: `${heightPercent}%`,
                        backgroundColor: playerColor,
                        boxShadow: `0 0 15px ${playerColor}20`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div 
                      className="text-[9px] font-bold uppercase text-center truncate w-full mt-auto"
                      style={{ color: playerColor }}
                    >
                      {result.player.slice(0, 5)}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-800">
        <div className="flex items-center gap-2 mb-6 text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
          <Activity className="w-3.5 h-3.5" />
          Telemetria Gare
        </div>
        <div className="h-[250px] w-full bg-zinc-800/20 rounded-xl border border-zinc-800/50 p-4">
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
              {selected?.results.slice(0, 7).map((result) => (
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

      <div className="pt-6 border-t border-zinc-800">
        <div className="flex flex-wrap gap-1.5">
          {playlists.map((playlist, index) => (
            <button
              key={playlist.elencoId}
              onClick={() => setSelectedIndex(index)}
              className={`min-w-[32px] h-8 rounded text-[10px] font-bold font-mono transition-all ${
                index === selectedIndex
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                  : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 border border-zinc-700/50'
              }`}
            >
              {playlist.elencoId}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}



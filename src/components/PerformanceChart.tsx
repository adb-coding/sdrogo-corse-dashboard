'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, BarChart2, Activity, Check } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { PlayerStats } from '@/types'
import { getPlayerColor } from '@/lib/colors'
import { motion, AnimatePresence } from 'framer-motion'

interface PerformanceChartProps {
  players: PlayerStats[]
}

type ViewMode = 'punti' | 'posizione'

export function PerformanceChart({ players }: PerformanceChartProps) {
  // Guard against empty players array
  const initialPlayer = players.length > 0 ? players[0].normalizedName : ''
  const [selectedPlayer, setSelectedPlayer] = useState<string>(initialPlayer)
  const [viewMode, setViewMode] = useState<ViewMode>('punti')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const chartData = useMemo(() => {
    if (!selectedPlayer) return []
    const player = players.find(p => p.normalizedName === selectedPlayer)
    if (!player) return []

    if (viewMode === 'punti') {
      return (player.raceScores || []).map((scores, index) => ({
        name: `Elenco ${index + 1}`,
        points: (scores || []).reduce((a, b) => a + b, 0)
      }))
    } else {
      return (player.positions || []).map((pos, index) => ({
        name: `Elenco ${index + 1}`,
        points: pos
      }))
    }
  }, [players, selectedPlayer, viewMode])

  if (players.length === 0) return null

  const playerColor = getPlayerColor(selectedPlayer)
  const yDomain = viewMode === 'posizione' ? [1, Math.max(players.length, 1)] : [0, 'auto']

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h3 className="font-condensed text-3xl font-black uppercase tracking-tighter text-white mb-1">
            Prestazioni
          </h3>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
            Analisi Telemetrica Pilota
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-zinc-800 p-1 rounded-md border border-zinc-700">
            <button
              onClick={() => setViewMode('punti')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                viewMode === 'punti' 
                  ? 'text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              style={viewMode === 'punti' ? { backgroundColor: playerColor } : {}}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              PUNTI
            </button>
            <button
              onClick={() => setViewMode('posizione')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                viewMode === 'posizione' 
                  ? 'text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              style={viewMode === 'posizione' ? { backgroundColor: playerColor } : {}}
            >
              <Activity className="w-3.5 h-3.5" />
              POSIZIONE
            </button>
          </div>

          <div className="relative min-w-[180px]">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-white bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-750 transition-all cursor-pointer uppercase tracking-wider group"
            >
              <span style={{ color: playerColor }}>{selectedPlayer}</span>
              <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {players.map((p) => (
                        <button
                          key={p.normalizedName}
                          onClick={() => {
                            setSelectedPlayer(p.normalizedName)
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800 transition-colors ${
                            selectedPlayer === p.normalizedName ? 'bg-red-500/10' : ''
                          }`}
                        >
                          <span 
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: getPlayerColor(p.normalizedName) }}
                          >
                            {p.normalizedName}
                          </span>
                          {selectedPlayer === p.normalizedName && <Check className="w-3 h-3 text-red-500" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            key={`${selectedPlayer}-${viewMode}`}
            data={chartData} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPointsPerformance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={playerColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={playerColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#52525b" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#71717a', fontFamily: 'monospace' }}
              minTickGap={30}
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#71717a', fontFamily: 'monospace' }}
              reversed={viewMode === 'posizione'}
              domain={yDomain}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#09090b', 
                border: '1px solid #27272a',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              itemStyle={{ color: playerColor, fontWeight: 'bold' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}
              formatter={(value: any) => [
                viewMode === 'posizione' ? `${value}°` : value, 
                viewMode === 'posizione' ? 'Posizione' : 'Punti'
              ]}
            />
            <Area
              type="monotone"
              dataKey="points"
              name={viewMode === 'posizione' ? 'Posizione' : 'Punti'}
              stroke={playerColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPointsPerformance)"
              isAnimationActive={false}
              baseValue={viewMode === 'posizione' ? (yDomain[1] as number) : 0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: playerColor }} />
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
            {viewMode === 'punti' ? 'Punti per Elenco' : 'Posizione Finale per Elenco'}
          </span>
        </div>
      </div>
    </div>
  )
}

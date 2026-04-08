'use client'

import { useState } from 'react'
import { Trophy, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import { PlayerStats } from '@/types'
import { getPlayerColor } from '@/lib/colors'
import { motion } from 'framer-motion'
type SortMetric = 'totalPoints' | 'avgPoints' | 'playlistsWon' | 'playlistsPlayed' | 'winRate' | 'dnfCount' | 'avgPosition'

interface LeaderboardProps {
  players: PlayerStats[]
  onPlayerClick?: (player: PlayerStats) => void
  highlightPlayer?: string
}

export function Leaderboard({ players, onPlayerClick, highlightPlayer }: LeaderboardProps) {
  const [sortMetric, setSortMetric] = useState<SortMetric>('totalPoints')
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (metric: SortMetric) => {
    if (sortMetric === metric) {
      setSortAsc(!sortAsc)
    } else {
      setSortMetric(metric)
      setSortAsc(false)
    }
  }

  const sortedPlayers = [...players].sort((a, b) => {
    const multiplier = sortAsc ? 1 : -1
    
    let comparison = 0
    if (sortMetric === 'winRate') {
      comparison = parseFloat(a.winRate) - parseFloat(b.winRate)
    } else {
      comparison = (a[sortMetric] as number) - (b[sortMetric] as number)
    }
    
    return comparison * multiplier
  })

  const SortIcon = ({ metric }: { metric: SortMetric }) => {
    if (sortMetric !== metric) return <ChevronDown className="w-3 h-3 opacity-20" />
    return sortAsc ? <ChevronUp className="w-3 h-3 text-red-500" /> : <ChevronDown className="w-3 h-3 text-red-500" />
  }

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[800px] md:min-w-[1000px] px-2 md:px-0">
        <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_1fr_0.8fr] gap-2 md:gap-4 px-4 md:px-6 py-3 bg-zinc-900/50 border border-zinc-800 rounded-t-lg text-[10px] md:text-xs uppercase tracking-wider text-zinc-400 font-condensed">
          <button 
            onClick={() => handleSort('totalPoints')}
            className={`flex items-center gap-2 transition-colors hover:text-white ${sortMetric === 'totalPoints' ? 'text-white' : ''}`}
          >
            <span className="text-left flex-1">Pilota / Punti</span>
            <SortIcon metric="totalPoints" />
          </button>
          <button 
            onClick={() => handleSort('avgPoints')}
            className={`flex items-center gap-2 transition-colors hover:text-white justify-center ${sortMetric === 'avgPoints' ? 'text-white' : ''}`}
          >
            <span>Media</span>
            <SortIcon metric="avgPoints" />
          </button>
          <button 
            onClick={() => handleSort('playlistsWon')}
            className={`flex items-center gap-2 transition-colors hover:text-white justify-center ${sortMetric === 'playlistsWon' ? 'text-white' : ''}`}
          >
            <Trophy className="w-3 h-3" />
            <span>Vinte</span>
            <SortIcon metric="playlistsWon" />
          </button>
          <button 
            onClick={() => handleSort('playlistsPlayed')}
            className={`flex items-center gap-2 transition-colors hover:text-white justify-center ${sortMetric === 'playlistsPlayed' ? 'text-white' : ''}`}
          >
            <span>Elenchi</span>
            <SortIcon metric="playlistsPlayed" />
          </button>
          <button 
            onClick={() => handleSort('winRate')}
            className={`flex items-center gap-2 transition-colors hover:text-white justify-center ${sortMetric === 'winRate' ? 'text-white' : ''}`}
          >
            <span>Win %</span>
            <SortIcon metric="winRate" />
          </button>
          <button 
            onClick={() => handleSort('dnfCount')}
            className={`flex items-center gap-2 transition-colors hover:text-white justify-center ${sortMetric === 'dnfCount' ? 'text-white' : ''}`}
          >
            <span>Non Arrivato</span>
            <SortIcon metric="dnfCount" />
          </button>
          <div className="flex items-center gap-2 justify-center">
            <TrendingUp className="w-3 h-3" />
            <span>Form</span>
          </div>
          <button 
            onClick={() => handleSort('avgPosition')}
            className={`flex items-center gap-2 transition-colors hover:text-white justify-end ${sortMetric === 'avgPosition' ? 'text-white' : ''}`}
          >
            <span>Pos. Media</span>
            <SortIcon metric="avgPosition" />
          </button>
        </div>

        <div className="divide-y divide-zinc-800 border-x border-b border-zinc-800 rounded-b-lg overflow-hidden">
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.normalizedName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onPlayerClick?.(player)}
              className={`grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_1fr_0.8fr] gap-2 md:gap-4 px-4 md:px-6 py-4 driver-card cursor-pointer transition-all hover:bg-zinc-800/50 border-l-2 ${
                highlightPlayer === player.normalizedName
                  ? 'bg-red-500/10 border-red-500'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <span className="font-mono text-zinc-600 text-[10px] w-4 shrink-0">#{index + 1}</span>
                <div className="flex items-center gap-2 md:gap-3 min-w-0 overflow-hidden">
                  <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
                    <Image 
                      src={`${player.images[0] || '/assets/marza.png'}`} 
                      alt={player.normalizedName}
                      fill
                      className="rounded-full object-cover border border-zinc-700 shadow-lg"
                    />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-3 min-w-0">
                    <span 
                      className="font-condensed font-bold uppercase truncate text-sm md:text-base"
                      style={{ color: getPlayerColor(player.normalizedName) }}
                    >
                      {player.normalizedName}
                    </span>
                    <span className="font-mono font-black text-xs md:text-sm text-white md:ml-auto bg-zinc-800 md:bg-transparent px-1.5 py-0.5 rounded md:rounded-none w-fit">
                      {player.totalPoints} <span className="text-[8px] text-zinc-500 font-bold md:hidden">PTS</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="font-mono text-center flex items-center justify-center text-zinc-300 text-sm md:text-base">
                {player.avgPoints.toFixed(1)}
              </div>
              <div className="font-mono text-center flex items-center justify-center">
                <span className="text-green-500 font-bold text-sm md:text-base">{player.playlistsWon}</span>
              </div>
              <div className="font-mono text-center flex items-center justify-center text-zinc-400 text-sm md:text-base">
                {player.playlistsPlayed}
              </div>
              <div className="font-mono text-center flex items-center justify-center text-xs md:text-sm">
                {player.winRate}
              </div>
              <div className="font-mono text-center flex items-center justify-center text-xs md:text-sm text-red-400">
                {player.dnfCount}
              </div>
              <div className="flex items-center justify-center">
                <FormIndicator form={player.form} />
              </div>
              <div className="font-mono text-right flex items-center justify-end text-zinc-400 text-sm md:text-base">
                {player.avgPosition.toFixed(1)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FormIndicator({ form }: { form: number[] }) {
  if (!form || form.length === 0) return <span className="text-zinc-600">-</span>
  
  const colors: string[] = form.map(score => {
    if (score >= 40) return 'bg-green-500'
    if (score >= 30) return 'bg-yellow-500'
    if (score >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  })
  
  const displayColors = [...colors]
  while (displayColors.length < 5) {
    displayColors.unshift('bg-zinc-800')
  }
  
  return (
    <div className="flex gap-1">
      {displayColors.slice(-5).map((color, i) => (
        <div 
          key={i} 
          className={`w-1.5 h-4 rounded-full ${color}`}
        />
      ))}
    </div>
  )
}

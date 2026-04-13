'use client'

import { useState } from 'react'
import { Trophy, ChevronDown, Check } from 'lucide-react'
import Image from 'next/image'
import { PlayerStats } from '@/types'
import { getPlayerColor } from '@/lib/colors'
import { motion, AnimatePresence } from 'framer-motion'

type SortMetric = 'totalPoints' | 'avgPoints' | 'playlistsWon' | 'avgPosition' | 'winRate'

interface TopThreeProps {
  players: PlayerStats[]
}

interface PodiumCardProps {
  player: PlayerStats
  rank: number
  color: string
  isWinner?: boolean
  metric: SortMetric
}

const METRIC_CONFIG: Record<SortMetric, { label: string; unit: string; better: 'higher' | 'lower' }> = {
  totalPoints: { label: 'Punti Totali', unit: 'pt', better: 'higher' },
  avgPoints: { label: 'Media Punti', unit: 'pt', better: 'higher' },
  playlistsWon: { label: 'Vittorie', unit: 'W', better: 'higher' },
  avgPosition: { label: 'Pos. Media', unit: '', better: 'lower' },
  winRate: {label: '% Vittorie', unit: '%', better: 'higher'}
}

export function TopThree({ players }: TopThreeProps) {
  const [sortMetric, setSortMetric] = useState<SortMetric>('totalPoints')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const sortedPlayers = [...players].sort((a, b) => {
    const aValue = a[sortMetric] as number
    const bValue = b[sortMetric] as number
    
    if (METRIC_CONFIG[sortMetric].better === 'higher') {
      return bValue - aValue
    } else {
      return aValue - bValue
    }
  })
  
  const top3 = sortedPlayers.slice(0, 3)
  const [first, second, third] = top3
  
  if (top3.length < 3) return null

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 md:mb-12 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center border border-red-500/30 neon-glow-red">
            <Trophy className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="font-condensed text-3xl font-black uppercase tracking-tighter text-white">Podio</h2>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Hall of Fame</p>
          </div>
        </div>
        
        {/* Metric Selector - Hidden on mobile, moved below */}
        <div className="hidden md:block relative">
          <MetricSelector 
            sortMetric={sortMetric} 
            setSortMetric={setSortMetric} 
            isDropdownOpen={isDropdownOpen} 
            setIsDropdownOpen={setIsDropdownOpen} 
          />
        </div>
      </div>
      
      <div className="flex items-end justify-center gap-2 md:gap-4 px-2 md:px-4">
        {second && (
          <div className="flex flex-col items-center gap-3 md:gap-2">
            <PodiumCard 
              key={`rank-2-${second.normalizedName}-${sortMetric}`}
              player={second} 
              rank={2} 
              color={getPlayerColor(second.normalizedName)}
              metric={sortMetric}
            />
            <div className="w-24 md:w-32 h-20 md:h-24 bg-gradient-to-t from-zinc-900 to-zinc-800 border-x border-t border-zinc-800 rounded-t-lg flex items-end justify-center pb-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-zinc-400/5 opacity-10" />
              <span className="font-mono text-4xl font-black text-zinc-700">2</span>
            </div>
          </div>
        )}
        
        {first && (
          <div className="flex flex-col items-center gap-3 md:gap-2 -mt-12">
            <PodiumCard 
              key={`rank-1-${first.normalizedName}-${sortMetric}`}
              player={first} 
              rank={1} 
              color={getPlayerColor(first.normalizedName)}
              isWinner
              metric={sortMetric}
            />
            <div className="w-28 md:w-40 h-32 md:h-40 bg-gradient-to-t from-red-950/40 to-red-900/20 border-x border-t border-red-900/30 rounded-t-lg flex items-end justify-center pb-4 relative overflow-hidden neon-glow-red">
              <div className="absolute inset-0 bg-red-500/5 opacity-20" />
              <div className="flex flex-col items-center relative z-10">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-orange-500 mb-2 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                <span className="font-mono text-5xl md:text-6xl font-black text-white">1</span>
              </div>
            </div>
          </div>
        )}
        
        {third && (
          <div className="flex flex-col items-center gap-3 md:gap-2">
            <PodiumCard 
              key={`rank-3-${third.normalizedName}-${sortMetric}`}
              player={third} 
              rank={3} 
              color={getPlayerColor(third.normalizedName)}
              metric={sortMetric}
            />
            <div className="w-24 md:w-32 h-12 md:h-16 bg-gradient-to-t from-zinc-900 to-zinc-800 border-x border-t border-zinc-800 rounded-t-lg flex items-end justify-center pb-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-900/5 opacity-10" />
              <span className="font-mono text-3xl font-black text-amber-900/50">3</span>
            </div>
          </div>
        )}
      </div>

      {/* Metric Selector for Mobile - Shown only on mobile below podium */}
      <div className="md:hidden mt-8 flex justify-center px-4">
        <MetricSelector 
          sortMetric={sortMetric} 
          setSortMetric={setSortMetric} 
          isDropdownOpen={isDropdownOpen} 
          setIsDropdownOpen={setIsDropdownOpen} 
          fullWidth
        />
      </div>
    </div>
  )
}

function MetricSelector({ 
  sortMetric, 
  setSortMetric, 
  isDropdownOpen, 
  setIsDropdownOpen,
  fullWidth = false
}: { 
  sortMetric: SortMetric; 
  setSortMetric: (m: SortMetric) => void; 
  isDropdownOpen: boolean; 
  setIsDropdownOpen: (o: boolean) => void;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "w-full" : "relative"}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center gap-4 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-all ${fullWidth ? 'w-full' : 'min-w-[200px]'} justify-between group`}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
          {METRIC_CONFIG[sortMetric].label}
        </span>
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
              className={`absolute ${fullWidth ? 'left-0 right-0' : 'right-0'} mt-2 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl z-50 overflow-hidden`}
            >
              {(Object.keys(METRIC_CONFIG) as SortMetric[]).map((metric) => (
                <button
                  key={metric}
                  onClick={() => {
                    setSortMetric(metric)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800 transition-colors ${
                    sortMetric === metric ? 'bg-red-500/10 text-red-500' : 'text-zinc-400'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {METRIC_CONFIG[metric].label}
                  </span>
                  {sortMetric === metric && <Check className="w-3 h-3" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function PodiumCard({ player, rank, color, isWinner, metric }: PodiumCardProps) {
  const { label, unit } = METRIC_CONFIG[metric]
  const metricValue = player[metric] as number

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`w-[110px] md:w-44 p-3 md:p-4 rounded-xl border transition-all duration-500 relative flex flex-col items-center ${
        isWinner 
          ? 'bg-zinc-900/90 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] z-20' 
          : 'bg-zinc-900/60 border-zinc-800 z-10'
      }`}
      style={{ borderBottomColor: color, borderBottomWidth: '5px' }}
    >
      <div className="relative mb-3 md:mb-4">
        <div className="absolute inset-0 rounded-full blur-xl opacity-20" style={{ backgroundColor: color }} />
        <Image 
          src={`${player.images[0] || '/assets/default_avatar.svg'}`}
          alt={player.normalizedName}
          width={112}
          height={112}
          className="w-16 h-16 md:w-28 md:h-28 rounded-full object-cover border-4 border-zinc-800 relative z-10 shadow-2xl"
        />
        {isWinner && (
          <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1 shadow-lg border-2 border-zinc-900 z-20">
            <Trophy className="w-3 h-3 md:w-4 md:h-4 text-white" />
          </div>
        )}
      </div>
      
      <div className="text-center w-full">
        <h3 
          className="font-condensed font-black text-sm md:text-xl uppercase mb-1 truncate px-1"
          style={{ color }}
        >
          {player.normalizedName}
        </h3>
        <div className="font-mono text-xl md:text-4xl font-black mb-0.5 md:mb-1 text-white tracking-tighter">
          {metric === 'avgPosition' ? metricValue.toFixed(1) : metricValue}
          {unit && <span className="text-[8px] md:text-[10px] text-zinc-500 ml-0.5 md:ml-1 font-bold">{unit}</span>}
        </div>
        <div className="text-[8px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 md:mb-4">
          {label}
        </div>
        <div className="flex items-center justify-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-mono text-zinc-500 border-t border-zinc-800/50 pt-2 md:pt-3 w-full">
          <span className="text-green-500 font-bold">{player.playlistsWon}W</span>
          <span className="text-zinc-800">|</span>
          <span>{player.playlistsPlayed}P</span>
        </div>
      </div>
    </motion.div>
  )
}



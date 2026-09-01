'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Trophy, TrendingUp, ChevronDown, ChevronUp, Flag, Target } from 'lucide-react'
import Image from 'next/image'
import { PlayerStats } from '@/types'
import { getPlayerColor } from '@/lib/colors'
import { useGameMode } from '@/lib/game-mode'
import { motion } from 'framer-motion'
import Link from 'next/link'

type SortMetric = 'totalPoints' | 'avgPoints' | 'playlistsWon' | 'playlistsPlayed' | 'winRate' | 'dnfCount' | 'avgPosition' | 'totalVsPar' | 'avgVsPar' | 'holeInOne'

// Metrics that follow the game's scoring direction (low strokes win in golf).
const SCORE_METRICS: SortMetric[] = ['totalPoints', 'avgPoints', 'totalVsPar', 'avgVsPar']

// Total strokes relative to par: +n over, -n under, E even.
const formatVsPar = (v: number): string => (v > 0 ? `+${v}` : v < 0 ? `${v}` : 'E')
const formatAvgVsPar = (v: number): string => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1))
const vsParColor = (v: number): string => (v < 0 ? 'text-green-500' : v > 0 ? 'text-red-400' : 'text-zinc-400')

interface MetricColumn {
  key: SortMetric
  label: string
  icon?: ReactNode
  render: (p: PlayerStats) => ReactNode
}

// Metric columns shown after the name/score column, per game mode.
const RACING_COLUMNS: MetricColumn[] = [
  { key: 'avgPoints', label: 'Media', render: p => p.avgPoints.toFixed(1) },
  { key: 'playlistsWon', label: 'Vinte', icon: <Trophy className="w-3 h-3" />, render: p => <span className="text-green-500 font-bold">{p.playlistsWon}</span> },
  { key: 'playlistsPlayed', label: 'Elenchi', render: p => <span className="text-zinc-400">{p.playlistsPlayed}</span> },
  { key: 'winRate', label: 'Win %', render: p => `${p.winRate}%` },
  { key: 'dnfCount', label: 'Non Arrivato', render: p => <span className="text-red-400">{p.dnfCount}</span> },
]

const GOLF_COLUMNS: MetricColumn[] = [
  { key: 'avgPoints', label: 'Media', render: p => p.avgPoints.toFixed(1) },
  { key: 'playlistsWon', label: 'Vinte', icon: <Trophy className="w-3 h-3" />, render: p => <span className="text-green-500 font-bold">{p.playlistsWon}</span> },
  { key: 'winRate', label: 'Win %', render: p => `${p.winRate}%` },
  { key: 'totalVsPar', label: '+/- Par', icon: <Flag className="w-3 h-3" />, render: p => <span className={`font-bold ${vsParColor(p.totalVsPar)}`}>{formatVsPar(p.totalVsPar)}</span> },
  { key: 'avgVsPar', label: 'Par Media', render: p => <span className={vsParColor(p.avgVsPar)}>{formatAvgVsPar(p.avgVsPar)}</span> },
  { key: 'holeInOne', label: 'Hole in One', icon: <Target className="w-3 h-3" />, render: p => <span className="text-amber-400 font-bold">{p.holeInOne}</span> },
]

interface LeaderboardProps {
  players: PlayerStats[]
  onPlayerClick?: (player: PlayerStats) => void
  highlightPlayer?: string
}

export function Leaderboard({ players, onPlayerClick, highlightPlayer }: LeaderboardProps) {
  const { config } = useGameMode()
  const metricColumns = config.lowerIsBetter ? GOLF_COLUMNS : RACING_COLUMNS
  const showForm = !config.lowerIsBetter
  // Golf's headline metric is average strokes; racing's is total points.
  const defaultMetric: SortMetric = config.lowerIsBetter ? 'avgPoints' : 'totalPoints'
  const [sortMetric, setSortMetric] = useState<SortMetric>(defaultMetric)
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    setSortMetric(defaultMetric)
  }, [defaultMetric])

  const handleSort = (metric: SortMetric) => {
    if (sortMetric === metric) {
      setSortAsc(!sortAsc)
    } else {
      setSortMetric(metric)
      setSortAsc(false)
    }
  }

  const sortedPlayers = [...players].sort((a, b) => {
    let multiplier = sortAsc ? 1 : -1
    // In golf, score metrics rank ascending by default (fewest strokes = best).
    if (config.lowerIsBetter && SCORE_METRICS.includes(sortMetric)) {
      multiplier = -multiplier
    }

    const comparison = (a[sortMetric] as number) - (b[sortMetric] as number)

    return comparison * multiplier
  })

  // First column (name/score) is 1.5fr, the trailing position column 0.8fr,
  // and every metric column in between shares an equal track.
  const gridTemplate = `1.5fr ${metricColumns.map(() => '0.8fr').join(' ')}${showForm ? ' 1fr' : ''} 0.8fr`

  const SortIcon = ({ metric }: { metric: SortMetric }) => {
    if (sortMetric !== metric) return <ChevronDown className="w-3 h-3 opacity-20" />
    return sortAsc ? <ChevronUp className="w-3 h-3 text-accent" /> : <ChevronDown className="w-3 h-3 text-accent" />
  }

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[800px] md:min-w-[1000px] px-2 md:px-0">
        <div
          className="grid gap-2 md:gap-4 px-4 md:px-6 py-3 bg-zinc-900/50 border border-zinc-800 rounded-t-lg text-[10px] md:text-xs uppercase tracking-wider text-zinc-400 font-condensed"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <button
            onClick={() => handleSort('totalPoints')}
            className={`flex items-center gap-2 transition-colors hover:text-white ${sortMetric === 'totalPoints' ? 'text-white' : ''}`}
          >
            <span className="text-left flex-1">{config.playerSingular} / {config.scoreLabel}</span>
            <SortIcon metric="totalPoints" />
          </button>

          {metricColumns.map(col => (
            <button
              key={col.key}
              onClick={() => handleSort(col.key)}
              className={`flex items-center gap-2 transition-colors hover:text-white justify-center ${sortMetric === col.key ? 'text-white' : ''}`}
            >
              {col.icon}
              <span>{col.label}</span>
              <SortIcon metric={col.key} />
            </button>
          ))}

          {showForm && (
            <div className="flex items-center gap-2 justify-center">
              <TrendingUp className="w-3 h-3" />
              <span>Form</span>
            </div>
          )}

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
              // Cap the cascade so long lists don't animate for seconds.
              transition={{ delay: Math.min(index, 10) * 0.03, duration: 0.25 }}
              onClick={() => onPlayerClick?.(player)}
              style={{ gridTemplateColumns: gridTemplate }}
              className={`grid gap-2 md:gap-4 px-4 md:px-6 py-4 driver-card cursor-pointer transition-all hover:bg-zinc-800/50 border-l-2 ${
                highlightPlayer === player.normalizedName
                  ? 'bg-accent/10 border-accent'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <span className="font-mono text-zinc-600 text-[10px] w-4 shrink-0">#{index + 1}</span>
                <div className="flex items-center gap-2 md:gap-3 min-w-0 overflow-hidden">
                  <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
                    <Image
                      src={`${player.images[0] || '/assets/default_avatar.svg'}`}
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
                    <Link
                      href={`/drivers?player=${player.normalizedName}`}
                      className="font-condensed font-bold uppercase tracking-tighter text-sm md:text-base transition-colors block cursor-pointer hover:opacity-80"
                    >
                      {player.normalizedName}
                    </Link>
                    </span>
                    <span className="font-mono font-black text-xs md:text-sm text-white md:ml-auto bg-zinc-800 md:bg-transparent px-1.5 py-0.5 rounded md:rounded-none w-fit">
                      {player.totalPoints} <span className="text-[8px] text-zinc-500 font-bold md:hidden uppercase">{config.scoreLabel}</span>
                    </span>
                  </div>
                </div>
              </div>

              {metricColumns.map(col => (
                <div key={col.key} className="font-mono text-center flex items-center justify-center text-zinc-300 text-xs md:text-sm">
                  {col.render(player)}
                </div>
              ))}

              {showForm && (
                <div className="flex items-center justify-center">
                  <FormIndicator form={player.form} />
                </div>
              )}

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

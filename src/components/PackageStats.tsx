'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Car, Trophy, Gauge } from 'lucide-react'
import { PlaylistData, PackageStat } from '@/types'
import { getPackageStats } from '@/lib/data'
import { getPlayerColor } from '@/lib/colors'
import { useGameMode } from '@/lib/game-mode'

interface PackageStatsProps {
  playlists: PlaylistData[]
}

type Tab = 'tracks' | 'cars'

/**
 * Aggregate view of every circuit and car package across the filtered elenchi:
 * how often each was run, the scoring it produces and who owns it.
 */
export function PackageStats({ playlists }: PackageStatsProps) {
  const { config } = useGameMode()
  const [tab, setTab] = useState<Tab>('tracks')

  const trackStats = useMemo(
    () => getPackageStats(playlists, 'tracks', config.lowerIsBetter),
    [playlists, config.lowerIsBetter]
  )
  const carStats = useMemo(
    () => getPackageStats(playlists, 'cars', config.lowerIsBetter),
    [playlists, config.lowerIsBetter]
  )

  // Racing and golf CSVs carry no track/car columns: render nothing there.
  if (trackStats.length === 0 && carStats.length === 0) return null

  const stats = tab === 'tracks' ? trackStats : carStats
  const unit = config.lowerIsBetter ? 'colpi' : 'pts'

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="font-condensed text-2xl font-bold uppercase tracking-wider text-zinc-300">
            Circuiti e Vetture
          </h2>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">
            {stats.length} {tab === 'tracks' ? 'circuiti' : 'vetture'} sugli elenchi filtrati
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <TabButton active={tab === 'tracks'} onClick={() => setTab('tracks')} disabled={trackStats.length === 0}>
            <MapPin className="w-3 h-3" />
            Circuiti
          </TabButton>
          <TabButton active={tab === 'cars'} onClick={() => setTab('cars')} disabled={carStats.length === 0}>
            <Car className="w-3 h-3" />
            Vetture
          </TabButton>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <PackageCard key={stat.name} stat={stat} index={index} unit={unit} />
        ))}
      </div>
    </section>
  )
}

function TabButton({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
      }`}
    >
      {children}
    </button>
  )
}

function PackageCard({ stat, index, unit }: { stat: PackageStat; index: number; unit: string }) {
  const topWins = stat.wins.slice(0, 3)
  const maxWins = topWins[0]?.wins || 1
  const best = stat.averages[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 10) * 0.03, duration: 0.25 }}
      className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-accent/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-condensed font-black uppercase tracking-tight text-white leading-tight">
          {stat.name}
        </h3>
        <span className="px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">
          {stat.races}x
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Metric label="Media" value={`${stat.avgScore}`} hint={unit} />
        <Metric
          label="In elenchi"
          value={`${stat.playlists}`}
          hint={stat.playlists === 1 ? 'elenco' : 'elenchi'}
        />
      </div>

      {best && (
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2 min-w-0">
          <Gauge className="w-3 h-3 text-zinc-600 shrink-0" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 shrink-0">
            Media top
          </span>
          <span
            className="font-condensed font-bold uppercase text-sm truncate"
            style={{ color: getPlayerColor(best.player) }}
          >
            {best.player}
          </span>
          <span className="font-mono text-[10px] font-bold text-zinc-300 ml-auto shrink-0">{best.avg}</span>
        </div>
      )}

      {topWins.length > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">
            <Trophy className="w-3 h-3 text-accent" />
            Vittorie
          </div>
          {topWins.map(entry => (
            <div key={entry.player} className="flex items-center gap-2">
              <span
                className="font-condensed font-bold uppercase text-xs truncate w-16 shrink-0"
                style={{ color: getPlayerColor(entry.player) }}
              >
                {entry.player}
              </span>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden min-w-0">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(entry.wins / maxWins) * 100}%`,
                    backgroundColor: getPlayerColor(entry.player),
                  }}
                />
              </div>
              <span className="font-mono text-[10px] font-bold text-zinc-400 w-4 text-right shrink-0">
                {entry.wins}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div>
      <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="font-mono text-xl font-black text-white leading-none mt-1">
        {value}
        <span className="text-[9px] font-bold text-zinc-600 ml-1 uppercase tracking-widest">{hint}</span>
      </div>
    </div>
  )
}

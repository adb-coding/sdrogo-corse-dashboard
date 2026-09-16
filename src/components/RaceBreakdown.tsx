'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Car, Trophy, Flag } from 'lucide-react'
import { PlaylistData } from '@/types'
import { getRaceDetails } from '@/lib/data'
import { getPlayerColor, normalizePlayerName } from '@/lib/colors'
import { useGameMode } from '@/lib/game-mode'

interface RaceBreakdownProps {
  playlist: PlaylistData
  /** `['all']` (or empty) means no narrowing */
  selectedTracks?: string[]
  selectedCars?: string[]
  /** Driver to pick out of each race's standings (driver profile view) */
  highlightPlayer?: string
}

const isNeutral = (selection: string[] | undefined): boolean =>
  !selection || selection.length === 0 || selection.includes('all')

/**
 * Race-by-race view of one elenco: each race with the circuit and car package
 * it was run on plus its own standings. Honours the active track/car filters,
 * so picking "Formula 4" leaves only the Formula 4 races of this elenco.
 */
export function RaceBreakdown({ playlist, selectedTracks, selectedCars, highlightPlayer }: RaceBreakdownProps) {
  const { config } = useGameMode()

  const races = useMemo(
    () => getRaceDetails(playlist, config.lowerIsBetter),
    [playlist, config.lowerIsBetter]
  )

  const visible = useMemo(
    () =>
      races.filter(race => {
        const trackOk = isNeutral(selectedTracks) || selectedTracks!.includes(race.track)
        const carOk = isNeutral(selectedCars) || selectedCars!.includes(race.car)
        return trackOk && carOk
      }),
    [races, selectedTracks, selectedCars]
  )

  const filtering = !isNeutral(selectedTracks) || !isNeutral(selectedCars)
  const unit = config.lowerIsBetter ? 'colpi' : 'pts'
  const raceWord = config.lowerIsBetter ? 'Buca' : 'Gara'

  if (races.length === 0) return null

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500">
          Dettaglio {raceWord} per {raceWord}
        </h3>
        {filtering && (
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-accent">
            {visible.length} / {races.length} in filtro
          </span>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-[10px] font-mono uppercase tracking-widest text-zinc-600">
          Nessuna gara con questo circuito / vettura
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((race, i) => {
            const best = race.results[0].score
            const worst = race.results[race.results.length - 1].score
            const span = Math.abs(best - worst) || 1

            return (
              <motion.div
                key={race.index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.25 }}
                className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
                  <Flag className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="font-condensed font-black uppercase tracking-tight text-white">
                    {raceWord} {race.index + 1}
                  </span>
                </div>

                {(race.track || race.car) && (
                  <div className="flex flex-col gap-1.5 py-3">
                    {race.track && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3 h-3 text-zinc-600 shrink-0" />
                        <span className="px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-mono text-[9px] font-bold uppercase tracking-wider truncate">
                          {race.track}
                        </span>
                      </div>
                    )}
                    {race.car && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Car className="w-3 h-3 text-zinc-600 shrink-0" />
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 font-mono text-[9px] font-bold uppercase tracking-wider truncate">
                          {race.car}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  {race.results.map(result => {
                    const color = getPlayerColor(result.player)
                    const isHighlighted =
                      !!highlightPlayer &&
                      normalizePlayerName(result.player) === normalizePlayerName(highlightPlayer)
                    // Bar length is relative to the spread of this single race,
                    // so close finishes stay readable.
                    const share = 30 + (70 * Math.abs(result.score - worst)) / span

                    return (
                      <div
                        key={result.player}
                        className={`flex items-center gap-2 rounded px-1 -mx-1 ${
                          isHighlighted ? 'bg-zinc-800/60' : ''
                        } ${highlightPlayer && !isHighlighted ? 'opacity-60' : ''}`}
                      >
                        <span className="w-4 font-mono text-[10px] font-bold text-zinc-600 shrink-0">
                          {result.position}
                        </span>
                        <span
                          className="font-condensed font-bold uppercase text-xs truncate w-20 shrink-0"
                          style={{ color }}
                        >
                          {result.player}
                        </span>
                        <div className="flex-1 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden min-w-0">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${share}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-white w-10 text-right shrink-0">
                          {result.score}
                        </span>
                        {result.score === best ? (
                          <Trophy className="w-3 h-3 text-accent shrink-0" />
                        ) : (
                          <span className="w-3 shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-800/80 text-[9px] font-mono uppercase tracking-widest text-zinc-600">
                  Miglior risultato {best} {unit}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User, Trophy, Activity, Target, ShieldCheck, X, ExternalLink, Info, ChevronDown, Check, Youtube, Instagram, Twitch } from 'lucide-react'
import { Header } from '@/components'
import { parseCSV, processPlayerStats, getHeadToHead } from '@/lib/data'
import { getPlayerColor } from '@/lib/colors'
import { PlayerStats, RaceEntry } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export default function DriversPage() {
// ... rest of code unchanged until DriverProfile

  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [allEntries, setAllEntries] = useState<RaceEntry[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const entries = await parseCSV('/sdrogo_corse_stats.csv')
        setAllEntries(entries)
        const playerStats = processPlayerStats(entries)
        setPlayers(playerStats)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-64 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
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
        <AnimatePresence mode="wait">
          {!selectedPlayer ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h1 className="font-condensed text-4xl font-black uppercase tracking-tighter text-white">
                    Piloti
                  </h1>
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">
                    Schieramento Ufficiale 2026
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {players.map((player, index) => (
                  <motion.div
                    key={player.normalizedName}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedPlayer(player)}
                    className="group relative overflow-hidden p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-all cursor-pointer shadow-xl hover:shadow-red-500/5"
                    style={{ borderBottomWidth: '4px', borderBottomColor: getPlayerColor(player.normalizedName) }}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full blur-lg opacity-20 transition-opacity group-hover:opacity-40" style={{ backgroundColor: getPlayerColor(player.normalizedName) }} />
                        <Image 
                          src={player.images[0] || '/assets/marza.png'}
                          alt={player.normalizedName}
                          width={120}
                          height={120}
                          className="w-24 h-24 rounded-full object-cover border-2 border-zinc-800 relative z-10 transition-transform group-hover:scale-105"
                        />
                      </div>
                      
                      <div className="text-center relative z-10">
                        <h3 
                          className="font-condensed text-2xl font-black uppercase tracking-tighter mb-1"
                          style={{ color: getPlayerColor(player.normalizedName) }}
                        >
                          {player.normalizedName}
                        </h3>
                        <p className="text-zinc-500 font-mono text-[10px] uppercase font-bold tracking-widest">
                          #{index + 1} Classifica
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-zinc-800/50">
                        <div className="text-center">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">PTS</div>
                          <div className="font-mono text-xs font-black text-white">{player.totalPoints}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">MED</div>
                          <div className="font-mono text-xs font-black text-zinc-400">{player.avgPoints.toFixed(1)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">WIN</div>
                          <div className="font-mono text-xs font-black text-green-500">{player.playlistsWon}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setSelectedPlayer(null)}
                className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors group font-mono text-[10px] uppercase tracking-widest font-bold"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Torna alla griglia piloti
              </button>
              
              <DriverProfile player={selectedPlayer} allPlayers={players} allEntries={allEntries} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <footer className="border-t border-zinc-800 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">
            Sdrogo Corse Dashboard 2026 &copy; Tutti i video e i contenuti sono di proprietà dei rispettivi creatori
          </p>
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">
          Si ringrazia @abyss per la creazione delle statistiche
          </p>
        </div>
      </footer>
    </main>
  )
}

function DriverProfile({ player, allPlayers, allEntries }: { player: PlayerStats; allPlayers: PlayerStats[]; allEntries: RaceEntry[] }) {
  const [selectedElenco, setSelectedElenco] = useState<{ id: number; index: number } | null>(null)
  const [comparisonPlayer, setComparisonPlayer] = useState<PlayerStats | null>(null)
  const [isCompareDropdownOpen, setIsCompareDropdownOpen] = useState(false)

  const SOCIAL_LINKS: Record<string, { yt?: string; ig?: string; twitch?: string }> = {
    Dread: {
      yt: 'https://www.youtube.com/channel/UCUoC4hn4QbU55ZdxzOsKJ_A',
      ig: 'https://www.instagram.com/dreadd',
      twitch: 'https://www.twitch.tv/dread'
    },
    Rohn: {
      yt: 'https://www.youtube.com/user/JustRoHn/featured',
      ig: 'https://www.instagram.com/instarohn',
      twitch: 'https://www.twitch.tv/JRohn7'
    },
    Gabbo: {
      yt: 'https://www.youtube.com/user/GaBBoDSQ',
      ig: 'https://www.instagram.com/gabbodsq',
      twitch: 'https://www.twitch.tv/justgabbo'
    },
    Delux: {
      yt: 'https://www.youtube.com/@oDeluxx',
      ig: 'https://www.instagram.com/odeluxx',
      twitch: 'https://www.twitch.tv/odeluxx'
    },
    Mollu: {
      yt: 'https://www.youtube.com/@mollu',
      ig: 'https://www.instagram.com/mollu_',
      twitch: 'https://www.twitch.tv/mollu'
    },
    JTaz: {
      yt: 'https://www.youtube.com/@jtaz',
      ig: 'https://www.instagram.com/jtaz_',
      twitch: 'https://www.twitch.tv/jtaz'
    },
    Masseo: {
      yt: 'https://www.youtube.com/@ilMasseo',
      ig: 'https://www.instagram.com/ilmasseo',
      twitch: 'https://www.twitch.tv/ilmasseo'
    },
    Marza: {
      yt: 'https://www.youtube.com/@TheRealMarzaa',
      ig: 'https://www.instagram.com/therealmarzaa',
      twitch: 'https://www.twitch.tv/therealmarzaa'
    }
  }

  const social = SOCIAL_LINKS[player.normalizedName] || {}

  const evolutionData = player.raceScores.map((scores, index) => ({
    race: `E${index + 1}`,
    punti: scores.reduce((a, b) => a + b, 0)
  }))

  const multiEvolutionData = useMemo(() => {
    if (!selectedElenco) return { data: [], players: [] }
    
    const elencoId = player.elencoIds[selectedElenco.index]
    const playlistEntries = allEntries.filter(e => e.elencoId === elencoId)
    if (playlistEntries.length === 0) return { data: [], players: [] }
    
    const numRaces = playlistEntries[0].numGare
    const data = []
    const playersInElenco = playlistEntries.map(e => e.giocatore)
    
    const cumulativePoints: { [key: string]: number } = {}
    playersInElenco.forEach(p => {
      cumulativePoints[p] = 0
    })
    
    for (let i = 0; i < numRaces; i++) {
      const racePoint: { name: string; [key: string]: number | string } = { name: `G${i + 1}` }
      playlistEntries.forEach(entry => {
        cumulativePoints[entry.giocatore] += (entry.punteggiSingoleGare || [])[i] || 0
        racePoint[entry.giocatore] = cumulativePoints[entry.giocatore]
      })
      data.push(racePoint)
    }
    
    return { 
      data, 
      players: playersInElenco.sort((a, b) => {
        // Sort players to keep current player on top or highlight
        if (a === player.name) return -1
        if (b === player.name) return 1
        return b.localeCompare(a)
      })
    }
  }, [selectedElenco, player, allEntries])

  const playlistInfo = useMemo(() => {
    if (!selectedElenco) return null
    const elencoId = player.elencoIds[selectedElenco.index]
    const entry = allEntries.find(e => e.elencoId === elencoId)
    return entry || null
  }, [selectedElenco, player, allEntries])

  const totalPlaylistsCount = useMemo(() => {
    const ids = new Set(allEntries.map(e => e.elencoId))
    return ids.size || 1
  }, [allEntries])

  const maxAvgInField = useMemo(() => {
    return Math.max(...allPlayers.map(p => p.avgPoints)) || 1
  }, [allPlayers])

  const { radarData, sdrogoScore, comparisonScore } = useMemo(() => {
    const metrics = [
      { key: 'Potenza', label: 'Potenza', weight: 0.25 },
      { key: 'Media', label: 'Media', weight: 0.25 },
      { key: 'Vittorie', label: 'Vittorie', weight: 0.20 },
      { key: 'Elenchi', label: 'Elenchi', weight: 0.10 },
      { key: 'Piazzam.', label: 'Piazzam.', weight: 0.20 },
    ]

    let totalScore = 0
    let totalCompareScore = 0

    const data = metrics.map(m => {
      const item: any = { metric: m.label }
      
      const calc = (p: PlayerStats) => {
        if (m.key === 'Potenza') return (p.totalPoints / (60 * p.playlistsPlayed)) * 100
        if (m.key === 'Media') return (p.avgPoints / maxAvgInField) * 100
        if (m.key === 'Vittorie') return (p.playlistsWon / p.playlistsPlayed) * 100
        if (m.key === 'Elenchi') return (p.playlistsPlayed / totalPlaylistsCount) * 100
        if (m.key === 'Piazzam.') return Math.max(0, 100 - (p.avgPosition - 1) * 20)
        return 0
      }

      const val = calc(player)
      item.value = val
      totalScore += val * m.weight

      if (comparisonPlayer) {
        const cVal = calc(comparisonPlayer)
        item.compareValue = cVal
        totalCompareScore += cVal * m.weight
      }
      return item
    })

    return { 
      radarData: data, 
      sdrogoScore: Math.round(totalScore), 
      comparisonScore: Math.round(totalCompareScore) 
    }
  }, [player, comparisonPlayer, maxAvgInField, totalPlaylistsCount])

  const rivalries = useMemo(() => {
    return allPlayers
      .filter(p => p.normalizedName !== player.normalizedName)
      .map(rival => {
        const h2h = getHeadToHead(player.normalizedName, rival.normalizedName, allEntries)
        return {
          rival,
          player1Wins: h2h.player1Wins,
          player2Wins: h2h.player2Wins,
          ties: h2h.ties,
          total: h2h.player1Wins + h2h.player2Wins + h2h.ties
        }
      })
      .filter(r => r.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [player, allPlayers, allEntries])

  const playerColor = getPlayerColor(player.normalizedName)
  const rank = allPlayers.findIndex(p => p.normalizedName === player.normalizedName) + 1

  return (
    <div className="space-y-8 pb-20">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/0 via-zinc-900/0 to-white/5 opacity-10" />
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-3xl opacity-30" style={{ backgroundColor: playerColor }} />
          <Image 
            src={player.images[0] || '/assets/marza.png'}
            alt={player.normalizedName}
            width={200}
            height={200}
            className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-zinc-800 relative z-10 shadow-2xl"
          />
          <div className="absolute -bottom-2 -right-2 bg-zinc-900 border-2 border-zinc-800 px-4 py-2 rounded-full font-mono text-xl font-black text-white z-20 shadow-lg">
            #{rank}
          </div>
        </div>

        <div className="text-center md:text-left relative z-10">
          <h1 
            className="font-condensed text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2"
            style={{ color: playerColor }}
          >
            {player.normalizedName}
          </h1>

          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            {social.yt && (
              <a href={social.yt} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-red-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            )}
            {social.twitch && (
              <a href={social.twitch} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-purple-500 transition-colors">
                <Twitch className="w-5 h-5" />
              </a>
            )}
            {social.ig && (
              <a href={social.ig} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-pink-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="px-3 py-1 bg-zinc-800 rounded text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 border border-zinc-700">
              Pro Driver
            </span>
            <span className="px-3 py-1 bg-red-600/10 text-red-500 rounded text-[10px] font-mono font-bold uppercase tracking-widest border border-red-500/20">
              Season 2026
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Punti Totali" value={player.totalPoints} icon={<Target className="w-4 h-4" />} />
        <StatCard label="Media Punti" value={player.avgPoints.toFixed(1)} icon={<Activity className="w-4 h-4" />} />
        <StatCard label="Vittorie" value={player.playlistsWon} icon={<Trophy className="w-4 h-4" />} color="text-green-500" />
        <StatCard label="Elenchi" value={player.playlistsPlayed} icon={<ShieldCheck className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-condensed text-xl font-black uppercase tracking-tighter text-white mb-6">Analisi Punteggio</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="profileGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={playerColor} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={playerColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="race" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontFamily: 'monospace' }} />
                <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#71717a', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="punti"
                  stroke={playerColor}
                  strokeWidth={3}
                  fill="url(#profileGradient)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div id="radar-comparison" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl relative group/radar">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-condensed text-xl font-black uppercase tracking-tighter text-white">Sdrogo Potenziale</h3>
                <div className="flex items-center gap-1.5">
                  <div 
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-sm font-black shadow-inner"
                    style={{ color: playerColor }}
                  >
                    {sdrogoScore}
                  </div>
                  {comparisonPlayer && (
                    <>
                      <span className="text-zinc-600 text-[10px] font-bold">VS</span>
                      <div 
                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-sm font-black shadow-inner"
                        style={{ color: getPlayerColor(comparisonPlayer.normalizedName) }}
                      >
                        {comparisonScore}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mt-0.5">Confronto Telemetrico Piloti</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative min-w-[200px]">
                <button
                  onClick={() => setIsCompareDropdownOpen(!isCompareDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-black text-white bg-zinc-950 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-all cursor-pointer uppercase tracking-widest group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: comparisonPlayer ? getPlayerColor(comparisonPlayer.normalizedName) : '#52525b' }} />
                    <span>{comparisonPlayer ? `CONTRO ${comparisonPlayer.normalizedName}` : 'SELEZIONA SFIDANTE'}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isCompareDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isCompareDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsCompareDropdownOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                          <button
                            onClick={() => {
                              setComparisonPlayer(null)
                              setIsCompareDropdownOpen(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-900 transition-colors border-b border-zinc-900"
                          >
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                              <X className="w-3 h-3 text-zinc-500" />
                            </div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nessun Confronto</span>
                          </button>
                          {allPlayers
                            .filter(p => p.normalizedName !== player.normalizedName)
                            .map((rival) => (
                              <button
                                key={rival.normalizedName}
                                onClick={() => {
                                  setComparisonPlayer(rival)
                                  setIsCompareDropdownOpen(false)
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-900 transition-colors ${
                                  comparisonPlayer?.normalizedName === rival.normalizedName ? 'bg-red-500/5' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Image 
                                    src={rival.images[0] || '/assets/marza.png'}
                                    alt={rival.normalizedName}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full object-cover border border-zinc-800"
                                  />
                                  <span 
                                    className="text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: getPlayerColor(rival.normalizedName) }}
                                  >
                                    {rival.normalizedName}
                                  </span>
                                </div>
                                {comparisonPlayer?.normalizedName === rival.normalizedName && <Check className="w-3 h-3 text-red-500" />}
                              </button>
                            ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-4 w-[1px] bg-zinc-800" />
              
              <div className="relative group/info">
                <Info className="w-4 h-4 text-zinc-500 hover:text-white cursor-help transition-colors" />
                <div className="absolute right-0 top-6 w-64 p-4 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 pointer-events-none">
                  <div className="space-y-3 text-left">
                    <div>
                      <div className="text-[10px] font-black uppercase text-red-500 mb-1">Potenza</div>
                      <p className="text-[9px] text-zinc-400 leading-relaxed font-mono">Efficienza nel catturare i punti disponibili (max 60 per elenco). Formula: (Punti / (60 * Elenchi)) * 100</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-red-500 mb-1">Media</div>
                      <p className="text-[9px] text-zinc-400 leading-relaxed font-mono">Rendimento relativo alla miglior media punti registrata nel campionato.</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-red-500 mb-1">Vittorie</div>
                      <p className="text-[9px] text-zinc-400 leading-relaxed font-mono">Percentuale di vittorie (1° posto) rispetto agli elenchi totali giocati dal pilota.</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-red-500 mb-1">Elenchi</div>
                      <p className="text-[9px] text-zinc-400 leading-relaxed font-mono">Livello di partecipazione totale rispetto a tutti gli elenchi disponibili (30+).</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-red-500 mb-1">Piazzam.</div>
                      <p className="text-[9px] text-zinc-400 leading-relaxed font-mono">Qualità del piazzamento medio. Perde il 20% per ogni posizione oltre la prima.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name={player.normalizedName}
                  dataKey="value"
                  stroke={playerColor}
                  fill={playerColor}
                  fillOpacity={0.4}
                  animationDuration={1500}
                />
                {comparisonPlayer && (
                  <Radar
                    name={comparisonPlayer.normalizedName}
                    dataKey="compareValue"
                    stroke={getPlayerColor(comparisonPlayer.normalizedName)}
                    fill={getPlayerColor(comparisonPlayer.normalizedName)}
                    fillOpacity={0.2}
                    animationDuration={1500}
                  />
                )}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <h3 className="font-condensed text-xl font-black uppercase tracking-tighter text-white mb-6">Analisi Elenchi Singoli</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
          {player.raceScores.map((scores, index) => {
            const total = scores.reduce((a, b) => a + b, 0)
            const elencoId = player.elencoIds[index]
            const isSelected = selectedElenco?.id === elencoId
            return (
              <div
                key={index}
                onClick={() => setSelectedElenco(isSelected ? null : { id: elencoId, index })}
                className={`group flex flex-col items-center p-3 border rounded-lg transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/10' 
                    : 'bg-zinc-800/20 border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700'
                }`}
              >
                <span className={`text-[9px] font-mono font-bold uppercase transition-colors ${
                  isSelected ? 'text-red-400' : 'text-zinc-600 group-hover:text-zinc-400'
                }`}>E{index + 1}</span>
                <span className={`font-mono font-black text-lg transition-colors ${
                  isSelected ? 'text-white' : 'text-white group-hover:text-red-500'
                }`}>{total}</span>
              </div>
            )
          })}
        </div>

        <AnimatePresence>
          {selectedElenco && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 pt-8 border-t border-zinc-800 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-600/10 text-red-500 rounded text-[10px] font-mono font-bold uppercase tracking-widest border border-red-500/20">
                      Telemetria Elenco {selectedElenco.index + 1}
                    </span>
                  </div>
                  <h4 className="text-xl font-black uppercase tracking-tighter text-white leading-tight">
                    {playlistInfo?.videoTitle || 'Analisi Evoluzione Gara'}
                  </h4>
                  {playlistInfo?.videoLink && (
                    <a 
                      href={playlistInfo.videoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 text-zinc-500 hover:text-red-500 transition-colors group text-[10px] font-mono font-bold uppercase tracking-widest"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Guarda il video integrale
                    </a>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {multiEvolutionData.players.slice(0, 5).map(p => (
                    <div key={p} className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950/50 border border-zinc-800 rounded text-[9px] font-bold uppercase tracking-wider">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getPlayerColor(p) }} />
                      <span className="text-zinc-400">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[350px] w-full bg-zinc-950/30 rounded-xl border border-zinc-800/50 p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={multiEvolutionData.data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#52525b" 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717a', fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717a', fontFamily: 'monospace' }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px' }}
                      labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    {multiEvolutionData.players.map((pName) => (
                      <Line
                        key={pName}
                        type="monotone"
                        dataKey={pName}
                        stroke={getPlayerColor(pName)}
                        strokeWidth={pName === player.name ? 4 : 2}
                        opacity={pName === player.name ? 1 : 0.4}
                        dot={pName === player.name ? { r: 4, fill: getPlayerColor(pName) } : false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={1000}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rivalries Section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-condensed text-xl font-black uppercase tracking-tighter text-white">Testa a Testa (H2H)</h3>
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800 px-2 py-1 rounded border border-zinc-700">Rivalità Storiche</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rivalries.map((rivalry) => {
            const rivalColor = getPlayerColor(rivalry.rival.normalizedName)
            const winRate = ((rivalry.player1Wins / rivalry.total) * 100).toFixed(0)
            const isComparing = comparisonPlayer?.normalizedName === rivalry.rival.normalizedName
            
            return (
              <div 
                key={rivalry.rival.normalizedName}
                className={`bg-zinc-950/50 border rounded-xl p-4 flex flex-col gap-4 group transition-all relative overflow-hidden ${
                  isComparing ? 'border-red-500 shadow-lg shadow-red-500/10' : 'border-zinc-800/50 hover:border-zinc-700'
                }`}
              >
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <User className="w-12 h-12" style={{ color: rivalColor }} />
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-md opacity-20" style={{ backgroundColor: rivalColor }} />
                      <Image 
                        src={rivalry.rival.images[0] || '/assets/marza.png'}
                        alt={rivalry.rival.normalizedName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-800 relative z-10"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Contro</div>
                      <div className="font-condensed text-xl font-black uppercase tracking-tighter text-white group-hover:text-red-500 transition-colors leading-tight">
                        {rivalry.rival.normalizedName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Dominio</div>
                    <div className="font-mono text-xl font-black text-white">{winRate}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 relative z-10">
                  <div className="bg-zinc-900/80 rounded-lg p-2 text-center border border-zinc-800/50">
                    <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase mb-1">Vinte</div>
                    <div className="font-mono text-base font-black text-green-500">{rivalry.player1Wins}</div>
                  </div>
                  <div className="bg-zinc-900/80 rounded-lg p-2 text-center border border-zinc-800/50">
                    <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase mb-1">Pari</div>
                    <div className="font-mono text-base font-black text-zinc-400">{rivalry.ties}</div>
                  </div>
                  <div className="bg-zinc-900/80 rounded-lg p-2 text-center border border-zinc-800/50">
                    <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase mb-1">Perse</div>
                    <div className="font-mono text-base font-black text-red-500">{rivalry.player2Wins}</div>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden flex relative z-10">
                  <div 
                    className="h-full bg-green-500 transition-all duration-1000" 
                    style={{ width: `${(rivalry.player1Wins / rivalry.total) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-zinc-700 transition-all duration-1000" 
                    style={{ width: `${(rivalry.ties / rivalry.total) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-red-500 transition-all duration-1000" 
                    style={{ width: `${(rivalry.player2Wins / rivalry.total) * 100}%` }} 
                  />
                </div>
                
                <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-tighter relative z-10">
                  <span>{rivalry.total} Sfide Dirette</span>
                  <button 
                    onClick={() => {
                      setComparisonPlayer(isComparing ? null : rivalry.rival);
                      document.getElementById('radar-comparison')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-1 transition-colors ${isComparing ? 'text-red-500 underline' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {isComparing ? 'Annulla Confronto' : 'Confronta'} <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color = "text-white" }: { label: string; value: string | number; icon: React.ReactNode; color?: string }) {
  return (
    <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-lg hover:border-zinc-700 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-zinc-800 rounded text-zinc-500">
          {icon}
        </div>
        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{label}</div>
      </div>
      <div className={`font-mono text-3xl font-black ${color}`}>
        {value}
      </div>
    </div>
  )
}
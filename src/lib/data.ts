import Papa from 'papaparse'
import { RaceEntry, PlayerStats, PlaylistData, PlaylistResult } from '@/types'
import { normalizePlayerName, getPlayerImage as getPlayerImageFromColors } from './colors'
import { compareScores } from './game-config'

const parseScores = (scoreString: string): number[] => {
  if (!scoreString) return []
  return scoreString.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
}

const getPlayerImage = (normalizedName: string): string | null => {
  return getPlayerImageFromColors(normalizedName)
}

// The golf CSV carries a "PAR" pseudo-player describing the course standard.
// It must never appear in standings; it only serves as the over/under-par baseline.
const isPar = (entry: RaceEntry): boolean => entry.giocatore.trim().toUpperCase() === 'PAR'

/** Map elencoId -> total par strokes for that playlist (0 when no PAR row exists). */
function getParByElenco(entries: RaceEntry[]): Map<number, number> {
  const map = new Map<number, number>()
  for (const entry of entries) {
    if (isPar(entry)) map.set(entry.elencoId, entry.puntiTotali)
  }
  return map
}

const PLAYER_TAGS: Record<string, string[]> = {
  Marza: ['Marzone'],
  Delux: ['Addobboland'],
  Dread: ['Dreddonico Bobby'],
  Gabbo: ['Gabbo Di Smerdaland'],
  Masseo: ['Ghesboro DC'],
  Rohn: ['Just Fucking Just'],
  Mollu: ['Non Pippo Più'],
  JTaz: ['Zugu Titti'],
  Chape: ['King del Tren'],
};

const TEAM_TAGS: Record<string, string[]> = {
  Delux: ['Jurassic Jew'],
  Rohn: ['Nimble Gnomes'],
  Dread: ['Jurassic Jew'],
  Gabbo: ['Jurassic Jew'],
  Masseo: ['Nimble Gnomes']
};

export async function parseCSV(filePath: string): Promise<RaceEntry[]> {
  const response = await fetch(filePath)
  const text = await response.text()
  const cleanText = text.replace(/^\uFEFF/, '')
  
  return new Promise((resolve, reject) => {
    Papa.parse(cleanText, {
      header: true,
      skipEmptyLines: true,
      // Parse off the main thread so large CSVs don't freeze the UI/loader.
      worker: true,
      complete: (results) => {
        const entries: RaceEntry[] = []
        
        for (const row of results.data as Record<string, string>[]) {
          const elencoId = parseInt(row.elenco_id || '', 10)
          const videoOwner = row.video_owner?.trim() || ''
          const giocatore = row.giocatore?.trim() || ''
          const puntiTotali = parseInt(row.punti_totali || '0', 10)
          const numGare = parseInt(row.num_gare || '0', 10)
          const videoTitle = row.titolo?.trim() || ''
          const videoLink = row.link?.trim() || ''
          const uploadDate = row.upload_date?.trim() || ''
          
          if (!isNaN(elencoId) && giocatore) {
            entries.push({
              elencoId,
              videoOwner,
              giocatore,
              puntiTotali,
              punteggiSingoleGare: parseScores(row.punteggi_singole_gare || ''),
              numGare,
              videoTitle,
              videoLink,
              uploadDate
            })
          }
        }
        
        resolve(entries)
      },
      error: reject
    })
  })
}

export function getAvailableYears(entries: RaceEntry[]): string[] {
  const years = new Set<string>()
  entries.forEach(entry => {
    if (entry.uploadDate) {
      const yearMatch = entry.uploadDate.match(/\d{4}/)
      if (yearMatch) {
        years.add(yearMatch[0])
      }
    }
  })
  return Array.from(years).sort((a, b) => b.localeCompare(a))
}

export function filterEntriesBySeason(entries: RaceEntry[], seasons: string[]): RaceEntry[] {
  if (seasons.includes('all') || seasons.length === 0) return entries
  
  return entries.filter(entry => {
    if (!entry.uploadDate) return false
    const yearMatch = entry.uploadDate.match(/\d{4}/)
    if (!yearMatch) return false
    const year = yearMatch[0]
    return seasons.includes(year)
  })
}

export function processPlayerStats(entries: RaceEntry[], minPlaylists: number = 0, lowerIsBetter: boolean = false): PlayerStats[] {
  // PAR is a baseline, not a competitor: keep it for over/under-par math, but
  // exclude it from every ranking computation.
  const parByElenco = getParByElenco(entries)
  const competitors = entries.filter(e => !isPar(e))

  const playerMap = new Map<string, RaceEntry[]>()

  for (const entry of competitors) {
    const normalizedName = normalizePlayerName(entry.giocatore)
    if (!playerMap.has(normalizedName)) {
      playerMap.set(normalizedName, [])
    }
    playerMap.get(normalizedName)!.push(entry)
  }


  const stats: PlayerStats[] = []

  for (const [name, playerEntries] of playerMap) {
    const playerTags = PLAYER_TAGS[name] || [];
    const teamTags = TEAM_TAGS[name] || [];
    const totalPoints = playerEntries.reduce((sum, e) => sum + e.puntiTotali, 0)
    const playlistsPlayed = playerEntries.length
    const totalRaces = playerEntries.reduce((sum, e) => sum + e.numGare, 0)
    const avgPoints = Number((totalPoints / playlistsPlayed).toFixed(2))

    const playlistsWon = playerEntries.filter(e =>
      isWinnerInPlaylist(e.elencoId, e.puntiTotali, competitors, lowerIsBetter)
    ).length

    const winRate = Number(((playlistsWon / playlistsPlayed) * 100).toFixed(1))

    const allScores = playerEntries.map(e => e.punteggiSingoleGare).flat()
    const form = getLast5PlaylistScores(playerEntries)
    const dnfCount = allScores.filter(score => score === 0).length
    const holeInOne = allScores.filter(score => score === 1).length

    // Strokes over/under par per playlist (only where a PAR baseline exists).
    const vsPar = playerEntries.map(e => {
      const par = parByElenco.get(e.elencoId)
      return par === undefined ? 0 : e.puntiTotali - par
    })
    const totalVsPar = vsPar.reduce((a, b) => a + b, 0)
    const avgVsPar = totalRaces > 0 ? Number((totalVsPar / totalRaces).toFixed(2)) : 0

    const positions = calculatePositions(playerEntries, competitors, lowerIsBetter)
    const avgPosition = Number((positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(2))

    const playerImage = getPlayerImage(name)
    const images = playerImage ? [playerImage] : []

    stats.push({
      name: playerEntries[0].giocatore,
      normalizedName: name,
      totalPoints,
      avgPoints,
      playlistsWon,
      playlistsPlayed,
      winRate,
      bestFinish: Math.min(...positions),
      worstFinish: Math.max(...positions),
      avgPosition,
      form,
      raceScores: playerEntries.map(e => e.punteggiSingoleGare),
      positions,
      elencoIds: playerEntries.map(e => e.elencoId),
      totalRaces,
      dnfCount,
      holeInOne,
      totalVsPar,
      avgVsPar,
      vsPar,
      images,
      tag: playerTags,
      team: teamTags
    })
  }
  
  // Racing rewards accumulation (rank by total points). Golf is per-round skill:
  // ranking by total strokes would punish playing more rounds, so rank by average.
  return stats
    .filter(p => p.playlistsPlayed >= minPlaylists)
    .sort((a, b) =>
      lowerIsBetter
        ? compareScores(a.avgPoints, b.avgPoints, true)
        : compareScores(a.totalPoints, b.totalPoints, false)
    )
  }

function isWinnerInPlaylist(elencoId: number, points: number, allEntries: RaceEntry[], lowerIsBetter: boolean = false): boolean {
  const playlistEntries = allEntries.filter(e => e.elencoId === elencoId)
  const scores = playlistEntries.map(e => e.puntiTotali)
  const bestPoints = lowerIsBetter ? Math.min(...scores) : Math.max(...scores)
  return points === bestPoints
}

function calculatePositions(playerEntries: RaceEntry[], allEntries: RaceEntry[], lowerIsBetter: boolean = false): number[] {
  const positions: number[] = []

  for (const entry of playerEntries) {
    const playlistEntries = allEntries.filter(e => e.elencoId === entry.elencoId)
    const sorted = [...playlistEntries].sort((a, b) => compareScores(a.puntiTotali, b.puntiTotali, lowerIsBetter))
    const position = sorted.findIndex(e => e.giocatore === entry.giocatore) + 1
    positions.push(position)
  }

  return positions
}

function getLast5PlaylistScores(playerEntries: RaceEntry[]): number[] {
  const sorted = [...playerEntries].sort((a, b) => a.elencoId - b.elencoId)
  const last5 = sorted.slice(-5)
  return last5.map(e => e.puntiTotali)
}

export function getPlaylistData(entries: RaceEntry[], lowerIsBetter: boolean = false): PlaylistData[] {
  const playlistMap = new Map<number, RaceEntry[]>()

  for (const entry of entries) {
    if (isPar(entry)) continue
    if (!playlistMap.has(entry.elencoId)) {
      playlistMap.set(entry.elencoId, [])
    }
    playlistMap.get(entry.elencoId)!.push(entry)
  }

  const playlists: PlaylistData[] = []
  
  for (const [elencoId, playlistEntries] of playlistMap) {
    const sorted: PlaylistResult[] = [...playlistEntries]
      .sort((a, b) => compareScores(a.puntiTotali, b.puntiTotali, lowerIsBetter))
      .map((e, index) => ({
        player: e.giocatore,
        totalPoints: e.puntiTotali,
        raceScores: e.punteggiSingoleGare,
        position: index + 1
      }))
    
    playlists.push({
      elencoId,
      videoOwner: playlistEntries[0]?.videoOwner || '',
      videoTitle: playlistEntries[0]?.videoTitle || '',
      videoLink: playlistEntries[0]?.videoLink || '',
      results: sorted
    })
  }
  
  return playlists.sort((a, b) => a.elencoId - b.elencoId)
}

export function getPlayerEvolution(playerName: string, entries: RaceEntry[]): { elencoId: number; points: number }[] {
  const normalizedName = normalizePlayerName(playerName)
  const playerEntries = entries.filter(e => normalizePlayerName(e.giocatore) === normalizedName)
  
  return playerEntries
    .sort((a, b) => a.elencoId - b.elencoId)
    .map(e => ({
      elencoId: e.elencoId,
      points: e.puntiTotali
    }))
}

export function getHeadToHead(player1: string, player2: string, entries: RaceEntry[], lowerIsBetter: boolean = false): { player1Wins: number; player2Wins: number; ties: number } {
  const p1Norm = normalizePlayerName(player1)
  const p2Norm = normalizePlayerName(player2)
  
  const playlistMap = new Map<number, RaceEntry[]>()
  for (const entry of entries) {
    if (!playlistMap.has(entry.elencoId)) {
      playlistMap.set(entry.elencoId, [])
    }
    playlistMap.get(entry.elencoId)!.push(entry)
  }
  
  let player1Wins = 0
  let player2Wins = 0
  let ties = 0
  
  for (const [, playlistEntries] of playlistMap) {
    const p1Entry = playlistEntries.find(e => normalizePlayerName(e.giocatore) === p1Norm)
    const p2Entry = playlistEntries.find(e => normalizePlayerName(e.giocatore) === p2Norm)
    
    if (p1Entry && p2Entry) {
      const cmp = compareScores(p1Entry.puntiTotali, p2Entry.puntiTotali, lowerIsBetter)
      if (cmp < 0) player1Wins++       // p1 ranks better
      else if (cmp > 0) player2Wins++  // p2 ranks better
      else ties++
    }
  }
  
  return { player1Wins, player2Wins, ties }
}
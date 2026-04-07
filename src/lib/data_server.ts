import Papa from 'papaparse'
import { readFileSync } from 'fs'
import { RaceEntry, PlayerStats, PlaylistData, PlaylistResult } from '@/types'
import { normalizePlayerName, getPlayerImage as getPlayerImageFromColors } from './colors'

const parseScores = (scoreString: string): number[] => {
  if (!scoreString) return []
  return scoreString.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
}

const getPlayerImage = (normalizedName: string): string | null => {
  return getPlayerImageFromColors(normalizedName)
}

const PLAYER_TAGS: Record<string, string[]> = {
  Marza: ['Marzone'],
  Dread: ['Dreddonico Bobby'],
  Gabbo: ['GabboDiSqualo'],
  Masseo: ['Ghesboro'],
  Rohn: ['Just Fucking Just'],
  Mollu: ['Non Pippo Più'],
  JTaz: ['Titti2']
};

export function parseCSV(): RaceEntry[] {
  const text = readFileSync('public/sdrogo_corse_final.csv', 'utf-8').replace(/^\uFEFF/, '')
  
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    complete: () => {}
  })
  
  const entries: RaceEntry[] = []
  
  for (const row of result.data as Record<string, string>[]) {
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
        videoTitle,
        videoLink,
        giocatore,
        puntiTotali,
        punteggiSingoleGare: parseScores(row.punteggi_singole_gare || ''),
        numGare,
        uploadDate
      })
    }
  }
  
  return entries
}

export function filterEntriesBySeason(entries: RaceEntry[], season: string): RaceEntry[] {
  if (season === 'all') return entries
  
  const years = season.split('-').map(y => parseInt(y))
  
  return entries.filter(entry => {
    if (!entry.uploadDate) return false
    const yearMatch = entry.uploadDate.match(/\d{4}/)
    if (!yearMatch) return false
    const year = parseInt(yearMatch[0])
    return years.includes(year)
  })
}

export function processPlayerStats(entries: RaceEntry[]): PlayerStats[] {
  const playerMap = new Map<string, RaceEntry[]>()
  
  for (const entry of entries) {
    const normalizedName = normalizePlayerName(entry.giocatore)
    if (!playerMap.has(normalizedName)) {
      playerMap.set(normalizedName, [])
    }
    playerMap.get(normalizedName)!.push(entry)
  }
  
  const stats: PlayerStats[] = []
  
  for (const [name, playerEntries] of playerMap) {
    const playerTags = PLAYER_TAGS[name] || [];
    const totalPoints = playerEntries.reduce((sum, e) => sum + e.puntiTotali, 0)
    const playlistsPlayed = playerEntries.length
    const totalRaces = playerEntries.reduce((sum, e) => sum + e.numGare, 0)
    const avgPoints = Number((totalPoints / playlistsPlayed).toFixed(2))
    
    const playlistsWon = playerEntries.filter(e => 
      isWinnerInPlaylist(e.elencoId, e.puntiTotali, entries)
    ).length
    
    const winRate = ((playlistsWon / playlistsPlayed) * 100).toFixed(1) + '%'
    
    const allScores = playerEntries.map(e => e.punteggiSingoleGare).flat()
    const form = getLast5PlaylistScores(playerEntries)
    const dnfCount = allScores.filter(score => score === 0).length
    
    const positions = calculatePositions(playerEntries, entries)
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
      images,
      tag: playerTags
      })
      }
  
  return stats
    .filter(p => p.playlistsPlayed >= 7)
    .sort((a, b) => b.totalPoints - a.totalPoints)
}

function isWinnerInPlaylist(elencoId: number, points: number, allEntries: RaceEntry[]): boolean {
  const playlistEntries = allEntries.filter(e => e.elencoId === elencoId)
  const maxPoints = Math.max(...playlistEntries.map(e => e.puntiTotali))
  return points === maxPoints
}

function calculatePositions(playerEntries: RaceEntry[], allEntries: RaceEntry[]): number[] {
  const positions: number[] = []
  
  for (const entry of playerEntries) {
    const playlistEntries = allEntries.filter(e => e.elencoId === entry.elencoId)
    const sorted = [...playlistEntries].sort((a, b) => b.puntiTotali - a.puntiTotali)
    const normalizedEntryGiocatore = normalizePlayerName(entry.giocatore)
    const position = sorted.findIndex(e => normalizePlayerName(e.giocatore) === normalizedEntryGiocatore) + 1
    positions.push(position)
  }
  
  return positions
}

function getLast5PlaylistScores(playerEntries: RaceEntry[]): number[] {
  const sorted = [...playerEntries].sort((a, b) => a.elencoId - b.elencoId)
  const last5 = sorted.slice(-5)
  return last5.map(e => e.puntiTotali)
}

export function getPlaylistData(entries: RaceEntry[]): PlaylistData[] {
  const playlistMap = new Map<number, RaceEntry[]>()
  
  for (const entry of entries) {
    if (!playlistMap.has(entry.elencoId)) {
      playlistMap.set(entry.elencoId, [])
    }
    playlistMap.get(entry.elencoId)!.push(entry)
  }
  
  const playlists: PlaylistData[] = []
  
  for (const [elencoId, playlistEntries] of playlistMap) {
    const sorted: PlaylistResult[] = [...playlistEntries]
      .sort((a, b) => b.puntiTotali - a.puntiTotali)
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

export function getHeadToHead(player1: string, player2: string, entries: RaceEntry[]): { player1Wins: number; player2Wins: number; ties: number } {
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
      if (p1Entry.puntiTotali > p2Entry.puntiTotali) player1Wins++
      else if (p2Entry.puntiTotali > p1Entry.puntiTotali) player2Wins++
      else ties++
    }
  }
  
  return { player1Wins, player2Wins, ties }
}

export function getProcessedData(season: string = 'all') {
  let entries = parseCSV()
  if (season !== 'all') {
    entries = filterEntriesBySeason(entries, season)
  }
  const players = processPlayerStats(entries)
  const playlists = getPlaylistData(entries)
  
  return { players, playlists, entries }
}

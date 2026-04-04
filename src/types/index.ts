export interface PlayerStats {
  name: string
  normalizedName: string
  totalPoints: number
  avgPoints: number
  playlistsWon: number
  playlistsPlayed: number
  winRate: string
  bestFinish: number
  worstFinish: number
  avgPosition: number
  form: number[]
  raceScores: number[][]
  positions: number[]
  elencoIds: number[]
  totalRaces: number
  dnfCount: number
  images: string[]
  tag: string[]
}

export interface PlaylistData {
  elencoId: number
  videoOwner: string
  videoTitle?: string
  videoLink?: string
  results: PlaylistResult[]
}

export interface PlaylistResult {
  player: string
  totalPoints: number
  raceScores: number[]
  position: number
}

export interface RaceEntry {
  elencoId: number
  videoOwner: string
  videoTitle?: string
  videoLink?: string
  giocatore: string
  puntiTotali: number
  punteggiSingoleGare: number[]
  numGare: number
}

export type SortKey = 'totalPoints' | 'avgPoints' | 'playlistsWon' | 'winRate' | 'playlistsPlayed'
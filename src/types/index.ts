export interface PlayerStats {
  name: string
  normalizedName: string
  totalPoints: number
  avgPoints: number
  playlistsWon: number
  playlistsPlayed: number
  winRate: number
  bestFinish: number
  worstFinish: number
  avgPosition: number
  form: number[]
  raceScores: number[][]
  positions: number[]
  elencoIds: number[]
  totalRaces: number
  dnfCount: number
  /** Golf: holes completed in a single shot (score === 1) */
  holeInOne: number
  /** Golf: total strokes over/under par across all played playlists (negative = under par) */
  totalVsPar: number
  /** Golf: average strokes over/under par per game played */
  avgVsPar: number
  /** Golf: strokes over/under par for each played playlist, aligned with raceScores */
  vsPar: number[]
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
  uploadDate?: string
}

export type SortKey = 'totalPoints' | 'avgPoints' | 'playlistsWon' | 'winRate' | 'playlistsPlayed' | 'totalVsPar' | 'avgVsPar' | 'holeInOne'
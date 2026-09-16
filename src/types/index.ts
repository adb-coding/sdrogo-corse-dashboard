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
  team: string[]
}

export interface PlaylistData {
  elencoId: number
  videoOwner: string
  videoTitle?: string
  videoLink?: string
  /** iRacing: circuit of each race, aligned with raceScores */
  tracks: string[]
  /** iRacing: car package of each race, aligned with raceScores */
  cars: string[]
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
  /** iRacing: circuit of each race, aligned with punteggiSingoleGare */
  tracks: string[]
  /** iRacing: car package of each race, aligned with punteggiSingoleGare */
  cars: string[]
}

export type SortKey = 'totalPoints' | 'avgPoints' | 'playlistsWon' | 'winRate' | 'playlistsPlayed' | 'totalVsPar' | 'avgVsPar' | 'holeInOne'
/** One race inside a playlist, with the circuit and car it was run on. */
export interface RaceDetail {
  /** Position of the race within the playlist (0-based) */
  index: number
  track: string
  car: string
  results: { player: string; score: number; position: number }[]
}

/** Aggregated performance across every race run on one circuit or car package. */
export interface PackageStat {
  name: string
  races: number
  playlists: number
  /** Mean score over every driver-race on this package */
  avgScore: number
  /** Race wins per normalized driver name, best first */
  wins: { player: string; wins: number }[]
  /** Average score per normalized driver name, best first */
  averages: { player: string; avg: number; races: number }[]
}

import { RaceEntry } from '@/types'

export type GameMode = 'racing' | 'golf'

export interface GameConfig {
  id: GameMode
  /** Path to the CSV (same format for both games) */
  csvPath: string
  /** Golf is scored by strokes (lower is better); racing by points (higher is better) */
  lowerIsBetter: boolean
  /** Brand title shown in header / page headings / footer */
  title: string
  subtitle: string
  /** Short brand used for the toggle "logo" */
  brandShort: string
  /** Minimum playlists to appear in the all-time ranking */
  minPlaylistsAllTime: number
  /** Word used where a generic "points" label is shown (e.g. Punti / Colpi) */
  scoreLabel: string
  /** Navigation labels (route paths are shared between games) */
  nav: { home: string; playlists: string; drivers: string }
  /** Singular noun for one competitor (e.g. Pilota / Giocatore) */
  playerSingular: string
  /** Hex accents for Recharts / inline styles (mirror the CSS vars in globals.css) */
  colors: { accent: string; accentSecondary: string }
  // Date of last update of the standing
  update: string
}

export const GAME_CONFIGS: Record<GameMode, GameConfig> = {
  racing: {
    id: 'racing',
    csvPath: '/sdrogo_corse_chronological.csv',
    lowerIsBetter: false,
    title: 'Sdrogo Corse',
    subtitle: 'Statistiche Ufficiali del Campionato',
    brandShort: 'Sdrogo Corse',
    minPlaylistsAllTime: 7,
    scoreLabel: 'Punti',
    nav: { home: 'Classifica', playlists: 'Elenchi', drivers: 'Piloti' },
    playerSingular: 'Pilota',
    colors: { accent: '#ef4444', accentSecondary: '#f97316' },
    update: '10-08-2026'
  },
  golf: {
    id: 'golf',
    csvPath: '/golf_with_friends_grid.csv',
    lowerIsBetter: true,
    title: 'Golfatine',
    subtitle: 'Statistiche Ufficiali del Tour',
    brandShort: 'Golf With Your Friends',
    minPlaylistsAllTime: 5,
    scoreLabel: 'Colpi',
    nav: { home: 'Classifica', playlists: 'Elenchi', drivers: 'Golfisti' },
    playerSingular: 'Golfista',
    colors: { accent: '#22c55e', accentSecondary: '#06b6d4' },
    update: '01-09-2026',
  },
}

/** Bigger total = better for racing, smaller total = better for golf. */
export function compareScores(a: number, b: number, lowerIsBetter: boolean): number {
  return lowerIsBetter ? a - b : b - a
}

export type { RaceEntry }

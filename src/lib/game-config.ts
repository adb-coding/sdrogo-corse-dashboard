import { RaceEntry } from '@/types'

export type GameMode = 'racing' | 'golf' | 'iracing'

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
  /** Logo shown in the game switcher and on the game picker card */
  logo: string
  /** One-liner describing the game on the picker page */
  description: string
  /** Minimum playlists to appear in the all-time ranking */
  minPlaylistsAllTime: number
  /** Word used where a generic "points" label is shown (e.g. Punti / Colpi) */
  scoreLabel: string
  /** Navigation labels (route paths are shared between games) */
  nav: { home: string; playlists: string; drivers: string }
  /** Singular noun for one competitor (e.g. Pilota / Giocatore) */
  playerSingular: string
  /** Hex accents. Single source of truth: applyTheme() writes these into the
   *  --accent / --accent-secondary CSS vars, so every border, text-accent and
   *  glow in the UI follows whatever is set here. */
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
    logo: '/assets/gta5-logo.png',
    description: 'Gare folli su GTA V: elenchi di gare, punti e caos. Il campionato storico delle Sdrogo Corse.',
    minPlaylistsAllTime: 7,
    scoreLabel: 'Punti',
    nav: { home: 'Classifica', playlists: 'Elenchi', drivers: 'Piloti' },
    playerSingular: 'Pilota',
    colors: { accent: '#ef4444', accentSecondary: '#f97316' },
    update: '10-09-2026'
  },
  golf: {
    id: 'golf',
    csvPath: '/golf_with_friends_grid.csv',
    lowerIsBetter: true,
    title: 'Golfatine',
    subtitle: 'Statistiche Ufficiali del Tour',
    brandShort: 'Golf With Your Friends',
    logo: '/assets/golf-logo.png',
    description: 'Golf With Your Friends: 18 buche a colpi, dove vince chi ne fa di meno. Il tour delle Golfatine.',
    minPlaylistsAllTime: 5,
    scoreLabel: 'Colpi',
    nav: { home: 'Classifica', playlists: 'Elenchi', drivers: 'Golfisti' },
    playerSingular: 'Golfista',
    colors: { accent: '#22c55e', accentSecondary: '#06b6d4' },
    update: '09-09-2026',
  },
  iracing: {
    id: 'iracing',
    csvPath: '/iracing.csv',
    lowerIsBetter: false,
    title: 'iRacing',
    subtitle: 'Statistiche Ufficiali del Tour',
    brandShort: 'iRacing Arcade',
    logo: '/assets/iracing-Logo.png',
    description: 'iRacing Arcade: circuiti reali e vetture diverse ad ogni gara. Il campionato piu recente.',
    minPlaylistsAllTime: 1,
    scoreLabel: 'Punti',
    nav: {home: 'Classifica', playlists: 'Elenchi', drivers: 'Piloti'},
    playerSingular: 'Pilota',
    colors: { accent: '#2380eb', accentSecondary: '#df0f0f'},
    update: '16-09-2026'
   },
}

/** '#ef4444' -> '239 68 68', the channel triplet the --accent CSS var expects. */
export function hexToRgbChannels(hex: string): string {
  const clean = hex.replace('#', '').slice(0, 6)
  const int = parseInt(clean, 16)
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`
}

/** Display order of the games in the switcher and on the picker page. */
export const GAME_ORDER: GameMode[] = ['racing', 'golf', 'iracing']

/** Bigger total = better for racing, smaller total = better for golf. */
export function compareScores(a: number, b: number, lowerIsBetter: boolean): number {
  return lowerIsBetter ? a - b : b - a
}

export type { RaceEntry }

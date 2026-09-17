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
    description: 'L\'originale. Il campionato storico delle Sdrogo Corse, con i video storici.',
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
    description: 'Golf With Your Friends: 18 buche, bestemmie infinite. Il tour delle Golfatine.',
    minPlaylistsAllTime: 5,
    scoreLabel: 'Colpi',
    nav: { home: 'Classifica', playlists: 'Elenchi', drivers: 'Golfisti' },
    playerSingular: 'Golfista',
    colors: { accent: '#22c55e', accentSecondary: '#06b6d4' },
    update: '16-09-2026',
  },
  iracing: {
    id: 'iracing',
    csvPath: '/iracing.csv',
    lowerIsBetter: false,
    title: 'iRacing',
    subtitle: 'Statistiche Ufficiali del Tour',
    brandShort: 'iRacing Arcade',
    logo: '/assets/iracing-Logo.png',
    description: 'iRacing Arcade: il futuro delle Sdrogo Corse è qui.',
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

/** localStorage key holding the last picked game. */
export const STORAGE_KEY = 'gameMode'

/**
 * Inline script for <head>, run before first paint: it applies the saved game's
 * theme so the page never flashes the default accent before React hydrates.
 * The palette is serialized from GAME_CONFIGS, so it cannot drift from it.
 */
export function buildThemeBootstrapScript(): string {
  const palette = Object.fromEntries(
    GAME_ORDER.map(id => [
      id,
      [
        hexToRgbChannels(GAME_CONFIGS[id].colors.accent),
        hexToRgbChannels(GAME_CONFIGS[id].colors.accentSecondary),
      ],
    ])
  )

  return `(function(){try{
var p=${JSON.stringify(palette)},k=${JSON.stringify(STORAGE_KEY)};
var m=localStorage.getItem(k);if(!m||!p[m])m=${JSON.stringify(GAME_ORDER[0])};
var r=document.documentElement;r.dataset.theme=m;
r.style.setProperty('--accent',p[m][0]);
r.style.setProperty('--accent-secondary',p[m][1]);
}catch(e){}})();`
}

/** Bigger total = better for racing, smaller total = better for golf. */
export function compareScores(a: number, b: number, lowerIsBetter: boolean): number {
  return lowerIsBetter ? a - b : b - a
}

export type { RaceEntry }

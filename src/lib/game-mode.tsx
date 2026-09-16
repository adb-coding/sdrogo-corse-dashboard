'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { GameMode, GameConfig, GAME_CONFIGS, GAME_ORDER, hexToRgbChannels } from './game-config'

interface GameModeContextValue {
  mode: GameMode
  config: GameConfig
  setMode: (mode: GameMode) => void
  toggleMode: () => void
}

const GameModeContext = createContext<GameModeContextValue | undefined>(undefined)

const STORAGE_KEY = 'gameMode'

function applyTheme(mode: GameMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset.theme = mode
  // Push the config's hex accents into the CSS vars every accent-coloured
  // border/text/glow reads, so editing GAME_CONFIGS re-skins the whole UI.
  const { accent, accentSecondary } = GAME_CONFIGS[mode].colors
  root.style.setProperty('--accent', hexToRgbChannels(accent))
  root.style.setProperty('--accent-secondary', hexToRgbChannels(accentSecondary))
}

export function GameModeProvider({ children }: { children: React.ReactNode }) {
  // Default to racing on first render to keep SSR/CSR markup stable.
  const [mode, setModeState] = useState<GameMode>('racing')

  // Hydrate the saved choice once on mount.
  useEffect(() => {
    const saved = (typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) as GameMode | null)
      : null)
    if (saved && saved in GAME_CONFIGS) {
      setModeState(saved)
      applyTheme(saved)
    } else {
      applyTheme('racing')
    }
  }, [])

  const setMode = useCallback((next: GameMode) => {
    setModeState(next)
    applyTheme(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next)
    }
  }, [])

  // Cycles through every game in order; the header dropdown is the main
  // selector, this stays for keyboard/legacy callers.
  const toggleMode = useCallback(() => {
    const next = GAME_ORDER[(GAME_ORDER.indexOf(mode) + 1) % GAME_ORDER.length]
    setMode(next)
  }, [mode, setMode])

  const value: GameModeContextValue = {
    mode,
    config: GAME_CONFIGS[mode],
    setMode,
    toggleMode,
  }

  return <GameModeContext.Provider value={value}>{children}</GameModeContext.Provider>
}

export function useGameMode(): GameModeContextValue {
  const ctx = useContext(GameModeContext)
  if (!ctx) {
    throw new Error('useGameMode must be used within a GameModeProvider')
  }
  return ctx
}

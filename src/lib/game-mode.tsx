'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { GameMode, GameConfig, GAME_CONFIGS } from './game-config'

interface GameModeContextValue {
  mode: GameMode
  config: GameConfig
  setMode: (mode: GameMode) => void
  toggleMode: () => void
}

const GameModeContext = createContext<GameModeContextValue | undefined>(undefined)

const STORAGE_KEY = 'gameMode'

function applyTheme(mode: GameMode) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = mode
  }
}

export function GameModeProvider({ children }: { children: React.ReactNode }) {
  // Default to racing on first render to keep SSR/CSR markup stable.
  const [mode, setModeState] = useState<GameMode>('racing')

  // Hydrate the saved choice once on mount.
  useEffect(() => {
    const saved = (typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) as GameMode | null)
      : null)
    if (saved === 'racing' || saved === 'golf') {
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

  const toggleMode = useCallback(() => {
    setMode(mode === 'racing' ? 'golf' : 'racing')
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

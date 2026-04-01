export const PLAYER_COLORS: Record<string, string> = {
  Dread: "#ec4899",
  Gabbo: "#f97316",
  Delux: "#22c55e",
  Rohn: "#ef4444",
  Mollu: "#a855f7",
  Masseo: "#3b82f6",
  JTaz: "#78350f",
  Marza: "#fbbf24",
}

export const PLAYER_IMAGES: Record<string, string> = {
  Dread: '/assets/dread.png',
  Gabbo: '/assets/gabbo.png',
  Delux: '/assets/delux.png',
  Rohn: '/assets/rohn.png',
  Mollu: '/assets/mollu.png',
  Masseo: '/assets/masseo.png',
  JTaz: '/assets/jtaz.png',
  Marza: '/assets/marza.png',
}

export const getPlayerColor = (name: string): string => {
  const normalizedName = normalizePlayerName(name)
  return PLAYER_COLORS[normalizedName] || "#71717a"
}

export const getPlayerImage = (name: string): string | null => {
  const normalizedName = normalizePlayerName(name)
  return PLAYER_IMAGES[normalizedName] || null
}

export const normalizePlayerName = (name: string): string => {
  const normalizedName = name.trim()
  const lower = normalizedName.toLowerCase()
  if (lower === 'jtaz') return 'JTaz'
  if (lower.includes('just rohn') || lower === 'rohn') return 'Rohn'
  return normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1).toLowerCase()
}

export const PLAYER_NAMES = ['Dread', 'Gabbo', 'Delux', 'Rohn', 'Mollu', 'Masseo', 'JTaz', 'Marza'] as const
export type PlayerName = typeof PLAYER_NAMES[number]
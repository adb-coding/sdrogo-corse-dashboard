import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          900: '#18181b',
          950: '#09090b',
          800: '#27272a',
        },
        racing: {
          red: '#ef4444',
          orange: '#f97316',
        },
        player: {
          dread: '#ec4899',
          gabbo: '#f97316',
          delux: '#22c55e',
          rohn: '#ef4444',
          mollu: '#a855f7',
          masseo: '#3b82f6',
          jtaz: '#78350f',
          marza: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
        condensed: ['Roboto Condensed', 'sans-serif'],
      },
      boxShadow: {
        'neon-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'neon-orange': '0 0 20px rgba(249, 115, 22, 0.5)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
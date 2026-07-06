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
        // Themeable accents driven by CSS vars in globals.css ([data-theme]).
        // Channel-triplet vars let Tailwind opacity modifiers (e.g. bg-accent/10) work.
        accent: 'rgb(var(--accent) / <alpha-value>)',
        accentSecondary: 'rgb(var(--accent-secondary) / <alpha-value>)',
        player: {
          dread: '#ec4899',
          gabbo: '#f97316',
          delux: '#22c55e',
          rohn: '#ef4444',
          mollu: '#a855f7',
          masseo: '#3b82f6',
          jtaz: '#78350f',
          marza: '#fbbf24',
          blur: '#830b0be0',
          zano: '#1c1e9ebd',
          zamp: '#18afddef',
          frax: '#412005ee',
          johnny: '#e6dddd',
          hila: '#db4ee7ec',
          chape: '#17d6adec',
          fava: '#8f7900d3',
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
        'neon-accent': '0 0 20px rgb(var(--accent) / 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f172a',
        panel: '#111827',
        panelSoft: '#1e293b',
        accent: '#38bdf8',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        keyword: '#a855f7',
        identifier: '#22d3ee',
        literal: '#4ade80',
        operator: '#fb923c'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56, 189, 248, 0.18), 0 18px 50px rgba(2, 6, 23, 0.45)',
        soft: '0 10px 30px rgba(15, 23, 42, 0.45)'
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.9' }
        }
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite'
      }
    }
  },
  plugins: []
} satisfies Config;

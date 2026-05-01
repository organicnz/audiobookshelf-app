import type { Config } from 'tailwindcss'

export default {
  // Enable dark mode via a CSS class on the <html> element
  darkMode: 'class',

  content: ['./components/**/*.{js,vue,ts}', './layouts/**/*.vue', './pages/**/*.vue', './plugins/**/*.{js,ts}', './app.vue', './error.vue'],

  theme: {
    extend: {
      colors: {
        // Primary palette — slate
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        // Accent palette — indigo
        accent: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b'
        },
        // App background (dark theme)
        background: {
          dark: '#1a1a2e',
          'dark-secondary': '#16213e',
          'dark-tertiary': '#0f3460'
        }
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },

      screens: {
        xs: '475px'
      }
    }
  },

  plugins: []
} satisfies Config

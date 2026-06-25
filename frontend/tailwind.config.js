/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        garden: {
          bg: '#0a0f0d',
          surface: '#111712',
          surface2: '#182019',
          border: '#1e2b1f',
          border2: '#2a3d2b',
          accent: '#4ade80',
          'accent-dim': '#22c55e33',
          accent2: '#86efac',
          text: '#e2f0e4',
          muted: '#6b8f6e',
          dim: '#3d5c3f',
        },
        role: {
          engineer: '#60a5fa',
          data: '#f59e0b',
          architect: '#c084fc',
          lead: '#fb7185',
        },
      },
    },
  },
  plugins: [],
}

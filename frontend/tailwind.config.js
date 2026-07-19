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
          bg: 'rgb(var(--g-bg) / <alpha-value>)',
          surface: 'rgb(var(--g-surface) / <alpha-value>)',
          surface2: 'rgb(var(--g-surface2) / <alpha-value>)',
          border: 'rgb(var(--g-border) / <alpha-value>)',
          border2: 'rgb(var(--g-border2) / <alpha-value>)',
          accent: 'rgb(var(--g-accent) / <alpha-value>)',
          accent2: 'rgb(var(--g-accent2) / <alpha-value>)',
          text: 'rgb(var(--g-text) / <alpha-value>)',
          muted: 'rgb(var(--g-muted) / <alpha-value>)',
          dim: 'rgb(var(--g-dim) / <alpha-value>)',
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

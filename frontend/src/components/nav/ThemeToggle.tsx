import { useState } from 'react'

interface Props {
  showLabel?: boolean
}

export function ThemeToggle({ showLabel = false }: Props) {
  const [light, setLight] = useState(() => document.documentElement.classList.contains('light'))

  const toggle = () => {
    const next = !light
    setLight(next)
    document.documentElement.classList.toggle('light', next)
    localStorage.setItem('theme', next ? 'light' : 'dark')
  }

  return (
    <button
      className="flex items-center gap-2 text-garden-dim hover:text-garden-text p-1.5 rounded hover:bg-garden-surface2 transition-all"
      onClick={toggle}
      title={light ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {light ? (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 107 7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11L3.05 3.05" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )}
      {showLabel && <span className="text-sm">{light ? 'Dark mode' : 'Light mode'}</span>}
    </button>
  )
}

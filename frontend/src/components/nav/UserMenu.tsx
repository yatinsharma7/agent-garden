import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

interface Props {
  collapsed?: boolean
}

const USER = { name: 'Yatin', email: 'yatin123@gmail.com' }

export function UserMenu({ collapsed = false }: Props) {
  const [open, setOpen] = useState(false)
  const [light, setLight] = useState(() => document.documentElement.classList.contains('light'))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleTheme = () => {
    const next = !light
    setLight(next)
    document.documentElement.classList.toggle('light', next)
    localStorage.setItem('theme', next ? 'light' : 'dark')
  }

  return (
    <div ref={ref} className="relative">
      {/* Popup menu */}
      {open && (
        <div className={clsx(
          'absolute bottom-full mb-2 bg-garden-surface2 border border-garden-border2 rounded-xl shadow-2xl overflow-hidden z-50',
          collapsed ? 'left-0 w-[220px]' : 'left-0 right-0'
        )}>
          <div className="px-4 py-3 border-b border-garden-border">
            <div className="text-sm font-medium text-garden-text">{USER.name}</div>
            <div className="font-mono text-[10px] text-garden-muted mt-0.5 truncate">{USER.email}</div>
          </div>

          <div className="py-1">
            <button
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-garden-muted hover:bg-garden-surface hover:text-garden-text transition-all"
              onClick={toggleTheme}
            >
              {light ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 107 7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11L3.05 3.05" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              )}
              <span className="flex-1 text-left">{light ? 'Dark mode' : 'Light mode'}</span>
              <span className={clsx(
                'w-7 h-4 rounded-full relative transition-colors flex-shrink-0',
                light ? 'bg-garden-accent' : 'bg-garden-border2'
              )}>
                <span className={clsx(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-garden-bg transition-all',
                  light ? 'left-3.5' : 'left-0.5'
                )} />
              </span>
            </button>

            <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-garden-dim cursor-not-allowed" disabled>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M13.3 10a1.2 1.2 0 00.24 1.32l.04.05a1.45 1.45 0 11-2.06 2.06l-.04-.05a1.2 1.2 0 00-1.32-.24 1.2 1.2 0 00-.73 1.1v.13a1.45 1.45 0 11-2.9 0v-.07A1.2 1.2 0 005.8 13.2a1.2 1.2 0 00-1.32.24l-.05.04a1.45 1.45 0 11-2.06-2.06l.05-.04a1.2 1.2 0 00.24-1.32 1.2 1.2 0 00-1.1-.73h-.13a1.45 1.45 0 110-2.9h.07A1.2 1.2 0 002.8 5.8a1.2 1.2 0 00-.24-1.32l-.04-.05a1.45 1.45 0 112.06-2.06l.04.05a1.2 1.2 0 001.32.24h.06a1.2 1.2 0 00.73-1.1v-.13a1.45 1.45 0 112.9 0v.07a1.2 1.2 0 00.73 1.1 1.2 1.2 0 001.32-.24l.05-.04a1.45 1.45 0 112.06 2.06l-.05.04a1.2 1.2 0 00-.24 1.32v.06a1.2 1.2 0 001.1.73h.13a1.45 1.45 0 110 2.9h-.07a1.2 1.2 0 00-1.1.73z" stroke="currentColor" strokeWidth="1.1"/>
              </svg>
              <span className="flex-1 text-left">Account settings</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-garden-border text-garden-dim">Soon</span>
            </button>
          </div>
        </div>
      )}

      {/* Trigger */}
      <button
        className={clsx(
          'w-full flex items-center gap-2.5 rounded-lg hover:bg-garden-surface2 transition-all',
          collapsed ? 'justify-center py-2' : 'px-2 py-2'
        )}
        onClick={() => setOpen(v => !v)}
      >
        <div className="w-7 h-7 rounded-full bg-garden-accent/15 border border-garden-accent/30 flex items-center justify-center font-mono text-[11px] font-semibold text-garden-accent flex-shrink-0">
          {USER.name[0]}
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-garden-text truncate">{USER.name}</div>
            </div>
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={clsx('text-garden-dim transition-transform flex-shrink-0', open && 'rotate-180')}
            >
              <path d="M3 7.5L6 4.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </>
        )}
      </button>
    </div>
  )
}

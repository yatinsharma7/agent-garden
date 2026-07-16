import { useLocation } from 'react-router-dom'

interface Props {
  onAdd: () => void
}

export function BottomNav({ onAdd }: Props) {
  const { pathname } = useLocation()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-garden-surface border-t border-garden-border flex items-stretch h-[60px]">
      <a
        href="/"
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
          pathname === '/' ? 'text-garden-accent' : 'text-garden-dim'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 10L10 3l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 8v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-mono text-[9px] tracking-wide">GARDEN</span>
      </a>

      <button
        className="flex-1 flex flex-col items-center justify-center gap-0.5 text-garden-dim"
        onClick={onAdd}
      >
        <div className="w-8 h-8 rounded-full bg-garden-accent flex items-center justify-center mb-0.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="#0a0f0a" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </button>

      <a
        href="/integrations"
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
          pathname === '/integrations' ? 'text-garden-accent' : 'text-garden-dim'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M13 7H7a2 2 0 00-2 2v4a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 7V5a2 2 0 114 0v2M6 7V5a2 2 0 10-4 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="font-mono text-[9px] tracking-wide">CONNECT</span>
      </a>
    </div>
  )
}

import { Link } from 'react-router-dom'

interface Props {
  current: 'garden' | 'console'
}

export function ViewToggle({ current }: Props) {
  const tab = (active: boolean) =>
    `font-mono text-[9px] tracking-widest px-3 py-1.5 rounded-md transition-colors ${
      active
        ? 'bg-garden-surface2 text-garden-accent border border-garden-border2'
        : 'text-garden-muted border border-transparent hover:text-garden-text'
    }`

  return (
    <div className="flex items-center gap-0.5 bg-garden-surface border border-garden-border rounded-lg p-0.5">
      <Link to="/" className={tab(current === 'garden')}>GARDEN</Link>
      <Link to="/console" className={tab(current === 'console')}>CONSOLE</Link>
    </div>
  )
}

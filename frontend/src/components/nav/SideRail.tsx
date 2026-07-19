import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useGardenStore } from '@/lib/store'
import { UserMenu } from './UserMenu'
import clsx from 'clsx'

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Garden',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M3 10L10 3l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 8v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: '/console',
    label: 'Console',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M4.5 6.5l2 2-2 2M8.5 10.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: '/integrations',
    label: 'Integrations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10.5 5.5H5.5a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 001.5 1.5h5a1.5 1.5 0 001.5-1.5V7a1.5 1.5 0 00-1.5-1.5z" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M8 5.5V4a1.5 1.5 0 113 0v1.5M5 5.5V4a1.5 1.5 0 10-3 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export function SideRail() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { teams, agents, activeTeamId, setActiveTeam, openTeamModal } = useGardenStore()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('railCollapsed') === 'true')

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('railCollapsed', String(next))
  }

  const totalActive = agents.filter(a => a.status === 'thinking').length

  const selectTeam = (id: string | null) => {
    setActiveTeam(id)
    if (pathname !== '/') navigate('/')
  }

  return (
    <div className={clsx(
      'hidden md:flex flex-col bg-garden-surface border-r border-garden-border flex-shrink-0 overflow-hidden transition-all duration-200',
      collapsed ? 'w-[56px]' : 'w-[240px]'
    )}>

      {/* Logo + collapse */}
      <div className={clsx('flex items-center h-[52px] border-b border-garden-border flex-shrink-0', collapsed ? 'justify-center' : 'justify-between px-4')}>
        {!collapsed && (
          <Link to="/" className="font-mono text-sm font-semibold text-garden-accent tracking-widest whitespace-nowrap">
            AGENT<span className="text-garden-muted font-normal">GARDEN</span>
          </Link>
        )}
        <button
          className="text-garden-dim hover:text-garden-text p-1.5 rounded hover:bg-garden-surface2 transition-all"
          onClick={toggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M6 2.5v11" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <div className={clsx('py-3 flex flex-col gap-0.5', collapsed ? 'px-2' : 'px-3')}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              onClick={() => { if (item.path === '/') setActiveTeam(null) }}
              className={clsx(
                'flex items-center gap-2.5 rounded-md transition-all',
                collapsed ? 'justify-center py-2.5' : 'px-2.5 py-2',
                active
                  ? 'bg-garden-accent/10 text-garden-accent'
                  : 'text-garden-muted hover:bg-garden-surface2 hover:text-garden-text'
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-sm flex-1 whitespace-nowrap">{item.label}</span>}
              {!collapsed && item.path === '/console' && totalActive > 0 && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-garden-accent">
                  <span className="w-1.5 h-1.5 rounded-full bg-garden-accent animate-pulse" />
                  {totalActive}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Teams — expanded only */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto border-t border-garden-border p-3">
          <div className="font-mono text-[10px] font-semibold text-garden-dim tracking-widest uppercase mb-2 px-1">Teams</div>
          {teams.map(t => (
            <div
              key={t.id}
              className={clsx(
                'flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer mb-0.5 border',
                activeTeamId === t.id && pathname === '/' ? 'bg-garden-accent/10 border-garden-border2' : 'border-transparent hover:bg-garden-surface2'
              )}
              onClick={() => selectTeam(t.id)}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
              <span className="text-sm flex-1 truncate">{t.name}</span>
              <span className="font-mono text-[10px] text-garden-muted">{agents.filter(a => a.team_id === t.id).length}</span>
            </div>
          ))}
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer text-garden-dim text-sm border border-dashed border-garden-border hover:border-garden-accent hover:text-garden-accent transition-all mt-1"
            onClick={openTeamModal}
          >
            <span>＋</span><span>New Team</span>
          </div>
        </div>
      )}

      {/* Collapsed spacer + active dot */}
      {collapsed && (
        <div className="flex-1 flex flex-col justify-end items-center gap-3 pb-2">
          {totalActive > 0 && (
            <span title={`${totalActive} active`} className="w-2 h-2 rounded-full bg-garden-accent animate-pulse" />
          )}
        </div>
      )}

      {/* Footer — user menu */}
      <div className={clsx('border-t border-garden-border py-2 flex-shrink-0', collapsed ? 'px-1.5' : 'px-3')}>
        <UserMenu collapsed={collapsed} />
      </div>
    </div>
  )
}

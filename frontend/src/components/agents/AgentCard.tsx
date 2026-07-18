import { useState } from 'react'
import { createPortal } from 'react-dom'
import { type Agent, type Team } from '@/types'
import { ROLE_COLORS, ROLE_EMOJIS } from '@/lib/constants'
import { getModel } from '@/lib/models'
import { useGardenStore } from '@/lib/store'
import { AgentSettings } from './AgentSettings'
import clsx from 'clsx'

interface Props {
  agent: Agent
  team: Team
  lastMessage?: string
}

export function AgentCard({ agent, team, lastMessage }: Props) {
  const { activeAgentId, openPanel } = useGardenStore()
  const isActive = activeAgentId === agent.id
  const [showSettings, setShowSettings] = useState(false)
  const roleColor = ROLE_COLORS[agent.role] || '#6b8f6e'
  const emoji = ROLE_EMOJIS[agent.role] || '🤖'

  const statusLabel = agent.status === 'thinking' ? 'thinking' : agent.status === 'done' ? 'responded' : agent.status === 'error' ? 'error' : 'idle'

  return (
    <div
      data-no-dnd
      className={clsx(
        'bg-garden-bg border rounded-md p-3 transition-all',
        isActive ? 'border-garden-accent' : 'border-garden-border hover:border-garden-border2 hover:-translate-y-px'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center text-base flex-shrink-0 border"
          style={{ background: `${team.color}18`, borderColor: `${team.color}33` }}
        >
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-garden-text truncate">{agent.name}</div>
          <div
            className="text-xs font-mono font-medium px-1.5 py-0.5 rounded inline-block mt-0.5"
            style={{ background: `${roleColor}18`, color: roleColor }}
          >
            {agent.role}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-garden-dim': agent.status === 'idle',
          'bg-garden-accent animate-pulse': agent.status === 'thinking',
          'bg-green-500': agent.status === 'done',
          'bg-red-500': agent.status === 'error',
        })} />
        <span className="text-xs text-garden-muted">{statusLabel}</span>
      </div>

      {/* Last message / specialty */}
      <div className={clsx(
        'text-xs rounded px-2 py-1.5 min-h-[36px] leading-relaxed bg-garden-surface border border-garden-border',
        lastMessage ? 'text-garden-text' : 'text-garden-muted italic'
      )}>
        {lastMessage
          ? lastMessage.slice(0, 100) + (lastMessage.length > 100 ? '…' : '')
          : `Specialized in ${agent.specialty || agent.role.toLowerCase()}.`}
        {agent.status === 'thinking' && <span className="animate-pulse">...</span>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <button
          className="font-mono text-[9px] px-1.5 py-0.5 rounded border text-garden-dim border-garden-border hover:border-garden-border2 hover:text-garden-text transition-all flex items-center gap-1"
          style={{ background: `${getModel(agent.model ?? '').color}18` }}
          onClick={() => setShowSettings(true)}
          title="Agent settings"
        >
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 1v1M5 8v1M1 5h1M8 5h1M2.2 2.2l.7.7M7.1 7.1l.7.7M7.8 2.2l-.7.7M2.9 7.1l-.7.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {getModel(agent.model ?? '').name}
        </button>
        <button
          className="font-mono text-[10px] px-2 py-0.5 bg-garden-accent/10 text-garden-accent border border-garden-border2 rounded hover:bg-garden-accent hover:text-garden-bg transition-all"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); openPanel(agent.id) }}
        >
          CHAT →
        </button>
      </div>

      {showSettings && createPortal(
        <AgentSettings agent={agent} onClose={() => setShowSettings(false)} />,
        document.body
      )}
    </div>
  )
}

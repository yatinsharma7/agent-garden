import { useNavigate } from 'react-router-dom'
import { useGardenStore } from '@/lib/store'
import { ROLE_EMOJIS } from '@/lib/constants'
import { getModel } from '@/lib/models'
import { ViewToggle } from '@/components/nav/ViewToggle'
import { ThemeToggle } from '@/components/nav/ThemeToggle'
import clsx from 'clsx'

export function Console() {
  const navigate = useNavigate()
  const { teams, agents, messages } = useGardenStore()

  const activeCount = agents.filter(a => a.status === 'thinking').length
  const modelsInUse = new Set(agents.map(a => a.model ?? 'claude-sonnet-5')).size
  const totalMessages = Object.values(messages).reduce((n, msgs) => n + msgs.length, 0)

  const statusLabel = (status: string) =>
    status === 'thinking' ? 'thinking...' : status === 'done' ? 'responded' : status === 'error' ? 'error' : 'idle'

  return (
    <>
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between px-4 md:px-6 h-[52px] border-b border-garden-border bg-garden-surface flex-shrink-0">
        <div className="md:hidden font-mono text-sm font-semibold text-garden-accent tracking-widest">
          AGENT<span className="text-garden-muted font-normal">GARDEN</span>
        </div>
        <div className="hidden md:flex font-mono text-[11px] text-garden-muted items-center gap-1.5">
          <span>org</span><span className="text-garden-dim">/</span>
          <span>garden</span><span className="text-garden-dim">/</span>
          <span className="text-garden-text">console</span>
        </div>
        <div className="md:hidden"><ThemeToggle /></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 md:pb-4">
        <div className="px-4 md:px-8 py-5 max-w-3xl w-full mx-auto">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-lg font-semibold text-garden-text">Console</h1>
              <p className="font-mono text-[11px] text-garden-muted mt-0.5">
                {agents.length} agents · {activeCount} active
              </p>
            </div>
            <div className="md:hidden">
              <ViewToggle current="console" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
            <div className="bg-garden-surface border border-garden-border rounded-lg px-3 py-2.5">
              <div className="font-mono text-[9px] text-garden-dim tracking-widest uppercase mb-1">Active</div>
              <div className="font-mono text-lg font-semibold text-garden-text">{activeCount}</div>
              <div className="font-mono text-[9px] text-garden-muted">of {agents.length}</div>
            </div>
            <div className="bg-garden-surface border border-garden-border rounded-lg px-3 py-2.5">
              <div className="font-mono text-[9px] text-garden-dim tracking-widest uppercase mb-1">Messages</div>
              <div className="font-mono text-lg font-semibold text-garden-text">{totalMessages}</div>
              <div className="font-mono text-[9px] text-garden-muted">loaded</div>
            </div>
            <div className="bg-garden-surface border border-garden-border rounded-lg px-3 py-2.5">
              <div className="font-mono text-[9px] text-garden-dim tracking-widest uppercase mb-1">Models</div>
              <div className="font-mono text-lg font-semibold text-garden-text">{modelsInUse}</div>
              <div className="font-mono text-[9px] text-garden-muted">in use</div>
            </div>
          </div>

          {/* Agent list */}
          <div className="font-mono text-[10px] text-garden-dim tracking-widest uppercase mb-2">All agents</div>
          <div className="flex flex-col gap-1.5">
            {agents.length === 0 ? (
              <div className="font-mono text-[11px] text-garden-dim py-8 text-center">No agents deployed yet</div>
            ) : agents.map(agent => {
              const team = teams.find(t => t.id === agent.team_id)
              const model = getModel(agent.model ?? '')
              const agentMsgs = messages[agent.id] || []
              const lastMsg = agentMsgs[agentMsgs.length - 1]
              return (
                <button
                  key={agent.id}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all',
                    agent.status === 'thinking'
                      ? 'bg-garden-surface border-garden-accent/25'
                      : 'bg-garden-surface border-garden-border hover:border-garden-border2'
                  )}
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 border"
                    style={{ background: `${team?.color ?? '#4ade80'}15`, borderColor: `${team?.color ?? '#4ade80'}30` }}
                  >
                    {ROLE_EMOJIS[agent.role] || '🤖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-garden-text truncate">{agent.name}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-garden-border2 text-garden-muted bg-garden-bg">
                        {team?.name ?? '—'}
                      </span>
                      <span
                        className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-garden-border text-garden-dim"
                        style={{ background: `${model.color}15` }}
                      >
                        {model.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className={clsx('w-2 h-2 rounded-full', {
                      'bg-garden-dim': agent.status === 'idle',
                      'bg-garden-accent animate-pulse': agent.status === 'thinking',
                      'bg-green-500': agent.status === 'done',
                      'bg-red-500': agent.status === 'error',
                    })} />
                    <span className="font-mono text-[9px] text-garden-dim italic max-w-[110px] truncate">
                      {lastMsg ? lastMsg.content.slice(0, 30) : statusLabel(agent.status)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

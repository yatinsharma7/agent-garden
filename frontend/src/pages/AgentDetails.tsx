import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useGardenStore } from '@/lib/store'
import { agentsApi, chatApi } from '@/lib/api'
import { ROLE_EMOJIS, ROLE_COLORS } from '@/lib/constants'
import { getModel } from '@/lib/models'
import { ModelPicker } from '@/components/models/ModelPicker'
import clsx from 'clsx'

export function AgentDetails() {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const { teams, agents, messages, setMessages, updateAgent, removeAgent, openPanel } = useGardenStore()
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [savingModel, setSavingModel] = useState(false)

  const agent = agents.find(a => a.id === agentId)
  const team = teams.find(t => t.id === agent?.team_id)
  const history = (agentId ? messages[agentId] : []) || []

  // Load history if not in store yet
  useEffect(() => {
    if (!agentId || messages[agentId]) return
    chatApi.getHistory(agentId).then(msgs => setMessages(agentId, msgs))
  }, [agentId])

  if (!agent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-garden-dim">
        <span className="font-mono text-[11px]">Agent not found</span>
        <Link to="/console" className="font-mono text-[11px] text-garden-accent hover:underline">← Back to Console</Link>
      </div>
    )
  }

  const model = getModel(agent.model ?? '')
  const roleColor = ROLE_COLORS[agent.role] || '#6b8f6e'
  const userMsgs = history.filter(m => m.role === 'user')
  const assistantMsgs = history.filter(m => m.role === 'assistant')
  const lastTask = userMsgs[userMsgs.length - 1]

  const handleModelChange = async (modelId: string) => {
    setSavingModel(true)
    try {
      const updated = await agentsApi.update(agent.id, { model: modelId })
      updateAgent(updated)
      setShowModelPicker(false)
    } finally {
      setSavingModel(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) return
    await agentsApi.delete(agent.id)
    removeAgent(agent.id)
    navigate('/console')
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between px-4 md:px-6 h-[52px] border-b border-garden-border bg-garden-surface flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/console" className="font-mono text-[11px] text-garden-muted hover:text-garden-text transition-all flex-shrink-0">
            ← Console
          </Link>
          <div className="hidden md:flex font-mono text-[11px] text-garden-muted items-center gap-1.5 min-w-0">
            <span>agents</span><span className="text-garden-dim">/</span>
            <span className="text-garden-text truncate">{agent.name.toLowerCase()}</span>
          </div>
        </div>
        <button
          className="font-mono text-[11px] px-3 py-1.5 bg-garden-accent text-garden-bg rounded font-semibold hover:bg-garden-accent2 transition-all"
          onClick={() => openPanel(agent.id)}
        >
          CHAT →
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 md:pb-6">
        <div className="px-4 md:px-8 py-5 max-w-3xl w-full mx-auto">

          {/* Identity */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border"
              style={{ background: `${roleColor}18`, borderColor: `${roleColor}33` }}
            >
              {ROLE_EMOJIS[agent.role] || '🤖'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-garden-text">{agent.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${roleColor}18`, color: roleColor }}>
                  {agent.role}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-garden-border2 text-garden-muted bg-garden-bg">
                  {team?.name ?? '—'}
                </span>
                {agent.specialty && (
                  <span className="font-mono text-[10px] text-garden-dim">· {agent.specialty}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className={clsx('w-2 h-2 rounded-full', {
                'bg-garden-dim': agent.status === 'idle',
                'bg-garden-accent animate-pulse': agent.status === 'thinking',
                'bg-green-500': agent.status === 'done',
                'bg-red-500': agent.status === 'error',
              })} />
              <span className="font-mono text-[10px] text-garden-muted">{agent.status}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
            <div className="bg-garden-surface border border-garden-border rounded-lg px-3 py-2.5">
              <div className="font-mono text-[9px] text-garden-dim tracking-widest uppercase mb-1">Messages</div>
              <div className="font-mono text-lg font-semibold text-garden-text">{history.length}</div>
              <div className="font-mono text-[9px] text-garden-muted">total</div>
            </div>
            <div className="bg-garden-surface border border-garden-border rounded-lg px-3 py-2.5">
              <div className="font-mono text-[9px] text-garden-dim tracking-widest uppercase mb-1">Tasks done</div>
              <div className="font-mono text-lg font-semibold text-garden-text">{assistantMsgs.length}</div>
              <div className="font-mono text-[9px] text-garden-muted">responses</div>
            </div>
            <div className="bg-garden-surface border border-garden-border rounded-lg px-3 py-2.5">
              <div className="font-mono text-[9px] text-garden-dim tracking-widest uppercase mb-1">Deployed</div>
              <div className="font-mono text-lg font-semibold text-garden-text">
                {new Date(agent.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
              <div className="font-mono text-[9px] text-garden-muted">{new Date(agent.created_at).getFullYear()}</div>
            </div>
          </div>

          {/* Model */}
          <div className="bg-garden-surface border border-garden-border rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-1">
              <div className="font-mono text-[10px] text-garden-dim tracking-widest uppercase">Model</div>
              <button
                className="font-mono text-[10px] px-2.5 py-1 border border-garden-border2 rounded text-garden-muted hover:border-garden-accent hover:text-garden-accent transition-all"
                onClick={() => setShowModelPicker(v => !v)}
              >
                {showModelPicker ? 'Cancel' : 'Change model'}
              </button>
            </div>
            {!showModelPicker ? (
              <div className="flex items-center gap-3 mt-2">
                <div
                  className="w-10 h-10 rounded-lg flex-shrink-0"
                  style={{ background: model.color }}
                />
                <div>
                  <div className="text-sm font-medium text-garden-text">{model.name}</div>
                  <div className="font-mono text-[10px] text-garden-dim mt-0.5">{model.id}</div>
                </div>
                <div className="flex gap-1 ml-auto flex-wrap justify-end">
                  {model.tags.map(tag => (
                    <span key={tag} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-garden-bg text-garden-muted border border-garden-border">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3">
                {savingModel && <div className="font-mono text-[10px] text-garden-dim animate-pulse mb-2">Saving...</div>}
                <ModelPicker value={agent.model ?? 'claude-sonnet-5'} onChange={handleModelChange} />
              </div>
            )}
          </div>

          {/* Last task */}
          <div className="bg-garden-surface border border-garden-border rounded-xl p-4 mb-6">
            <div className="font-mono text-[10px] text-garden-dim tracking-widest uppercase mb-2">Last task</div>
            {lastTask ? (
              <>
                <p className="text-sm text-garden-text leading-relaxed">{lastTask.content}</p>
                <div className="font-mono text-[10px] text-garden-dim mt-2">
                  {new Date(lastTask.created_at).toLocaleString()}
                </div>
              </>
            ) : (
              <p className="font-mono text-[11px] text-garden-dim">No tasks assigned yet</p>
            )}
          </div>

          {/* Recent messages */}
          <div className="bg-garden-surface border border-garden-border rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-[10px] text-garden-dim tracking-widest uppercase">Recent messages</div>
              <button
                className="font-mono text-[10px] text-garden-accent hover:underline"
                onClick={() => openPanel(agent.id)}
              >
                Open chat →
              </button>
            </div>
            {history.length === 0 ? (
              <p className="font-mono text-[11px] text-garden-dim">No messages yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.slice(-5).map((m, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className={clsx(
                      'font-mono text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5',
                      m.role === 'user' ? 'bg-garden-accent/15 text-garden-accent' : 'bg-garden-bg text-garden-muted border border-garden-border'
                    )}>
                      {m.role === 'user' ? 'you' : agent.name}
                    </span>
                    <p className="text-xs text-garden-muted leading-relaxed truncate">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <button
            className="font-mono text-[11px] px-3 py-1.5 border border-red-500/30 rounded text-red-400 hover:bg-red-500/10 transition-all"
            onClick={handleDelete}
          >
            Delete agent
          </button>
        </div>
      </div>
    </>
  )
}

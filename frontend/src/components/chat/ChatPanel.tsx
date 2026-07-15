import { useState, useEffect, useRef } from 'react'
import { useGardenStore } from '@/lib/store'
import { chatApi, teamsApi, agentsApi } from '@/lib/api'
import { ROLE_EMOJIS, ROLE_COLORS } from '@/lib/constants'
import type { Message } from '@/types'
import clsx from 'clsx'

const WRITE_TOOLS = ['create_agent', 'create_team', 'delete_agent', 'delete_team', 'update_agent_status']

export function ChatPanel() {
  const {
    teams, agents, activeAgentId, panelOpen,
    messages, setMessages, appendMessage, updateAgent,
    setTeams, setAgents, closePanel,
  } = useGardenStore()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const agent = agents.find(a => a.id === activeAgentId)
  const team = teams.find(t => t.id === agent?.team_id)
  const history = (activeAgentId ? messages[activeAgentId] : []) || []
  const roleColor = agent ? (ROLE_COLORS[agent.role] || '#6b8f6e') : '#6b8f6e'

  // Load history when agent changes
  useEffect(() => {
    if (!activeAgentId) return
    if (messages[activeAgentId]) return
    chatApi.getHistory(activeAgentId).then(msgs => setMessages(activeAgentId, msgs))
  }, [activeAgentId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  // Focus input when agent changes
  useEffect(() => {
    if (panelOpen) setTimeout(() => textareaRef.current?.focus(), 50)
  }, [panelOpen, activeAgentId])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const send = async () => {
    if (!input.trim() || !activeAgentId || !agent) return
    const msg = input.trim()
    setInput('')
    setLoading(true)

    const userMsg: Message = {
      id: Date.now().toString(),
      agent_id: activeAgentId,
      role: 'user',
      content: msg,
      created_at: new Date().toISOString(),
    }
    appendMessage(activeAgentId, userMsg)
    updateAgent({ ...agent, status: 'thinking' })

    try {
      const res = await chatApi.send(activeAgentId, msg)
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        agent_id: activeAgentId,
        role: 'assistant',
        content: res.message.content,
        created_at: new Date().toISOString(),
      }
      appendMessage(activeAgentId, assistantMsg)
      updateAgent({ ...agent, status: 'done' })

      if (res.tools_used?.some((t: string) => WRITE_TOOLS.includes(t))) {
        const [updatedTeams, updatedAgents] = await Promise.all([teamsApi.list(), agentsApi.list()])
        setTeams(updatedTeams)
        setAgents(updatedAgents)
      }
    } catch {
      updateAgent({ ...agent, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!panelOpen || !agent) return null

  // Group history messages by date for the left panel
  const groupedHistory = history.reduce<{ label: string; messages: typeof history }[]>((groups, msg) => {
    const date = new Date(msg.created_at)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const label = date.toDateString() === today.toDateString()
      ? 'Today'
      : date.toDateString() === yesterday.toDateString()
        ? 'Yesterday'
        : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.messages.push(msg)
    else groups.push({ label, messages: [msg] })
    return groups
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={closePanel}
    >
      <div
        className="relative bg-garden-surface border border-garden-border2 rounded-xl shadow-2xl flex w-full max-w-5xl h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >

        {/* LEFT — Conversation history */}
        <div className="w-[220px] flex-shrink-0 border-r border-garden-border bg-garden-bg flex flex-col">
          <div className="px-4 py-3 border-b border-garden-border">
            <div className="font-mono text-[10px] text-garden-dim tracking-widest uppercase">History</div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {history.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <div className="font-mono text-[10px] text-garden-dim">No messages yet</div>
              </div>
            ) : groupedHistory.map(group => (
              <div key={group.label} className="mb-3">
                <div className="px-4 py-1">
                  <span className="font-mono text-[10px] text-garden-dim tracking-wide">{group.label}</span>
                </div>
                {group.messages.filter(m => m.role === 'user').map((m, i) => (
                  <div
                    key={i}
                    className="mx-2 px-3 py-2 rounded-lg text-[11px] text-garden-muted hover:bg-garden-surface/50 cursor-default truncate"
                  >
                    {m.content.slice(0, 38)}{m.content.length > 38 ? '…' : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Chat */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-garden-border bg-garden-surface2 flex-shrink-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border"
              style={{ background: `${roleColor}18`, borderColor: `${roleColor}33` }}
            >
              {ROLE_EMOJIS[agent.role] || '🤖'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-garden-text">{agent.name}</div>
              <div className="font-mono text-[11px] text-garden-muted mt-0.5">
                {agent.role}{agent.specialty ? ` · ${agent.specialty}` : ''} · {team?.name}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className={clsx('w-2 h-2 rounded-full', {
                  'bg-garden-dim': agent.status === 'idle',
                  'bg-garden-accent animate-pulse': agent.status === 'thinking',
                  'bg-green-500': agent.status === 'done',
                  'bg-red-500': agent.status === 'error',
                })} />
                <span className="font-mono text-[10px] text-garden-muted">{agent.status}</span>
              </div>
              <button
                className="text-garden-dim hover:text-garden-text transition-colors text-lg leading-none"
                onClick={closePanel}
              >✕</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
            {history.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-12">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border"
                  style={{ background: `${roleColor}18`, borderColor: `${roleColor}33` }}
                >
                  {ROLE_EMOJIS[agent.role] || '🤖'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-garden-text">{agent.name}</div>
                  <div className="text-xs text-garden-muted mt-1">
                    {agent.specialty ? `Specialized in ${agent.specialty}` : agent.role} · Ready for tasks
                  </div>
                </div>
                <div className="font-mono text-[10px] text-garden-dim border border-dashed border-garden-border rounded px-3 py-1.5 mt-2">
                  Ask a question or assign a task to get started
                </div>
              </div>
            )}

            {history.map((m, i) => (
              <div key={i} className={clsx('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                <div className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5',
                  m.role === 'user' ? 'bg-garden-accent/20 text-garden-accent' : 'border'
                )}
                  style={m.role === 'assistant' ? { background: `${roleColor}18`, borderColor: `${roleColor}33` } : {}}
                >
                  {m.role === 'user' ? 'Y' : ROLE_EMOJIS[agent.role] || '🤖'}
                </div>
                <div className={clsx('flex flex-col gap-1 max-w-[75%]', m.role === 'user' ? 'items-end' : 'items-start')}>
                  <div className="font-mono text-[10px] text-garden-dim px-1">
                    {m.role === 'user' ? 'you' : agent.name}
                  </div>
                  <div className={clsx(
                    'text-sm leading-relaxed px-4 py-3 rounded-2xl whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'bg-garden-accent/15 border border-garden-accent/20 text-garden-text rounded-tr-sm'
                      : 'bg-garden-surface2 border border-garden-border text-garden-text rounded-tl-sm'
                  )}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5 border"
                  style={{ background: `${roleColor}18`, borderColor: `${roleColor}33` }}
                >
                  {ROLE_EMOJIS[agent.role] || '🤖'}
                </div>
                <div className="flex flex-col gap-1 items-start">
                  <div className="font-mono text-[10px] text-garden-dim px-1">{agent.name}</div>
                  <div className="bg-garden-surface2 border border-garden-border text-garden-muted text-sm px-4 py-3 rounded-2xl rounded-tl-sm">
                    <span className="animate-pulse">thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-garden-border flex-shrink-0">
            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                className="flex-1 bg-garden-bg border border-garden-border2 rounded-xl px-4 py-3 text-sm text-garden-text font-sans outline-none resize-none focus:border-garden-accent transition-colors min-h-[48px] max-h-[120px]"
                rows={1}
                placeholder={`Message ${agent.name}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                disabled={loading}
              />
              <button
                className="bg-garden-accent text-garden-bg font-mono text-[11px] font-bold px-4 py-3 rounded-xl hover:bg-garden-accent2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                onClick={send}
                disabled={loading || !input.trim()}
              >
                SEND
              </button>
            </div>
            <div className="font-mono text-[10px] text-garden-dim mt-2 text-center">
              Enter to send · Shift+Enter for new line · Esc to close
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

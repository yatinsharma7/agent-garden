import { useState, useEffect, useRef } from 'react'
import { useGardenStore } from '@/lib/store'
import { chatApi } from '@/lib/api'
import { ROLE_EMOJIS } from '@/lib/constants'
import type { Message } from '@/types'
import clsx from 'clsx'

export function ChatPanel() {
  const { teams, agents, activeAgentId, panelOpen, messages, setMessages, appendMessage, updateAgent, closePanel } = useGardenStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const agent = agents.find(a => a.id === activeAgentId)
  const team = teams.find(t => t.id === agent?.team_id)
  const history = (activeAgentId ? messages[activeAgentId] : []) || []

  // Load history when agent changes
  useEffect(() => {
    if (!activeAgentId) return
    if (messages[activeAgentId]) return // already loaded
    chatApi.getHistory(activeAgentId).then(msgs => setMessages(activeAgentId, msgs))
  }, [activeAgentId])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const send = async () => {
    if (!input.trim() || !activeAgentId || !agent) return
    const msg = input.trim()
    setInput('')
    setLoading(true)

    // Optimistic user message
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
    } catch {
      updateAgent({ ...agent, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!panelOpen || !agent) return null

  return (
    <div className="w-[340px] bg-garden-surface border-l border-garden-border flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-garden-border bg-garden-surface2 flex-shrink-0">
        <div className="w-7 h-7 rounded flex items-center justify-center text-sm">
          {ROLE_EMOJIS[agent.role] || '🤖'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-garden-text">{agent.name}</div>
          <div className="font-mono text-[11px] text-garden-muted">{agent.role} · {team?.name}</div>
        </div>
        <button className="text-garden-dim hover:text-garden-text text-base" onClick={closePanel}>✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {history.length === 0 && (
          <div className="border border-dashed border-garden-border rounded p-2 text-xs text-garden-muted italic">
            {agent.name} is ready. Assign a task or ask a question.
          </div>
        )}
        {history.map((m, i) => (
          <div key={i} className={clsx('flex flex-col gap-1', m.role === 'user' ? 'items-end' : 'items-start')}>
            <div className="font-mono text-[10px] text-garden-dim">{m.role === 'user' ? 'you' : agent.name}</div>
            <div className={clsx(
              'text-xs leading-relaxed px-2.5 py-2 rounded max-w-full whitespace-pre-wrap',
              m.role === 'user'
                ? 'bg-garden-accent/10 border border-garden-border2 text-garden-text'
                : 'bg-garden-surface2 border border-garden-border text-garden-text'
            )}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col gap-1 items-start">
            <div className="font-mono text-[10px] text-garden-dim">{agent.name}</div>
            <div className="bg-garden-surface2 border border-garden-border text-garden-muted text-xs px-2.5 py-2 rounded animate-pulse">
              thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-garden-border flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            className="flex-1 bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-xs text-garden-text font-sans outline-none resize-none focus:border-garden-accent transition-colors"
            rows={2}
            placeholder="Send a task or question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            disabled={loading}
          />
          <button
            className="bg-garden-accent text-garden-bg font-mono text-[11px] font-bold px-3 rounded hover:bg-garden-accent2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            onClick={send}
            disabled={loading || !input.trim()}
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  )
}

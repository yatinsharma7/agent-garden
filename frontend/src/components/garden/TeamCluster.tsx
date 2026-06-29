import { type Team, type Agent } from '@/types'
import { AgentCard } from '@/components/agents/AgentCard'

interface Props {
  team: Team
  agents: Agent[]
  messages: Record<string, { role: string; content: string }[]>
  onAddAgent: (teamId: string) => void
  onRemoveTeam: (teamId: string) => void
}

export function TeamCluster({ team, agents, messages, onAddAgent, onRemoveTeam }: Props) {
  return (
    <div className="border border-garden-border rounded-lg bg-garden-surface">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-garden-border bg-garden-surface2">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: team.color }} />
        <span className="text-sm font-semibold text-garden-text flex-1">{team.name}</span>
        <span className="font-mono text-[10px] text-garden-muted bg-garden-bg border border-garden-border2 px-2 py-0.5 rounded tracking-wide">
          {team.field}
        </span>
        <div className="flex gap-1">
          <button
            className="text-garden-dim hover:text-garden-accent text-sm px-1.5 py-0.5 rounded transition-colors"
            onClick={() => onAddAgent(team.id)}
            title="Add agent"
          >＋</button>
          <button
            className="text-garden-dim hover:text-red-400 text-sm px-1.5 py-0.5 rounded transition-colors"
            onClick={() => onRemoveTeam(team.id)}
            title="Remove team"
          >✕</button>
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 p-4">
        {agents.map(agent => {
          const agentMsgs = messages[agent.id] || []
          const lastAssistant = [...agentMsgs].reverse().find(m => m.role === 'assistant')
          return (
            <AgentCard
              key={agent.id}
              agent={agent}
              team={team}
              lastMessage={lastAssistant?.content}
            />
          )
        })}
        {/* Add agent placeholder */}
        <div
          className="border border-dashed border-garden-border2 rounded-md flex flex-col items-center justify-center gap-2 min-h-[120px] cursor-pointer text-garden-dim text-xs hover:border-garden-accent hover:text-garden-accent transition-all"
          onClick={() => onAddAgent(team.id)}
        >
          <span className="text-xl">＋</span>
          <span>Deploy Agent</span>
        </div>
      </div>
    </div>
  )
}

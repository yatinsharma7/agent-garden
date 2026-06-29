import { useState, useEffect } from 'react'
import { useGardenStore } from '@/lib/store'
import { teamsApi, agentsApi } from '@/lib/api'
import { TeamCluster } from '@/components/garden/TeamCluster'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { TEAM_COLORS, ALL_ROLES } from '@/lib/constants'
import type { AgentRole } from '@/types'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableTeamCluster(props: React.ComponentProps<typeof TeamCluster>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.team.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TeamCluster {...props} />
    </div>
  )
}

export function App() {
  const { teams, agents, messages, activeTeamId, teamOrder, setTeams, setAgents, addTeam, removeTeam, addAgent, setActiveTeam, setTeamOrder } = useGardenStore()
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [_preselectedTeam, setPreselectedTeam] = useState<string | null>(null)

  // Team form state
  const [teamName, setTeamName] = useState('')
  const [teamField, setTeamField] = useState('')
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0].value)

  // Agent form state
  const [agentName, setAgentName] = useState('')
  const [agentRole, setAgentRole] = useState<AgentRole>('Engineer')
  const [agentTeam, setAgentTeam] = useState('')
  const [agentSpecialty, setAgentSpecialty] = useState('')

  const sensors = useSensors(useSensor(PointerSensor))

  // Load data
  useEffect(() => {
    teamsApi.list().then(data => {
      setTeams(data)
      if (teamOrder.length === 0) setTeamOrder(data.map(t => t.id))
    })
    agentsApi.list().then(setAgents)
  }, [])

  const orderedTeams = teamOrder.length > 0
    ? [...teams].sort((a, b) => teamOrder.indexOf(a.id) - teamOrder.indexOf(b.id))
    : teams

  const visibleTeams = activeTeamId ? teams.filter(t => t.id === activeTeamId) : orderedTeams

  const handleDragEnd = (event: { active: { id: string | number }, over: { id: string | number } | null }) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = teamOrder.indexOf(String(active.id))
    const newIndex = teamOrder.indexOf(String(over.id))
    setTeamOrder(arrayMove(teamOrder, oldIndex, newIndex))
  }

  const handleAddTeam = async () => {
    if (!teamName.trim()) return
    const team = await teamsApi.create({ name: teamName, field: teamField || 'General', color: teamColor })
    addTeam(team)
    setTeamOrder([...teamOrder, team.id])
    setTeamName(''); setTeamField(''); setTeamColor(TEAM_COLORS[0].value)
    setShowTeamModal(false)
  }

  const handleRemoveTeam = async (id: string) => {
    if (!confirm('Remove team and all its agents?')) return
    await teamsApi.delete(id)
    removeTeam(id)
  }

  const handleAddAgent = async () => {
    if (!agentName.trim() || !agentTeam) return
    const agent = await agentsApi.create({ name: agentName, role: agentRole, team_id: agentTeam, specialty: agentSpecialty })
    addAgent(agent)
    setAgentName(''); setAgentSpecialty('')
    setShowAgentModal(false)
  }

  const openAgentModal = (teamId?: string) => {
    setPreselectedTeam(teamId || null)
    setAgentTeam(teamId || teams[0]?.id || '')
    setShowAgentModal(true)
  }

  const totalActive = agents.filter(a => a.status === 'thinking').length

  return (
    <div className="flex flex-col h-screen bg-garden-bg text-garden-text font-sans overflow-hidden">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-6 h-[52px] border-b border-garden-border bg-garden-surface flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-mono text-sm font-semibold text-garden-accent tracking-widest">
            AGENT<span className="text-garden-muted font-normal">GARDEN</span>
          </div>
          <div className="font-mono text-[11px] text-garden-muted flex items-center gap-1.5">
            <span>org</span><span className="text-garden-dim">/</span>
            <span>garden</span><span className="text-garden-dim">/</span>
            <span className="text-garden-text">v0.1</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTeamModal(true)} className="font-mono text-[11px] px-3 py-1.5 border border-garden-border2 rounded text-garden-muted hover:border-garden-accent hover:text-garden-accent transition-all">
            + Team
          </button>
          <button onClick={() => openAgentModal()} className="font-mono text-[11px] px-3 py-1.5 bg-garden-accent text-garden-bg border border-garden-accent rounded font-semibold hover:bg-garden-accent2 transition-all">
            + Agent
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <div className="w-[240px] bg-garden-surface border-r border-garden-border flex flex-col flex-shrink-0 overflow-y-auto">
          <div className="p-4">
            <div className="font-mono text-[10px] font-semibold text-garden-dim tracking-widest uppercase mb-2">Teams</div>
            <div
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer mb-0.5 border ${activeTeamId === null ? 'bg-garden-accent/10 border-garden-border2' : 'border-transparent hover:bg-garden-surface2'}`}
              onClick={() => setActiveTeam(null)}
            >
              <div className="w-2 h-2 rounded-full bg-garden-muted" />
              <span className="text-sm flex-1">All Teams</span>
              <span className="font-mono text-[10px] text-garden-muted">{agents.length}</span>
            </div>
            {teams.map(t => (
              <div
                key={t.id}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer mb-0.5 border ${activeTeamId === t.id ? 'bg-garden-accent/10 border-garden-border2' : 'border-transparent hover:bg-garden-surface2'}`}
                onClick={() => setActiveTeam(t.id)}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
                <span className="text-sm flex-1 truncate">{t.name}</span>
                <span className="font-mono text-[10px] text-garden-muted">{agents.filter(a => a.team_id === t.id).length}</span>
              </div>
            ))}
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer text-garden-dim text-sm border border-dashed border-garden-border hover:border-garden-accent hover:text-garden-accent transition-all mt-1"
              onClick={() => setShowTeamModal(true)}
            >
              <span>＋</span><span>New Team</span>
            </div>
          </div>

          {/* Role legend */}
          <div className="mt-auto border-t border-garden-border p-4">
            <div className="font-mono text-[10px] font-semibold text-garden-dim tracking-widest uppercase mb-2">Roles</div>
            {[['#60a5fa', 'Engineer'], ['#f59e0b', 'Data Engineer'], ['#c084fc', 'Architect'], ['#fb7185', 'Lead']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-2 py-1 text-xs text-garden-muted">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 flex-shrink-0">
            <div className="text-lg font-semibold">{activeTeamId ? teams.find(t => t.id === activeTeamId)?.name : 'Garden Overview'}</div>
            <div className="text-xs text-garden-muted mt-0.5">
              {activeTeamId
                ? `${teams.find(t => t.id === activeTeamId)?.field} · ${agents.filter(a => a.team_id === activeTeamId).length} agents`
                : `All teams · ${agents.length} agents`}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
            {visibleTeams.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-garden-dim gap-3">
                <span className="text-5xl opacity-40">🌱</span>
                <p className="text-sm">No teams yet. Create a team to get started.</p>
              </div>
            ) : activeTeamId ? visibleTeams.map(team => (
              <TeamCluster
                key={team.id}
                team={team}
                agents={agents.filter(a => a.team_id === team.id)}
                messages={messages}
                onAddAgent={openAgentModal}
                onRemoveTeam={handleRemoveTeam}
              />
            )) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={teamOrder} strategy={verticalListSortingStrategy}>
                  {visibleTeams.map(team => (
                    <SortableTeamCluster
                      key={team.id}
                      team={team}
                      agents={agents.filter(a => a.team_id === team.id)}
                      messages={messages}
                      onAddAgent={openAgentModal}
                      onRemoveTeam={handleRemoveTeam}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* STATUS BAR */}
          <div className="flex gap-6 px-6 py-1.5 border-t border-garden-border bg-garden-surface font-mono text-[10px] text-garden-dim flex-shrink-0">
            <span>agents: <span className="text-garden-accent">{agents.length}</span></span>
            <span>teams: <span className="text-garden-accent">{teams.length}</span></span>
            <span>active: <span className="text-garden-accent">{totalActive}</span></span>
            <span className="ml-auto">powered by claude-sonnet-4-6</span>
          </div>
        </div>

        {/* CHAT PANEL */}
        <ChatPanel />
      </div>

      {/* TEAM MODAL */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setShowTeamModal(false)}>
          <div className="bg-garden-surface border border-garden-border2 rounded-lg p-6 w-[420px]" onClick={e => e.stopPropagation()}>
            <div className="text-base font-semibold mb-4">New Team</div>
            <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">TEAM NAME</label>
            <input className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-3" placeholder="e.g. Platform Engineering" value={teamName} onChange={e => setTeamName(e.target.value)} autoFocus />
            <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">FIELD / DOMAIN</label>
            <input className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-3" placeholder="e.g. Infrastructure, Analytics" value={teamField} onChange={e => setTeamField(e.target.value)} />
            <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">COLOR</label>
            <select className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-4" value={teamColor} onChange={e => setTeamColor(e.target.value)}>
              {TEAM_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button className="font-mono text-[11px] px-3 py-1.5 border border-garden-border2 rounded text-garden-muted hover:text-garden-text transition-all" onClick={() => setShowTeamModal(false)}>Cancel</button>
              <button className="font-mono text-[11px] px-3 py-1.5 bg-garden-accent text-garden-bg rounded font-semibold hover:bg-garden-accent2 transition-all" onClick={handleAddTeam}>Create Team</button>
            </div>
          </div>
        </div>
      )}

      {/* AGENT MODAL */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setShowAgentModal(false)}>
          <div className="bg-garden-surface border border-garden-border2 rounded-lg p-6 w-[420px]" onClick={e => e.stopPropagation()}>
            <div className="text-base font-semibold mb-4">Deploy Agent</div>
            <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">AGENT NAME</label>
            <input className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-3" placeholder="e.g. Nova, Axiom, Codexa" value={agentName} onChange={e => setAgentName(e.target.value)} autoFocus />
            <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">ROLE</label>
            <select className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-3" value={agentRole} onChange={e => setAgentRole(e.target.value as AgentRole)}>
              {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">TEAM</label>
            <select className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-3" value={agentTeam} onChange={e => setAgentTeam(e.target.value)}>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">SPECIALTY / FOCUS</label>
            <input className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-4" placeholder="e.g. distributed systems, ETL pipelines" value={agentSpecialty} onChange={e => setAgentSpecialty(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button className="font-mono text-[11px] px-3 py-1.5 border border-garden-border2 rounded text-garden-muted hover:text-garden-text transition-all" onClick={() => setShowAgentModal(false)}>Cancel</button>
              <button className="font-mono text-[11px] px-3 py-1.5 bg-garden-accent text-garden-bg rounded font-semibold hover:bg-garden-accent2 transition-all" onClick={handleAddAgent}>Deploy Agent</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

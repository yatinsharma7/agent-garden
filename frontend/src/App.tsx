import { useGardenStore } from '@/lib/store'
import { teamsApi } from '@/lib/api'
import { TeamCluster } from '@/components/garden/TeamCluster'
import { ViewToggle } from '@/components/nav/ViewToggle'
import { ThemeToggle } from '@/components/nav/ThemeToggle'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent: event }: { nativeEvent: PointerEvent }) => {
        if (!event.isPrimary || event.button !== 0) return false
        if ((event.target as HTMLElement).closest('[data-no-dnd]')) return false
        return true
      },
    },
  ]
}

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
  const {
    teams, agents, messages, activeTeamId, teamOrder,
    removeTeam, setTeamOrder, openTeamModal, openAgentModal,
  } = useGardenStore()

  const sensors = useSensors(useSensor(SmartPointerSensor, {
    activationConstraint: { distance: 8 },
  }))

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

  const handleRemoveTeam = async (id: string) => {
    if (!confirm('Remove team and all its agents?')) return
    await teamsApi.delete(id)
    removeTeam(id)
  }

  const totalActive = agents.filter(a => a.status === 'thinking').length

  return (
    <>
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between px-4 md:px-6 h-[52px] border-b border-garden-border bg-garden-surface flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="md:hidden font-mono text-sm font-semibold text-garden-accent tracking-widest">
            AGENT<span className="text-garden-muted font-normal">GARDEN</span>
          </div>
          <div className="hidden md:flex font-mono text-[11px] text-garden-muted items-center gap-1.5">
            <span>org</span><span className="text-garden-dim">/</span>
            <span>garden</span><span className="text-garden-dim">/</span>
            <span className="text-garden-text">v0.1</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="md:hidden"><ThemeToggle /></div>
          <button onClick={openTeamModal} className="hidden md:block font-mono text-[11px] px-3 py-1.5 border border-garden-border2 rounded text-garden-muted hover:border-garden-accent hover:text-garden-accent transition-all">
            + Team
          </button>
          <button onClick={() => openAgentModal()} className="hidden md:block font-mono text-[11px] px-3 py-1.5 bg-garden-accent text-garden-bg border border-garden-accent rounded font-semibold hover:bg-garden-accent2 transition-all">
            + Agent
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 pt-4 flex-shrink-0 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{activeTeamId ? teams.find(t => t.id === activeTeamId)?.name : 'Garden Overview'}</div>
          <div className="text-xs text-garden-muted mt-0.5">
            {activeTeamId
              ? `${teams.find(t => t.id === activeTeamId)?.field} · ${agents.filter(a => a.team_id === activeTeamId).length} agents`
              : `All teams · ${agents.length} agents`}
          </div>
        </div>
        <div className="md:hidden">
          <ViewToggle current="garden" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 pb-20 md:pb-4 flex flex-col gap-4">
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
      <div className="hidden md:flex gap-6 px-6 py-1.5 border-t border-garden-border bg-garden-surface font-mono text-[10px] text-garden-dim flex-shrink-0">
        <span>agents: <span className="text-garden-accent">{agents.length}</span></span>
        <span>teams: <span className="text-garden-accent">{teams.length}</span></span>
        <span>active: <span className="text-garden-accent">{totalActive}</span></span>
      </div>
    </>
  )
}

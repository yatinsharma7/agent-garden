import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useGardenStore } from '@/lib/store'
import { teamsApi, agentsApi } from '@/lib/api'
import { SideRail } from '@/components/nav/SideRail'
import { BottomNav } from '@/components/nav/BottomNav'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { TeamModal } from '@/components/modals/TeamModal'
import { AgentModal } from '@/components/modals/AgentModal'

export function Layout() {
  const { teamOrder, setTeams, setAgents, setTeamOrder, openTeamModal, openAgentModal } = useGardenStore()
  const [showAddSheet, setShowAddSheet] = useState(false)

  useEffect(() => {
    teamsApi.list().then(data => {
      setTeams(data)
      if (teamOrder.length === 0) setTeamOrder(data.map(t => t.id))
    })
    agentsApi.list().then(setAgents)
  }, [])

  return (
    <div className="flex h-screen bg-garden-bg text-garden-text font-sans overflow-hidden">

      <SideRail />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>

      <ChatPanel />
      <BottomNav onAdd={() => setShowAddSheet(true)} />

      {/* MOBILE ADD SHEET */}
      {showAddSheet && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setShowAddSheet(false)}>
          <div className="w-full bg-garden-surface rounded-t-2xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-garden-border2 rounded-full mx-auto mb-6" />
            <div className="font-mono text-[10px] text-garden-dim tracking-widest uppercase mb-4">Add</div>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-garden-bg border border-garden-border mb-3 text-left"
              onClick={() => { setShowAddSheet(false); openTeamModal() }}
            >
              <span className="text-xl">👥</span>
              <div>
                <div className="text-sm font-medium text-garden-text">New Team</div>
                <div className="text-xs text-garden-muted">Create a team of agents</div>
              </div>
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-garden-bg border border-garden-border text-left"
              onClick={() => { setShowAddSheet(false); openAgentModal() }}
            >
              <span className="text-xl">🤖</span>
              <div>
                <div className="text-sm font-medium text-garden-text">Deploy Agent</div>
                <div className="text-xs text-garden-muted">Add an agent to a team</div>
              </div>
            </button>
          </div>
        </div>
      )}

      <TeamModal />
      <AgentModal />
    </div>
  )
}

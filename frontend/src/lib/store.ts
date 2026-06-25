import { create } from 'zustand'
import type { Team, Agent, Message } from '@/types'

interface GardenStore {
  // Data
  teams: Team[]
  agents: Agent[]
  messages: Record<string, Message[]> // agentId -> messages

  // UI state
  activeTeamId: string | null
  activeAgentId: string | null
  panelOpen: boolean

  // Actions
  setTeams: (teams: Team[]) => void
  setAgents: (agents: Agent[]) => void
  addTeam: (team: Team) => void
  updateTeam: (team: Team) => void
  removeTeam: (id: string) => void
  addAgent: (agent: Agent) => void
  updateAgent: (agent: Agent) => void
  removeAgent: (id: string) => void
  setMessages: (agentId: string, messages: Message[]) => void
  appendMessage: (agentId: string, message: Message) => void
  clearMessages: (agentId: string) => void
  setActiveTeam: (id: string | null) => void
  setActiveAgent: (id: string | null) => void
  openPanel: (agentId: string) => void
  closePanel: () => void
}

export const useGardenStore = create<GardenStore>((set) => ({
  teams: [],
  agents: [],
  messages: {},
  activeTeamId: null,
  activeAgentId: null,
  panelOpen: false,

  setTeams: (teams) => set({ teams }),
  setAgents: (agents) => set({ agents }),

  addTeam: (team) => set((s) => ({ teams: [...s.teams, team] })),
  updateTeam: (team) => set((s) => ({ teams: s.teams.map(t => t.id === team.id ? team : t) })),
  removeTeam: (id) => set((s) => ({
    teams: s.teams.filter(t => t.id !== id),
    agents: s.agents.filter(a => a.team_id !== id),
  })),

  addAgent: (agent) => set((s) => ({ agents: [...s.agents, agent] })),
  updateAgent: (agent) => set((s) => ({ agents: s.agents.map(a => a.id === agent.id ? agent : a) })),
  removeAgent: (id) => set((s) => ({ agents: s.agents.filter(a => a.id !== id) })),

  setMessages: (agentId, messages) => set((s) => ({ messages: { ...s.messages, [agentId]: messages } })),
  appendMessage: (agentId, message) => set((s) => ({
    messages: { ...s.messages, [agentId]: [...(s.messages[agentId] || []), message] }
  })),
  clearMessages: (agentId) => set((s) => ({ messages: { ...s.messages, [agentId]: [] } })),

  setActiveTeam: (id) => set({ activeTeamId: id }),
  setActiveAgent: (id) => set({ activeAgentId: id }),
  openPanel: (agentId) => set({ activeAgentId: agentId, panelOpen: true }),
  closePanel: () => set({ panelOpen: false, activeAgentId: null }),
}))

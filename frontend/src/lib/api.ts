import axios from 'axios'
import type { Team, Agent, Message, ChatResponse } from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

// ── TEAMS ──
export const teamsApi = {
  list: () => api.get<Team[]>('/api/teams/').then(r => r.data),
  create: (data: Omit<Team, 'id' | 'created_at' | 'agent_count'>) =>
    api.post<Team>('/api/teams/', data).then(r => r.data),
  update: (id: string, data: Partial<Team>) =>
    api.patch<Team>(`/api/teams/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/teams/${id}`),
}

// ── AGENTS ──
export const agentsApi = {
  list: (teamId?: string) =>
    api.get<Agent[]>('/api/agents/', { params: teamId ? { team_id: teamId } : {} }).then(r => r.data),
  create: (data: Omit<Agent, 'id' | 'created_at' | 'status'>) =>
    api.post<Agent>('/api/agents/', data).then(r => r.data),
  update: (id: string, data: Partial<Agent>) =>
    api.patch<Agent>(`/api/agents/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/agents/${id}`),
}

// ── CHAT ──
export const chatApi = {
  getHistory: (agentId: string) =>
    api.get<Message[]>(`/api/chat/${agentId}/history`).then(r => r.data),
  send: (agentId: string, message: string) =>
    api.post<ChatResponse>('/api/chat/', { agent_id: agentId, message }).then(r => r.data),
  clearHistory: (agentId: string) =>
    api.delete(`/api/chat/${agentId}/history`),
}

export default api

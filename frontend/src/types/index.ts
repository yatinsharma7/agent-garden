export type AgentRole =
  | 'Engineer'
  | 'Data Engineer'
  | 'Architect'
  | 'Lead'
  | 'DevOps Engineer'
  | 'ML Engineer'
  | 'Backend Engineer'
  | 'Frontend Engineer'
  | 'Security Engineer'
  | 'Data Scientist'
  | 'Analytics Engineer'

export type AgentStatus = 'idle' | 'thinking' | 'done' | 'error'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Team {
  id: string
  name: string
  field: string
  color: string
  created_at: string
  agent_count?: number
}

export interface Agent {
  id: string
  name: string
  role: AgentRole
  team_id: string
  specialty?: string
  status: AgentStatus
  created_at: string
}

export interface Message {
  id: string
  agent_id: string
  role: MessageRole
  content: string
  created_at: string
}

export interface ChatResponse {
  agent_id: string
  message: { role: MessageRole; content: string }
  usage?: { input_tokens: number; output_tokens: number }
}

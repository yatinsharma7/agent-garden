import type { AgentRole } from '@/types'

export const ROLE_COLORS: Record<AgentRole, string> = {
  'Engineer': '#60a5fa',
  'Data Engineer': '#f59e0b',
  'Architect': '#c084fc',
  'Lead': '#fb7185',
  'DevOps Engineer': '#60a5fa',
  'ML Engineer': '#f59e0b',
  'Backend Engineer': '#60a5fa',
  'Frontend Engineer': '#60a5fa',
  'Security Engineer': '#fb7185',
  'Data Scientist': '#f59e0b',
  'Analytics Engineer': '#f59e0b',
}

export const ROLE_EMOJIS: Record<AgentRole, string> = {
  'Engineer': '⚙️',
  'Data Engineer': '🗄️',
  'Architect': '🏗️',
  'Lead': '🧭',
  'DevOps Engineer': '🔧',
  'ML Engineer': '🧠',
  'Backend Engineer': '⚙️',
  'Frontend Engineer': '🎨',
  'Security Engineer': '🔒',
  'Data Scientist': '📊',
  'Analytics Engineer': '📈',
}

export const ALL_ROLES: AgentRole[] = [
  'Engineer',
  'Data Engineer',
  'Architect',
  'Lead',
  'DevOps Engineer',
  'ML Engineer',
  'Backend Engineer',
  'Frontend Engineer',
  'Security Engineer',
  'Data Scientist',
  'Analytics Engineer',
]

export const TEAM_COLORS = [
  { label: 'Green',   value: '#4ade80' },
  { label: 'Blue',    value: '#60a5fa' },
  { label: 'Amber',   value: '#f59e0b' },
  { label: 'Purple',  value: '#c084fc' },
  { label: 'Rose',    value: '#fb7185' },
  { label: 'Emerald', value: '#34d399' },
  { label: 'Orange',  value: '#f97316' },
]

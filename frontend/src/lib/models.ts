export interface ModelDef {
  id: string
  name: string
  provider: 'anthropic' | 'openai' | 'google'
  badge?: string
  tags: string[]
  color: string        // card header bg
  textColor: string    // icon/text on header
  available: boolean
}

export const MODELS: ModelDef[] = [
  // ── Claude ──
  {
    id: 'claude-fable-5',
    name: 'Fable 5',
    provider: 'anthropic',
    badge: 'New',
    tags: ['Most capable', 'Research', 'Multi-day tasks'],
    color: '#5B8DEF',
    textColor: '#ffffff',
    available: true,
  },
  {
    id: 'claude-opus-4-8',
    name: 'Opus 4.8',
    provider: 'anthropic',
    tags: ['Complex projects', 'Agents', 'Coding'],
    color: '#E07B54',
    textColor: '#ffffff',
    available: true,
  },
  {
    id: 'claude-sonnet-5',
    name: 'Sonnet 5',
    provider: 'anthropic',
    badge: 'New',
    tags: ['Everyday tasks', 'Writing', 'Cost-efficient'],
    color: '#C8BEA8',
    textColor: '#1a1a1a',
    available: true,
  },
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Haiku 4.5',
    provider: 'anthropic',
    tags: ['Fastest', 'Lowest cost', 'High volume'],
    color: '#8BAF8D',
    textColor: '#ffffff',
    available: true,
  },
  // ── OpenAI ──
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    tags: ['Multimodal', 'Fast', 'Versatile'],
    color: '#10A37F',
    textColor: '#ffffff',
    available: false,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    tags: ['Lightweight', 'Low cost', 'High volume'],
    color: '#1A7F64',
    textColor: '#ffffff',
    available: false,
  },
  {
    id: 'o3',
    name: 'o3',
    provider: 'openai',
    tags: ['Reasoning', 'Complex tasks', 'STEM'],
    color: '#2D2D2D',
    textColor: '#ffffff',
    available: false,
  },
  // ── Google ──
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    tags: ['Long context', 'Multimodal', 'Research'],
    color: '#4285F4',
    textColor: '#ffffff',
    available: false,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    tags: ['Fast', 'Efficient', 'High volume'],
    color: '#34A853',
    textColor: '#ffffff',
    available: false,
  },
]

export const PROVIDER_LABELS: Record<ModelDef['provider'], string> = {
  anthropic: 'Claude · Anthropic',
  openai: 'OpenAI',
  google: 'Google',
}

export const DEFAULT_MODEL = 'claude-sonnet-5'

export function getModel(id: string): ModelDef {
  return MODELS.find(m => m.id === id) ?? MODELS.find(m => m.id === DEFAULT_MODEL)!
}

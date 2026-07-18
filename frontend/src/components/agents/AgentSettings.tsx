import { useState } from 'react'
import { agentsApi } from '@/lib/api'
import { useGardenStore } from '@/lib/store'
import { ModelPicker } from '@/components/models/ModelPicker'
import { getModel } from '@/lib/models'
import { ALL_ROLES } from '@/lib/constants'
import type { Agent, AgentRole } from '@/types'

interface Props {
  agent: Agent
  onClose: () => void
}

export function AgentSettings({ agent, onClose }: Props) {
  const { updateAgent, removeAgent } = useGardenStore()
  const [name, setName] = useState(agent.name)
  const [role, setRole] = useState<AgentRole>(agent.role)
  const [specialty, setSpecialty] = useState(agent.specialty ?? '')
  const [model, setModel] = useState(agent.model ?? 'claude-sonnet-5')
  const [tab, setTab] = useState<'general' | 'model'>('general')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await agentsApi.update(agent.id, { name, role, specialty, model })
      updateAgent(updated)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await agentsApi.delete(agent.id)
      removeAgent(agent.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-garden-surface border border-garden-border2 rounded-t-2xl md:rounded-xl w-full max-w-[520px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-garden-border">
          <div>
            <div className="text-sm font-semibold text-garden-text">{agent.name}</div>
            <div className="font-mono text-[10px] text-garden-dim mt-0.5">Agent settings</div>
          </div>
          <button className="text-garden-dim hover:text-garden-text text-lg leading-none" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-garden-border px-5">
          {(['general', 'model'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-mono text-[11px] px-4 py-2.5 border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'border-garden-accent text-garden-accent'
                  : 'border-transparent text-garden-dim hover:text-garden-text'
              }`}
            >
              {t === 'model' ? `Model · ${getModel(model).name}` : t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {tab === 'general' ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">NAME</label>
                <input
                  className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">ROLE</label>
                <select
                  className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent"
                  value={role}
                  onChange={e => setRole(e.target.value as AgentRole)}
                >
                  {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">SPECIALTY / FOCUS</label>
                <input
                  className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent"
                  placeholder="e.g. distributed systems, ETL pipelines"
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <ModelPicker value={model} onChange={setModel} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-garden-border">
          <button
            className="font-mono text-[11px] px-3 py-1.5 border border-red-500/30 rounded text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete agent'}
          </button>
          <div className="flex gap-2">
            <button
              className="font-mono text-[11px] px-3 py-1.5 border border-garden-border2 rounded text-garden-muted hover:text-garden-text transition-all"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="font-mono text-[11px] px-4 py-1.5 bg-garden-accent text-garden-bg rounded font-semibold hover:bg-garden-accent2 transition-all disabled:opacity-40"
              onClick={handleSave}
              disabled={saving || !name.trim()}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

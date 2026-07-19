import { useState } from 'react'
import { useGardenStore } from '@/lib/store'
import { teamsApi } from '@/lib/api'
import { TEAM_COLORS } from '@/lib/constants'

export function TeamModal() {
  const { teamModalOpen, closeTeamModal, addTeam, teamOrder, setTeamOrder } = useGardenStore()
  const [name, setName] = useState('')
  const [field, setField] = useState('')
  const [color, setColor] = useState(TEAM_COLORS[0].value)

  if (!teamModalOpen) return null

  const handleCreate = async () => {
    if (!name.trim()) return
    const team = await teamsApi.create({ name, field: field || 'General', color })
    addTeam(team)
    setTeamOrder([...teamOrder, team.id])
    setName(''); setField(''); setColor(TEAM_COLORS[0].value)
    closeTeamModal()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={closeTeamModal}>
      <div className="bg-garden-surface border border-garden-border2 rounded-lg p-6 w-full max-w-[420px] mx-4" onClick={e => e.stopPropagation()}>
        <div className="text-base font-semibold mb-4">New Team</div>
        <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">TEAM NAME</label>
        <input className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-3" placeholder="e.g. Platform Engineering" value={name} onChange={e => setName(e.target.value)} autoFocus />
        <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">FIELD / DOMAIN</label>
        <input className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-3" placeholder="e.g. Infrastructure, Analytics" value={field} onChange={e => setField(e.target.value)} />
        <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">COLOR</label>
        <select className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-4" value={color} onChange={e => setColor(e.target.value)}>
          {TEAM_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <button className="font-mono text-[11px] px-3 py-1.5 border border-garden-border2 rounded text-garden-muted hover:text-garden-text transition-all" onClick={closeTeamModal}>Cancel</button>
          <button className="font-mono text-[11px] px-3 py-1.5 bg-garden-accent text-garden-bg rounded font-semibold hover:bg-garden-accent2 transition-all" onClick={handleCreate}>Create Team</button>
        </div>
      </div>
    </div>
  )
}

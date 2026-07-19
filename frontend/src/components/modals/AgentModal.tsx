import { useState, useEffect } from 'react'
import { useGardenStore } from '@/lib/store'
import { agentsApi } from '@/lib/api'
import { ALL_ROLES } from '@/lib/constants'
import { ModelPicker } from '@/components/models/ModelPicker'
import { DEFAULT_MODEL, getModel } from '@/lib/models'
import type { AgentRole } from '@/types'

export function AgentModal() {
  const { teams, agentModalOpen, agentModalTeamId, closeAgentModal, addAgent } = useGardenStore()
  const [name, setName] = useState('')
  const [role, setRole] = useState<AgentRole>('Engineer')
  const [teamId, setTeamId] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [step, setStep] = useState<'details' | 'model'>('details')

  useEffect(() => {
    if (agentModalOpen) {
      setTeamId(agentModalTeamId || teams[0]?.id || '')
      setStep('details')
    }
  }, [agentModalOpen, agentModalTeamId])

  if (!agentModalOpen) return null

  const handleDeploy = async () => {
    if (!name.trim() || !teamId) return
    const agent = await agentsApi.create({ name, role, team_id: teamId, specialty, model })
    addAgent(agent)
    setName(''); setSpecialty(''); setModel(DEFAULT_MODEL)
    closeAgentModal()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center" onClick={closeAgentModal}>
      <div className="bg-garden-surface border border-garden-border2 rounded-t-2xl md:rounded-xl w-full max-w-[520px] mx-0 md:mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Step indicator */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-garden-border">
          <div className="text-sm font-semibold text-garden-text">Deploy Agent</div>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-1.5 rounded-full transition-colors ${step === 'details' ? 'bg-garden-accent' : 'bg-garden-border2'}`} />
            <div className={`w-6 h-1.5 rounded-full transition-colors ${step === 'model' ? 'bg-garden-accent' : 'bg-garden-border2'}`} />
          </div>
        </div>

        <div className="px-5 py-4 max-h-[75vh] overflow-y-auto">
          {step === 'details' ? (
            <>
              <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">AGENT NAME</label>
              <input className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-3" placeholder="e.g. Nova, Axiom, Codexa" value={name} onChange={e => setName(e.target.value)} autoFocus />
              <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">ROLE</label>
              <select className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-3" value={role} onChange={e => setRole(e.target.value as AgentRole)}>
                {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">TEAM</label>
              <select className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent mb-3" value={teamId} onChange={e => setTeamId(e.target.value)}>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <label className="block font-mono text-[11px] text-garden-muted tracking-wide mb-1">SPECIALTY / FOCUS</label>
              <input className="w-full bg-garden-bg border border-garden-border2 rounded px-2.5 py-2 text-sm text-garden-text outline-none focus:border-garden-accent" placeholder="e.g. distributed systems, ETL pipelines" value={specialty} onChange={e => setSpecialty(e.target.value)} />
            </>
          ) : (
            <ModelPicker value={model} onChange={setModel} />
          )}
        </div>

        <div className="flex justify-between gap-2 px-5 py-4 border-t border-garden-border">
          {step === 'details' ? (
            <>
              <button className="font-mono text-[11px] px-3 py-1.5 border border-garden-border2 rounded text-garden-muted hover:text-garden-text transition-all" onClick={closeAgentModal}>Cancel</button>
              <button className="font-mono text-[11px] px-4 py-1.5 bg-garden-accent text-garden-bg rounded font-semibold hover:bg-garden-accent2 transition-all" onClick={() => name.trim() && setStep('model')}>
                Next: Choose Model →
              </button>
            </>
          ) : (
            <>
              <button className="font-mono text-[11px] px-3 py-1.5 border border-garden-border2 rounded text-garden-muted hover:text-garden-text transition-all" onClick={() => setStep('details')}>← Back</button>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-garden-dim">{getModel(model).name}</span>
                <button className="font-mono text-[11px] px-4 py-1.5 bg-garden-accent text-garden-bg rounded font-semibold hover:bg-garden-accent2 transition-all" onClick={handleDeploy}>Deploy Agent</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

import { MODELS, PROVIDER_LABELS, type ModelDef } from '@/lib/models'

interface Props {
  value: string
  onChange: (id: string) => void
}

const PROVIDERS: ModelDef['provider'][] = ['anthropic', 'openai', 'google']

const PROVIDER_ICONS: Record<ModelDef['provider'], string> = {
  anthropic: '◆',
  openai: '⬡',
  google: '◉',
}

function ModelIcon({ model }: { model: ModelDef }) {
  if (model.provider === 'anthropic') {
    if (model.id.includes('fable'))   return <FableIcon />
    if (model.id.includes('opus'))    return <OpusIcon />
    if (model.id.includes('sonnet'))  return <SonnetIcon />
    if (model.id.includes('haiku'))   return <HaikuIcon />
  }
  return <span style={{ color: model.textColor, fontSize: 28 }}>{PROVIDER_ICONS[model.provider]}</span>
}

export function ModelPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {PROVIDERS.map(provider => (
        <div key={provider}>
          <div className="font-mono text-[10px] text-garden-dim tracking-widest uppercase mb-2">
            {PROVIDER_LABELS[provider]}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MODELS.filter(m => m.provider === provider).map(model => {
              const selected = value === model.id
              return (
                <button
                  key={model.id}
                  disabled={!model.available}
                  onClick={() => model.available && onChange(model.id)}
                  className={`
                    relative text-left rounded-xl border transition-all overflow-hidden
                    ${selected
                      ? 'border-garden-accent ring-1 ring-garden-accent'
                      : 'border-garden-border hover:border-garden-border2'}
                    ${!model.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Coloured header */}
                  <div
                    className="h-[72px] flex items-center justify-center"
                    style={{ background: model.color }}
                  >
                    <ModelIcon model={model} />
                  </div>

                  {/* Body */}
                  <div className="bg-garden-surface px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs font-semibold text-garden-text">{model.name}</span>
                      {model.badge && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-garden-accent/20 text-garden-accent border border-garden-accent/30">
                          {model.badge}
                        </span>
                      )}
                      {!model.available && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-garden-border text-garden-dim">
                          Soon
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {model.tags.map(tag => (
                        <span key={tag} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-garden-bg text-garden-muted border border-garden-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-garden-accent flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#0a0f0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// SVG icons matching Anthropic console aesthetic
function FableIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="20" r="10" stroke="white" strokeWidth="1.5"/>
      <circle cx="24" cy="20" r="3" fill="white"/>
      <line x1="14" y1="20" x2="6" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="34" y1="20" x2="42" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="10" x2="24" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="30" x2="24" y2="36" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 34 Q24 44 30 34" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function OpusIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="3" fill="white"/>
      <line x1="24" y1="24" x2="8"  y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="38" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="40" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="28" y2="40" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="10" y2="36" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="8"  y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function SonnetIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="3" fill="#1a1a1a"/>
      <line x1="24" y1="24" x2="24" y2="8"  stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="38" y2="16" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="38" y2="32" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="24" y2="40" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="10" y2="32" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="10" y2="16" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function HaikuIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M24 8 C32 14 38 20 36 28 C34 36 26 40 20 36 C14 32 12 24 16 18 C20 12 28 10 32 16" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M20 36 C18 40 20 44 24 42" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

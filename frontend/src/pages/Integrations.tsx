import { useState, useEffect } from 'react'
import { authApi } from '@/lib/api'

interface Connection {
  connected: boolean
  expired: boolean
  scope: string
  connected_at: string
}

const CONNECTORS = [
  {
    id: 'adobe',
    name: 'Adobe Journey Optimizer',
    description: 'Access RTCDP audiences, segments, and journey data',
    icon: '🔺',
    color: '#FF0000',
    connect: () => authApi.connectAdobe(),
  },
]

export function Integrations() {
  const [connections, setConnections] = useState<Record<string, Connection>>({})
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await authApi.listConnections()
      setConnections(data)
    } catch {
      // backend may not have the table yet
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Check if we just returned from OAuth callback
    const params = new URLSearchParams(window.location.search)
    if (params.get('connected')) {
      window.history.replaceState({}, '', '/integrations')
      load()
    }
    if (params.get('error')) {
      window.history.replaceState({}, '', '/integrations')
    }
  }, [])

  const handleDisconnect = async (provider: string) => {
    if (!confirm(`Disconnect ${provider}?`)) return
    setDisconnecting(provider)
    try {
      await authApi.disconnect(provider)
      await load()
    } finally {
      setDisconnecting(null)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-garden-bg text-garden-text font-sans overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 h-[52px] border-b border-garden-border bg-garden-surface flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-mono text-sm font-semibold text-garden-accent tracking-widest">
            AGENT<span className="text-garden-muted font-normal">GARDEN</span>
          </div>
          <div className="font-mono text-[11px] text-garden-muted flex items-center gap-1.5">
            <span>org</span><span className="text-garden-dim">/</span>
            <span>garden</span><span className="text-garden-dim">/</span>
            <span className="text-garden-text">integrations</span>
          </div>
        </div>
        <a href="/" className="font-mono text-[11px] px-3 py-1.5 border border-garden-border2 rounded text-garden-muted hover:text-garden-text transition-all">
          ← Garden
        </a>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 max-w-3xl w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-garden-text">Integrations</h1>
          <p className="text-sm text-garden-muted mt-1">
            Connect external platforms so your agents can access data and take actions.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 border-b border-garden-border pb-3">
          {['All', 'Connected', 'Not connected'].map(tab => (
            <button key={tab} className="font-mono text-[11px] px-3 py-1 rounded text-garden-muted hover:text-garden-text transition-all first:text-garden-text first:bg-garden-surface first:border first:border-garden-border2">
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="font-mono text-[11px] text-garden-dim animate-pulse">Loading connections...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {CONNECTORS.map(connector => {
              const conn = connections[connector.id]
              const isConnected = conn?.connected && !conn?.expired
              const isExpired = conn?.connected && conn?.expired

              return (
                <div
                  key={connector.id}
                  className="bg-garden-surface border border-garden-border rounded-xl p-4 md:p-5 flex items-center gap-4 md:gap-5"
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border"
                    style={{ background: `${connector.color}15`, borderColor: `${connector.color}30` }}
                  >
                    {connector.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-garden-text">{connector.name}</span>
                      {isConnected && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                          Connected
                        </span>
                      )}
                      {isExpired && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                          Expired
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-garden-muted mt-0.5">{connector.description}</div>
                    {isConnected && conn.connected_at && (
                      <div className="font-mono text-[10px] text-garden-dim mt-1">
                        Connected {new Date(conn.connected_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex gap-2 flex-shrink-0">
                    {isConnected ? (
                      <button
                        className="font-mono text-[11px] px-3 py-1.5 border border-garden-border2 rounded text-garden-muted hover:border-red-500/50 hover:text-red-400 transition-all disabled:opacity-40"
                        onClick={() => handleDisconnect(connector.id)}
                        disabled={disconnecting === connector.id}
                      >
                        {disconnecting === connector.id ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    ) : (
                      <button
                        className="font-mono text-[11px] px-4 py-1.5 bg-garden-accent text-garden-bg rounded font-semibold hover:bg-garden-accent2 transition-all"
                        onClick={connector.connect}
                      >
                        {isExpired ? 'Reconnect →' : 'Connect →'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

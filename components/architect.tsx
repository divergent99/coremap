'use client'

import { useState, useCallback, useEffect } from 'react'
import { Cpu, ExternalLink } from 'lucide-react'
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

type Component = {
  name: string
  type: string
  description: string
  options: { name: string; url: string }[]
}

type Architecture = {
  title: string
  summary: string
  components: Component[]
  flow: string[]
  caveats: string[]
}

const TYPE_CONFIG: Record<string, { color: string; badge: string; node: string }> = {
  'llm':           { color: 'border-l-violet-500', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', node: '#7c3aed' },
  'vector-db':     { color: 'border-l-blue-500',   badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     node: '#2563eb' },
  'embedding':     { color: 'border-l-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', node: '#059669' },
  'orchestration': { color: 'border-l-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', node: '#d97706' },
  'storage':       { color: 'border-l-orange-500', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', node: '#ea580c' },
  'api':           { color: 'border-l-pink-500',   badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',     node: '#db2777' },
  'frontend':      { color: 'border-l-cyan-500',   badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',     node: '#0891b2' },
  'monitoring':    { color: 'border-l-red-500',    badge: 'bg-red-500/10 text-red-400 border-red-500/20',        node: '#dc2626' },
  'default':       { color: 'border-l-white/20',   badge: 'bg-white/5 text-white/40 border-white/10',            node: '#374151' },
}

const EXAMPLE_PROMPTS = [
  'RAG pipeline for a legal document search tool',
  'Real-time AI customer support agent',
  'Multi-modal image + text product search',
  'Autonomous coding agent with code execution',
]

function buildGraph(components: Component[]) {
  const total = components.length
  const cols = total <= 4 ? 2 : 3
  const xGap = 260
  const yGap = 140

  const nodes: Node[] = components.map((comp, i) => {
    const cfg = TYPE_CONFIG[comp.type] ?? TYPE_CONFIG['default']
    const col = i % cols
    const row = Math.floor(i / cols)
    const itemsInLastRow = total % cols || cols
    const isLastRow = row === Math.floor((total - 1) / cols)
    const xOffset = isLastRow && itemsInLastRow < cols
      ? ((cols - itemsInLastRow) * xGap) / 2
      : 0
    return {
      id: `node-${i}`,
      position: { x: col * xGap + xOffset + 40, y: row * yGap + 40 },
      data: {
        label: (
          <div className="text-left px-1">
            <div className="text-xs font-semibold text-white leading-tight mb-1">{comp.name}</div>
            <div className="text-[10px]" style={{ color: cfg.node }}>{comp.type}</div>
          </div>
        ),
      },
      style: {
        background: '#0d0d1a',
        border: `1px solid ${cfg.node}40`,
        borderLeft: `3px solid ${cfg.node}`,
        borderRadius: '10px',
        padding: '10px 14px',
        minWidth: '180px',
        maxWidth: '220px',
        color: 'white',
        fontSize: '12px',
      },
    }
  })

  const edges: Edge[] = []

  components.forEach((_, i) => {
    if (i < components.length - 1) {
      edges.push({
        id: `edge-seq-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
        label: `→ step ${i + 1}`,
        labelStyle: { fill: '#ffffff40', fontSize: 9, fontFamily: 'monospace' },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#0d0d1a', fillOpacity: 0.8 },
        style: { stroke: '#ffffff20', strokeWidth: 1.5 },
        animated: true,
      })
    }
  })

  const findByType = (type: string) =>
    components.findIndex((c) => c.type === type)

  const typePairs: [string, string, string][] = [
    ['embedding', 'vector-db', 'indexes'],
    ['orchestration', 'llm', 'prompts'],
    ['llm', 'monitoring', 'traces'],
    ['api', 'frontend', 'response'],
    ['storage', 'llm', 'context'],
    ['vector-db', 'llm', 'retrieves'],
  ]

  typePairs.forEach(([from, to, label], i) => {
    const src = findByType(from)
    const tgt = findByType(to)
    if (src !== -1 && tgt !== -1 && src !== tgt - 1 && src !== tgt + 1) {
      edges.push({
        id: `edge-cross-${i}`,
        source: `node-${src}`,
        target: `node-${tgt}`,
        label,
        labelStyle: { fill: '#ffffff25', fontSize: 9, fontFamily: 'monospace' },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#0d0d1a', fillOpacity: 0.7 },
        style: { stroke: '#ffffff10', strokeWidth: 1, strokeDasharray: '5 5' },
        animated: false,
      })
    }
  })

  return { nodes, edges }
}

function ArchitectGraph({ components }: { components: Component[] }) {
  const { nodes: initialNodes, edges: initialEdges } = buildGraph(components)
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="w-full rounded-xl border border-white/5 overflow-hidden" style={{ height: '480px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
        style={{ background: 'transparent' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ffffff05" />
        <Controls
          style={{
            background: '#0d0d1a',
            border: '1px solid #ffffff10',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>
    </div>
  )
}

export function Architect() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [architecture, setArchitecture] = useState<Architecture | null>(null)
  const [error, setError] = useState('')

  // Restore saved architecture on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('coremap-architecture')
      const savedPrompt = localStorage.getItem('coremap-arch-prompt')
      if (saved) {
        setArchitecture(JSON.parse(saved))
        if (savedPrompt) setPrompt(savedPrompt)
      }
    } catch {
      localStorage.removeItem('coremap-architecture')
    }
  }, [])

  async function handleGenerate() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setArchitecture(data)
      localStorage.setItem('coremap-architecture', JSON.stringify(data))
      localStorage.setItem('coremap-arch-prompt', prompt)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setArchitecture(null)
    setPrompt('')
    localStorage.removeItem('coremap-architecture')
    localStorage.removeItem('coremap-arch-prompt')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-6 text-center py-20">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="size-2.5 rounded-full bg-white animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-white">Designing your architecture...</p>
          <p className="text-xs text-white/40">Thinking through components and tradeoffs</p>
        </div>
      </div>
    )
  }

  if (architecture) {
    return (
      <div className="w-full">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-white">{architecture.title}</h2>
          <p className="mt-2 text-sm text-white/60 max-w-2xl mx-auto">{architecture.summary}</p>
        </div>

        <div className="mb-8">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Architecture graph</p>
          <ArchitectGraph components={architecture.components} />
        </div>

        <div className="mb-4">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Components</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
          {architecture.components.map((comp) => {
            const cfg = TYPE_CONFIG[comp.type] ?? TYPE_CONFIG['default']
            return (
              <div key={comp.name} className={`rounded-xl border border-white/5 border-l-4 bg-[#0d0d1a] p-4 ${cfg.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{comp.name}</h3>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
                    {comp.type}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-white/50 mb-3">{comp.description}</p>
                {comp.options?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {comp.options.map((opt) => (
                      <a key={opt.name} href={opt.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                        {opt.name}
                        <ExternalLink className="size-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mb-6 rounded-xl border border-white/5 bg-[#0d0d1a] p-5">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Request flow</p>
          <div className="flex flex-col gap-3">
            {architecture.flow.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-mono text-white/60 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs leading-relaxed text-white/60">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {architecture.caveats?.length > 0 && (
          <div className="mb-8 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Watch out for</p>
            <ul className="flex flex-col gap-2">
              {architecture.caveats.map((c, i) => (
                <li key={i} className="text-xs text-white/50 leading-relaxed flex gap-2">
                  <span className="text-yellow-500 shrink-0">·</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center">
          <button onClick={handleReset}
            className="text-sm text-white/40 hover:text-white transition-colors">
            Design another architecture
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <Cpu className="size-8 text-white/20 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-white">Architecture Simulator</h2>
        <p className="mt-2 text-sm text-white/50">
          Describe your GenAI use case and get a full stack architecture with components, tradeoffs, and tool recommendations.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A RAG pipeline for searching legal documents with citations..."
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-[#0d0d1a] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none resize-none transition-colors focus:border-white/30"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-[#1a1a2e] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#252540] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Cpu className="size-4" />
          Generate architecture
        </button>

        <div className="mt-2">
          <p className="text-xs text-white/30 mb-3">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((p) => (
              <button key={p} onClick={() => setPrompt(p)}
                className="rounded-lg border border-white/10 bg-[#0d0d1a] px-3 py-1.5 text-xs text-white/50 hover:text-white hover:border-white/20 transition-all">
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
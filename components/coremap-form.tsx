'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Sparkles, ArrowLeft, ExternalLink, Check, X, RefreshCw } from 'lucide-react'
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  BACKGROUNDS,
  GOALS,
  generateRoadmap,
  type Background,
  type Goal,
  type Roadmap,
  type RoadmapStep,
} from '@/lib/roadmap'

function getUserId(): string {
  if (typeof window === 'undefined') return ''
  let userId = localStorage.getItem('coremap-user-id')
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem('coremap-user-id', userId)
  }
  return userId
}

async function syncProgress(conceptId: string, status: 'done' | 'undone', background: string, goal: string) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: getUserId(),
        conceptId,
        status,
        background,
        goal,
      }),
    })
  } catch (e) {
    console.error('Failed to sync progress', e)
  }
}

async function loadProgress(): Promise<string[]> {
  try {
    const userId = getUserId()
    const res = await fetch(`/api/progress?userId=${userId}`)
    const data = await res.json()
    return data.done ?? []
  } catch {
    return []
  }
}

const CATEGORY_CONFIG = {
  'foundational': {
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    glow: 'shadow-emerald-500/20',
    label: 'Foundational',
    color: '#059669',
  },
  'worth-knowing': {
    border: 'border-l-blue-500',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    glow: 'shadow-blue-500/20',
    label: 'Worth knowing',
    color: '#2563eb',
  },
  'hype-skip': {
    border: 'border-l-red-500',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    glow: 'shadow-red-500/20',
    label: 'Hype / skip',
    color: '#dc2626',
  },
}

function Field({
  label, placeholder, value, options, onChange,
}: {
  label: string
  placeholder: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-white">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-white/10 bg-[#0d0d1a] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-white/30"
        >
          <option value="" disabled className="bg-[#0d0d1a]">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#0d0d1a]">{option}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
      </div>
    </div>
  )
}

function LoadingState() {
  const steps = [
    'Analyzing your background...',
    'Mapping the GenAI landscape...',
    'Filtering signal from hype...',
    'Curating your learning path...',
    'Almost there...',
  ]
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 text-center py-20">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="size-2.5 rounded-full bg-white animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-white">{steps[currentStep]}</p>
        <p className="text-xs text-white/40">This takes about 60 seconds</p>
      </div>
    </div>
  )
}

function StepPanel({
  step, index, isDone, onToggle, onClose,
}: {
  step: RoadmapStep
  index: number
  isDone: boolean
  onToggle: () => void
  onClose: () => void
}) {
  const cfg = CATEGORY_CONFIG[step.category] ?? CATEGORY_CONFIG['worth-knowing']

  return (
    <div className="fixed right-0 top-0 h-screen w-80 z-50 flex flex-col border-l border-white/10 bg-[#07070f] shadow-2xl overflow-hidden">
      <div className={`p-5 border-b border-white/5 border-l-4 shrink-0 ${cfg.border}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-mono text-white/30">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="mt-1 text-sm font-semibold text-white leading-snug">{step.title}</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors shrink-0 mt-0.5">
            <X className="size-4" />
          </button>
        </div>
        <span className={`mt-3 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5" style={{ minHeight: 0, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <p className="text-xs leading-relaxed text-white/60 mb-6">{step.detail}</p>
        {step.resources?.length > 0 && (
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Resources</p>
            <div className="flex flex-col gap-2">
              {step.resources.map((r) => (
                <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors group">
                  <span className="truncate">{r.label}</span>
                  <ExternalLink className="size-3 shrink-0 text-white/30 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-white/5 shrink-0">
        <button onClick={onToggle}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            isDone
              ? 'border border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
              : 'bg-white text-black hover:bg-white/90'
          }`}>
          {isDone ? <><X className="size-4" />Mark as not done</> : <><Check className="size-4" />Mark as done</>}
        </button>
      </div>
    </div>
  )
}

function buildRoadmapGraph(steps: RoadmapStep[], done: Set<string>) {
  const cols = 4
  const xGap = 220
  const yGap = 150

  const nodes: Node[] = steps.map((step, i) => {
    const cfg = CATEGORY_CONFIG[step.category] ?? CATEGORY_CONFIG['worth-knowing']
    const isDone = done.has(step.id)
    const col = i % cols
    const row = Math.floor(i / cols)
    const itemsInLastRow = steps.length % cols || cols
    const isLastRow = row === Math.floor((steps.length - 1) / cols)
    const xOffset = isLastRow && itemsInLastRow < cols ? ((cols - itemsInLastRow) * xGap) / 2 : 0

    return {
      id: step.id,
      position: { x: col * xGap + xOffset + 20, y: row * yGap + 20 },
      data: {
        label: (
          <div className="text-left px-1">
            <div className="text-[10px] font-mono mb-1" style={{ color: isDone ? '#ffffff30' : cfg.color }}>
              {String(i + 1).padStart(2, '0')} · {step.category}
            </div>
            <div className={`text-xs font-semibold leading-tight ${isDone ? 'line-through text-white/30' : 'text-white'}`}>
              {step.title}
            </div>
            {isDone && <div className="text-[10px] mt-1 text-emerald-500">✓ done</div>}
          </div>
        ),
      },
      style: {
        background: isDone ? '#0a0a14' : '#0d0d1a',
        border: `1px solid ${isDone ? '#ffffff10' : cfg.color + '40'}`,
        borderLeft: `3px solid ${isDone ? '#ffffff20' : cfg.color}`,
        borderRadius: '10px',
        padding: '10px 12px',
        minWidth: '170px',
        maxWidth: '190px',
        color: 'white',
        fontSize: '12px',
        opacity: isDone ? 0.5 : 1,
        cursor: 'pointer',
      },
    }
  })

  const edges: Edge[] = steps.slice(0, -1).map((step, i) => ({
    id: `edge-${i}`,
    source: step.id,
    target: steps[i + 1].id,
    style: { stroke: '#ffffff15', strokeWidth: 1.5 },
    animated: !done.has(step.id),
  }))

  return { nodes, edges }
}

function RoadmapGraph({ steps, done, onNodeClick }: {
  steps: RoadmapStep[]
  done: Set<string>
  onNodeClick: (id: string) => void
}) {
  const { nodes, edges } = buildRoadmapGraph(steps, done)

  return (
    <div className="w-full rounded-xl border border-white/5 overflow-hidden" style={{ height: '480px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        fitView
        attributionPosition="bottom-right"
        style={{ background: 'transparent' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ffffff05" />
        <Controls style={{ background: '#0d0d1a', border: '1px solid #ffffff10', borderRadius: '8px' }} />
      </ReactFlow>
    </div>
  )
}

function RoadmapView({
  roadmap, background, goal, onReset, onRegenerate,
}: {
  roadmap: Roadmap
  background: string
  goal: string
  onReset: () => void
  onRegenerate: () => void
}) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'graph'>('grid')
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null)
  const [progressLoaded, setProgressLoaded] = useState(false)

  useEffect(() => {
    loadProgress().then((ids) => {
      if (ids.length > 0) setDone(new Set(ids))
      setProgressLoaded(true)
    })
  }, [])

  function toggleDone(id: string) {
    setDone((prev) => {
      const next = new Set(prev)
      const isNowDone = !next.has(id)
      isNowDone ? next.add(id) : next.delete(id)
      syncProgress(id, isNowDone ? 'done' : 'undone', background, goal)
      return next
    })
  }

  function handleNodeClick(id: string) {
    const step = roadmap.steps.find((s) => s.id === id)
    if (step) setSelectedStep(step)
  }

  const completedCount = done.size
  const totalCount = roadmap.steps.length
  const progressPct = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="w-full">
      {selectedStep && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelectedStep(null)} />
          <StepPanel
            step={selectedStep}
            index={roadmap.steps.findIndex((s) => s.id === selectedStep.id)}
            isDone={done.has(selectedStep.id)}
            onToggle={() => toggleDone(selectedStep.id)}
            onClose={() => setSelectedStep(null)}
          />
        </>
      )}

      <div className="mb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-white/40">{background} · {goal}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Your roadmap</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70 max-w-xl mx-auto">{roadmap.intro}</p>
      </div>

      <div className="mb-8 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40">{completedCount} of {totalCount} completed</span>
          <span className="text-xs font-medium text-white/60">{progressPct}%</span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/10">
          <div className="h-1 rounded-full bg-white transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="mb-4 flex gap-3 flex-wrap justify-center">
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <span key={key} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.badge}`}>
            {cfg.label}
          </span>
        ))}
      </div>

      <div className="mb-6 flex justify-center gap-1 rounded-xl border border-white/10 bg-[#0d0d1a] p-1 w-fit mx-auto">
        <button onClick={() => setViewMode('grid')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
          Grid
        </button>
        <button onClick={() => setViewMode('graph')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'graph' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
          Graph
        </button>
      </div>

      {!progressLoaded ? (
        <div className="flex justify-center py-10">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="size-2 rounded-full bg-white/30 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      ) : viewMode === 'graph' ? (
        <div className="mb-8">
          <RoadmapGraph steps={roadmap.steps} done={done} onNodeClick={handleNodeClick} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {roadmap.steps.map((step, index) => {
            const cfg = CATEGORY_CONFIG[step.category] ?? CATEGORY_CONFIG['worth-knowing']
            const isDone = done.has(step.id)
            return (
              <div key={step.id} onClick={() => setSelectedStep(step)}
                className={`relative cursor-pointer rounded-xl border-l-4 bg-[#0d0d1a] p-5 border border-white/5 transition-all duration-200 ${cfg.border} ${isDone ? 'opacity-50' : 'opacity-100 hover:border-white/10 hover:shadow-lg ' + cfg.glow}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-2xl font-bold text-white/10 font-mono leading-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    {isDone && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-white">
                        <Check className="size-3 text-black" />
                      </span>
                    )}
                  </div>
                </div>
                <h3 className={`text-sm font-semibold mb-2 ${isDone ? 'line-through text-white/30' : 'text-white'}`}>
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed text-white/50">{step.detail}</p>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-6">
        <button type="button" onClick={onReset}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/40 transition-colors hover:text-white">
          <ArrowLeft className="size-4" />
          Start over
        </button>
        <button type="button" onClick={onRegenerate}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/40 transition-colors hover:text-white">
          <RefreshCw className="size-4" />
          Regenerate
        </button>
      </div>
    </div>
  )
}

export function CoremapForm() {
  const [background, setBackground] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('coremap-roadmap')
    const savedBackground = localStorage.getItem('coremap-background')
    const savedGoal = localStorage.getItem('coremap-goal')
    if (saved && savedBackground && savedGoal) {
      try {
        setRoadmap(JSON.parse(saved))
        setBackground(savedBackground)
        setGoal(savedGoal)
      } catch {
        localStorage.removeItem('coremap-roadmap')
      }
    }
  }, [])

  const canSubmit = background !== '' && goal !== '' && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const savedBackground = localStorage.getItem('coremap-background')
    const savedGoal = localStorage.getItem('coremap-goal')
    const savedRoadmap = localStorage.getItem('coremap-roadmap')

    if (savedRoadmap && savedBackground === background && savedGoal === goal) {
      try {
        setRoadmap(JSON.parse(savedRoadmap))
        return
      } catch {
        localStorage.removeItem('coremap-roadmap')
      }
    }

    setLoading(true)
    setError('')
    try {
      const result = await generateRoadmap(background as Background, goal as Goal)
      setRoadmap(result)
      localStorage.setItem('coremap-roadmap', JSON.stringify(result))
      localStorage.setItem('coremap-background', background)
      localStorage.setItem('coremap-goal', goal)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerate() {
    setRoadmap(null)
    setLoading(true)
    try {
      const result = await generateRoadmap(background as Background, goal as Goal)
      setRoadmap(result)
      localStorage.setItem('coremap-roadmap', JSON.stringify(result))
      localStorage.setItem('coremap-background', background)
      localStorage.setItem('coremap-goal', goal)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />

  if (roadmap) {
    return (
      <RoadmapView
        roadmap={roadmap}
        background={background}
        goal={goal}
        onReset={() => {
          setRoadmap(null)
          setBackground('')
          setGoal('')
        }}
        onRegenerate={handleRegenerate}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex flex-col gap-6">
        <Field
          label="What's your background?"
          placeholder="Select your background"
          value={background}
          options={BACKGROUNDS}
          onChange={setBackground}
        />
        <Field
          label="What's your goal?"
          placeholder="Select your goal"
          value={goal}
          options={GOALS}
          onChange={setGoal}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-[#1a1a2e] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#252540] disabled:cursor-not-allowed disabled:opacity-40">
          <Sparkles className="size-4" />
          Generate my roadmap
        </button>
      </div>
    </form>
  )
}
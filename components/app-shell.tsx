'use client'

import { useState } from 'react'
import { Map, Newspaper, Cpu } from 'lucide-react'
import { CoremapForm } from '@/components/coremap-form'
import { NewsFeed } from '@/components/news-feed'
import { Architect } from '@/components/architect'

const TABS = [
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'news', label: 'AI News', icon: Newspaper },
  { id: 'architect', label: 'Architect', icon: Cpu },
] as const

type Tab = typeof TABS[number]['id']

export function AppShell() {
  const [tab, setTab] = useState<Tab>('roadmap')

  return (
  <div className="flex min-h-svh flex-col items-center justify-center px-6 py-12">
    <div className="w-full max-w-5xl flex flex-col items-center">
      
      {/* Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-[#0d0d1a] px-3 py-1 text-xs font-medium tracking-wide text-white/60">
          Coremap
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl drop-shadow-lg">
          Your GenAI Command Center
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white drop-shadow-md">
          Personalized roadmap. Live AI news. Architecture simulator.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-10 flex gap-1 rounded-xl border border-white/10 bg-[#0d0d1a] p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === id
                ? 'bg-white text-black'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="w-full flex flex-col items-center">
        {tab === 'roadmap' && <CoremapForm />}
        {tab === 'news' && <NewsFeed />}
        {tab === 'architect' && <Architect />}
      </div>
    </div>
  </div>
)
}
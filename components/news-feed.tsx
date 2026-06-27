'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'

type Article = {
  title: string
  url: string
  summary: string
  tag: string
  signal: 'signal' | 'hype'
}

const TAG_COLORS: Record<string, string> = {
  'LLMs':     'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Agents':   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'RAG':      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Tools':    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Research': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Industry': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Policy':   'bg-red-500/10 text-red-400 border-red-500/20',
}

const CACHE_KEY = 'coremap-news'
const CACHE_TTL = 1000 * 60 * 60 * 3 // 3 hours

function loadCache(): { articles: Article[]; fetchedAt: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.fetchedAt > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function saveCache(articles: Article[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ articles, fetchedAt: Date.now() }))
}

export function NewsFeed() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('All')
  const [cachedAt, setCachedAt] = useState<number | null>(null)

  async function fetchNews(force = false) {
    if (!force) {
      const cached = loadCache()
      if (cached) {
        setArticles(cached.articles)
        setCachedAt(cached.fetchedAt)
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      setArticles(data)
      saveCache(data)
      setCachedAt(Date.now())
    } catch {
      setError('Failed to fetch news. Try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])

  const tags = ['All', ...Array.from(new Set(articles.map((a) => a.tag).filter(Boolean)))]
  const filtered = filter === 'All' ? articles : articles.filter((a) => a.tag === filter)

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="size-2.5 rounded-full bg-white animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-sm text-white/40">Fetching and summarizing latest GenAI news...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-sm text-red-400">{error}</p>
        <button onClick={() => fetchNews(true)} className="text-sm text-white/40 hover:text-white">Try again</button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Latest in GenAI</h2>
          <p className="text-xs text-white/40 mt-0.5">
            {cachedAt
              ? `Summarized by Claude · ${new Date(cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Summarized and tagged by Claude · Last 3 days'}
          </p>
        </div>
        <button
          onClick={() => fetchNews(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d0d1a] px-3 py-2 text-xs text-white/50 transition-all hover:text-white"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </button>
      </div>

      {/* Tag filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              filter === tag
                ? 'bg-white text-black border-white'
                : tag === 'All'
                ? 'border-white/10 text-white/50 hover:text-white bg-[#0d0d1a]'
                : TAG_COLORS[tag] ?? 'border-white/10 text-white/50 bg-[#0d0d1a]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-3 rounded-xl border border-white/5 bg-[#0d0d1a] p-4 transition-all hover:border-white/10 hover:shadow-lg"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {article.tag && (
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${TAG_COLORS[article.tag] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
                  {article.tag}
                </span>
              )}
              {article.signal && (
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  article.signal === 'signal'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {article.signal === 'signal' ? '↑ signal' : '↓ hype'}
                </span>
              )}
            </div>

            <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-white/80 transition-colors line-clamp-2">
              {article.title}
            </h3>

            <p className="text-xs leading-relaxed text-white/50 flex-1">
              {article.summary}
            </p>

            <div className="flex items-center gap-1 text-xs text-white/20 group-hover:text-white/40 transition-colors mt-auto">
              Read more <ExternalLink className="size-3" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
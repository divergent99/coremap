import { NextResponse } from 'next/server'

export async function GET() {
  const tavilyRes = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: 'generative AI LLM agents RAG news latest',
      search_depth: 'basic',
      include_answer: false,
      max_results: 9,
      days: 3,
    }),
  })

  const tavilyData = await tavilyRes.json()
  const raw = tavilyData.results ?? []

  // Ask Claude to summarize and tag each article
  const prompt = `You are a GenAI news editor. Given these raw article snippets, return a JSON array with enriched summaries.

Articles:
${raw.map((a: { title: string; content: string; url: string }, i: number) => `${i + 1}. Title: ${a.title}\nSnippet: ${a.content?.slice(0, 300)}\nURL: ${a.url}`).join('\n\n')}

Return ONLY a JSON array, no markdown:
[
  {
    "title": "original title",
    "url": "original url",
    "summary": "2-3 sentence summary of what this article is actually about and why it matters for GenAI practitioners",
    "tag": "one of: LLMs, Agents, RAG, Tools, Research, Industry, Policy",
    "signal": "hype or signal"
  }
]

Rules:
- Keep original titles and URLs exactly
- summary should be opinionated and useful, not just a restatement
- tag should reflect the primary topic
- signal: "signal" if genuinely useful for practitioners, "hype" if overhyped or marketing`

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const claudeData = await claudeRes.json()
  const text = claudeData.content?.[0]?.text ?? ''

  try {
    const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    const articles = JSON.parse(cleaned)
    return NextResponse.json(articles)
  } catch {
    console.error('Raw Claude response:', text)
    return NextResponse.json(raw)
  }
}
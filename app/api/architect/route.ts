import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  const systemPrompt = `You are a GenAI solutions architect. Given a use case, return a production-ready architecture as JSON only. No markdown, no explanation outside the JSON.

Return this exact structure:
{
  "title": "Short descriptive title",
  "summary": "2-3 sentence overview of the architecture and why these choices make sense",
  "components": [
    {
      "name": "Component name",
      "type": "one of: llm, vector-db, embedding, orchestration, storage, api, frontend, monitoring",
      "description": "What this does and why it's needed in this architecture",
      "options": [
        { "name": "Tool name", "url": "https://..." }
      ]
    }
  ],
  "flow": [
    "Step 1 description",
    "Step 2 description"
  ],
  "caveats": [
    "Important tradeoff or pitfall to watch out for"
  ]
}

Rules:
- 5-8 components
- 4-7 flow steps
- 3-5 caveats
- options should be real tools with real URLs
- Be opinionated and specific, not generic`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''

  try {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  const architecture = JSON.parse(cleaned)
  return NextResponse.json(architecture)
} catch {
  console.error('Raw response:', text)
  return NextResponse.json({ error: 'Failed to parse architecture' }, { status: 500 })
}
}
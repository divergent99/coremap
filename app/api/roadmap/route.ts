import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { background, goal } = await req.json()

  const prompt = `You are a GenAI learning expert. Generate a personalized learning roadmap for someone with the following profile:

Background: ${background}
Goal: ${goal}

Return ONLY a JSON object with this exact structure, no markdown, no explanation:
{
  "intro": "2 sentence personalized intro based on their background and goal",
  "steps": [
    {
      "id": "unique_slug",
      "title": "Concept name",
      "category": "foundational",
      "detail": "2-3 sentence explanation of what this is and why it matters for their specific goal",
      "resources": [
        { "label": "Resource name", "url": "https://..." }
      ]
    }
  ]
}

Rules:
- Generate exactly 8 steps, ordered from first to last
- category must be one of: "foundational", "worth-knowing", "hype-skip"
- Tailor the steps specifically to the background + goal combo, not generic advice
- Each step must have 4-6 resources: mix of docs, courses, papers, YouTube videos, and tools
- Resources should be real, specific URLs
- Be opinionated. If something is hype, say so.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''

  try {
    const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    const roadmap = JSON.parse(cleaned)
    return NextResponse.json(roadmap)
  } catch {
    console.error('Raw response:', text)
    return NextResponse.json({ error: 'Failed to parse roadmap' }, { status: 500 })
  }
}
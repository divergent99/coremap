export type Background =
  | 'Software Engineer'
  | 'Data Scientist'
  | 'PM'
  | 'Student'

export type Goal =
  | 'Build RAG apps'
  | 'Get a GenAI job'
  | 'Understand LLMs deeply'
  | 'Build AI agents'

export const BACKGROUNDS: Background[] = [
  'Software Engineer',
  'Data Scientist',
  'PM',
  'Student',
]
export type RoadmapStep = {
  id: string
  title: string
  category: 'foundational' | 'worth-knowing' | 'hype-skip'
  detail: string
  resources: { label: string; url: string }[]
}

export const GOALS: Goal[] = [
  'Build RAG apps',
  'Get a GenAI job',
  'Understand LLMs deeply',
  'Build AI agents',
]

export type RoadmapStep = {
  id: string
  title: string
  category: 'foundational' | 'worth-knowing' | 'hype-skip'
  detail: string
  resources: { label: string; url: string }[]
}

export type Roadmap = {
  intro: string
  steps: RoadmapStep[]
}

export async function generateRoadmap(background: Background, goal: Goal): Promise<Roadmap> {
  const res = await fetch('/api/roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ background, goal }),
  })
  if (!res.ok) throw new Error('Failed to generate roadmap')
  const data = await res.json()

  // Overwrite IDs with deterministic ones based on profile + index
  const key = `${background}-${goal}`.toLowerCase().replace(/\s+/g, '-')
  data.steps = data.steps.map((step: RoadmapStep, i: number) => ({
    ...step,
    id: `${key}-step-${i + 1}`,
  }))

  return data
}
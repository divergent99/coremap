import { NextRequest, NextResponse } from 'next/server'
import { saveProgress, getProgress, saveUser } from '@/lib/dynamo'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  try {
    const items = await getProgress(userId)
    const done = items
      .filter((i) => i.status === 'done')
      .map((i) => i.conceptId)
    return NextResponse.json({ done })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { userId, conceptId, status, background, goal } = await req.json()
  if (!userId || !conceptId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  try {
    await saveProgress(userId, conceptId, status)
    if (background && goal) {
      await saveUser(userId, background, goal)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}
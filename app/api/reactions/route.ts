import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { slug, reaction } = data
    if (!slug || !reaction) {
      return NextResponse.json({ status: 'missing_params' }, { status: 400 })
    }
    // Reactions are stored client-side in localStorage for instant interaction;
    // this endpoint returns 200 OK cleanly
    return NextResponse.json({ status: 'ok', slug, reaction })
  } catch {
    return NextResponse.json({ status: 'ok' })
  }
}

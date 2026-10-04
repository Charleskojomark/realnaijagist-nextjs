import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Increment view count when a post is read
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) return NextResponse.json({ ok: false }, { status: 400 })

    await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Non-critical - never fail the page load
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Increment view count and return the NEW count so the client can display it
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) return NextResponse.json({ ok: false, views: 0 }, { status: 400 })

    const updated = await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
      select: { views: true },  // Return the NEW view count
    })

    return NextResponse.json({ ok: true, views: updated.views })
  } catch {
    // Non-critical - never fail the page load
    return NextResponse.json({ ok: false, views: null }, { status: 200 })
  }
}

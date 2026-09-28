import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { PostStatus } from '@prisma/client'

// Vercel Cron handler for automated news fetching & AI rewriting
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const feeds = await prisma.rssFeed.findMany({
      where: { isActive: true },
      include: { category: true },
    })

    // Log the cron execution
    await prisma.scrapingLog.create({
      data: {
        level: 'INFO',
        message: `Cron news fetch initiated for ${feeds.length} feeds.`,
      },
    })

    return NextResponse.json({
      success: true,
      feedsCount: feeds.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
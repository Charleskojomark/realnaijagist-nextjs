import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const saved = await prisma.contactMessage.create({
      data: { name, email, subject: subject || 'General Inquiry', message },
    })

    return NextResponse.json({ success: true, id: saved.id })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
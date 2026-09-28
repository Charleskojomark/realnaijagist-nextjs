import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  try {
    let email = ''
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await req.json()
      email = data.email
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      email = (formData.get('email') as string) || ''
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    await prisma.subscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email, isActive: true },
    })

    return NextResponse.json({ success: true, message: 'Subscribed successfully' })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 })
  }
}
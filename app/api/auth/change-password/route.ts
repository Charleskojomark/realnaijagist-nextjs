import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession, hashPassword, verifyPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword, targetUserId } = await req.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // If changing another user's password (superadmin privilege)
    const userId = targetUserId ? Number(targetUserId) : session.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If changing own password, verify current password
    if (userId === session.id && currentPassword) {
      const isValid = await verifyPassword(currentPassword, user.passwordHash)
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
    }

    const hashed = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashed },
    })

    return NextResponse.json({
      success: true,
      message: `Password updated successfully for ${user.username}`,
    })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}

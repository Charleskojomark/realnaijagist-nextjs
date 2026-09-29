import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'realnaijagist-super-secret-2025-nextjs'
)

export interface SessionUser {
  id: number
  username: string
  email: string | null
  firstName: string | null
  lastName: string | null
  isStaff: boolean
}

export function verifyDjangoPbkdf2(password: string, hashStr: string): boolean {
  try {
    const parts = hashStr.split('$')
    if (parts.length !== 4) return false
    const [algo, iterations, salt, hash] = parts
    if (algo !== 'pbkdf2_sha256') return false
    const derived = crypto
      .pbkdf2Sync(password, salt, parseInt(iterations, 10), 32, 'sha256')
      .toString('base64')
    return derived === hash
  } catch (err) {
    console.error('Error verifying Django pbkdf2 hash:', err)
    return false
  }
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !password) return false

  // Django pbkdf2_sha256 format
  if (storedHash.startsWith('pbkdf2_sha256$')) {
    return verifyDjangoPbkdf2(password, storedHash)
  }

  // Bcrypt format
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    return bcrypt.compare(password, storedHash)
  }

  // Plaintext fallback (if applicable)
  return password === storedHash
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    email: user.email,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username,
    isStaff: user.isStaff,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      id: Number(payload.id),
      username: String(payload.username),
      email: (payload.email as string) || null,
      firstName: null,
      lastName: null,
      isStaff: Boolean(payload.isStaff),
    }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  if (!token) return null
  return verifySessionToken(token)
}

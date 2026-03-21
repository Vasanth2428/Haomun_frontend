import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User, { IUser } from '@/lib/models/user'

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local')
}

export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })
}

export async function verifyAuth(req: NextRequest): Promise<IUser> {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    throw new Error('No token provided')
  }

  const decoded = jwt.verify(token, JWT_SECRET) as { id: string }

  await connectDB()
  const user = await User.findById(decoded.id)

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

export function authError() {
  return Response.json(
    { success: false, error: 'Please authenticate.' },
    { status: 401 }
  )
}

import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User, { IUser } from '@/lib/models/user'

// JWT_SECRET check moved to functions

export function generateToken(userId: string): string {
  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    throw new Error('Please define the JWT_SECRET environment variable inside .env.local')
  }
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })
}

export async function verifyAuth(req: NextRequest): Promise<IUser> {
  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    throw new Error('Please define the JWT_SECRET environment variable inside .env.local')
  }
  const cookieToken = req.cookies.get('haomun_token')?.value
  const authHeader = req.headers.get('Authorization')
  const headerToken = authHeader?.replace('Bearer ', '')

  const token = cookieToken || headerToken

  if (!token) {
    throw new Error('No token provided')
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }

    await connectDB()
    const user = await User.findById(decoded.id)

    if (!user) {
      throw new Error('User not found')
    }

    return user
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') throw new Error('Session expired')
    if (err.name === 'JsonWebTokenError') throw new Error('Invalid session')
    throw err
  }
}

export function authError() {
  return Response.json(
    { success: false, error: 'Please authenticate.' },
    { status: 401 }
  )
}

export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { generateToken } from '@/lib/auth'

import { registerSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return Response.json({ 
        success: false, 
        error: validation.error.errors[0].message 
      }, { status: 400 })
    }

    const { email, password, username } = validation.data
    await connectDB()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return Response.json({ success: false, error: 'User already exists' }, { status: 400 })
    }

    if (username) {
      const existingUsername = await User.findOne({ username })
      if (existingUsername) {
        return Response.json({ success: false, error: 'Moniker already claimed by another seeker' }, { status: 400 })
      }
    }

    const user = await User.create({ email, password, username })

    const token = generateToken(user._id.toString())
    const { password: _, ...safeUser } = user.toObject()

    const cookieStore = await cookies()
    cookieStore.set('haomun_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 1 week
    })

    // Set UI hint cookie (non-HttpOnly)
    cookieStore.set('haomun_logged_in', 'true', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    })

    return Response.json({ 
      success: true, 
      data: safeUser
    }, { status: 201 })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 400 })
  }
}

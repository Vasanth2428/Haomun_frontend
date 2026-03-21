export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { generateToken } from '@/lib/auth'

import { loginSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return Response.json({ 
        success: false, 
        error: validation.error.errors[0].message 
      }, { status: 400 })
    }

    const { email, password } = validation.data

    await connectDB()
    const user = await User.findOne({ email })
    if (!user) {
      return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

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
    })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 401 })
  }
}

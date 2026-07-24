export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { generateToken } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { findUserByEmail, findUserByUsername, createUser, safeUser } from '@/lib/supabase'

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
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return Response.json({ success: false, error: 'User already exists' }, { status: 400 })
    }

    if (username) {
      const existingUsername = await findUserByUsername(username)
      if (existingUsername) {
        return Response.json({ success: false, error: 'Moniker already claimed by another seeker' }, { status: 400 })
      }
    }

    const user = await createUser({ email, password, username })
    const token = generateToken(user._id)
    const safe = safeUser(user)

    const cookieStore = await cookies()
    cookieStore.set('haomun_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 1 week
    })

    cookieStore.set('haomun_logged_in', 'true', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    })

    return Response.json({ success: true, data: safe }, { status: 201 })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 400 })
  }
}

export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
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
    return Response.json({ 
      success: true, 
      data: { 
        ...user.toObject(), 
        token 
      } 
    })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 401 })
  }
}

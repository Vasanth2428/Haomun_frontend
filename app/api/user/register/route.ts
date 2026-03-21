export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
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

    const { email, password } = validation.data

    await connectDB()
    const existing = await User.findOne({ email })
    if (existing) {
      return Response.json({ success: false, error: 'User already exists' }, { status: 400 })
    }

    const user = new User({ email, password })
    await user.save()

    const token = generateToken(user._id.toString())
    return Response.json({ 
      success: true, 
      data: { 
        ...user.toObject(), 
        token 
      } 
    }, { status: 201 })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 400 })
  }
}

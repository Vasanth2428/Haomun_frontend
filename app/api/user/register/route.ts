import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return Response.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    await connectDB()
    const existing = await User.findOne({ email })
    if (existing) {
      return Response.json({ success: false, error: 'User already exists' }, { status: 400 })
    }

    const user = new User({ email, password })
    await user.save()

    const token = generateToken(user._id.toString())
    return Response.json({ success: true, data: user, token }, { status: 201 })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 400 })
  }
}

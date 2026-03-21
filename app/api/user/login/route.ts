import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

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
    return Response.json({ success: true, data: user, token })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 401 })
  }
}

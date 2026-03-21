export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import Guild from '@/lib/models/guild'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { name, description, emblem } = await req.json()

    if (!name) return Response.json({ success: false, error: 'Guild name is required' }, { status: 400 })

    await connectDB()

    // Check if user already has a guild
    const dbUser = await User.findById(user._id)
    if (dbUser?.guildId) {
      return Response.json({ success: false, error: 'You are already in a guild' }, { status: 400 })
    }

    // Check if guild name exists
    const existing = await Guild.findOne({ name })
    if (existing) {
      return Response.json({ success: false, error: 'Guild name already taken' }, { status: 400 })
    }

    const guild = await Guild.create({
      name,
      description,
      emblem: emblem || '🛡️',
      leader: user._id,
      members: [user._id],
      totalScore: user.haomunScore || 0
    })

    await User.findByIdAndUpdate(user._id, { guildId: guild._id })

    return Response.json({ success: true, data: guild })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

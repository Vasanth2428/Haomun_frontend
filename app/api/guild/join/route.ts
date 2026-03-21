export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import Guild from '@/lib/models/guild'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { guildId } = await req.json()

    if (!guildId) return Response.json({ success: false, error: 'Guild ID is required' }, { status: 400 })

    await connectDB()

    const dbUser = await User.findById(user._id)
    if (dbUser?.guildId) {
      return Response.json({ success: false, error: 'You are already in a guild' }, { status: 400 })
    }

    const guild = await Guild.findById(guildId)
    if (!guild) {
      return Response.json({ success: false, error: 'Guild not found' }, { status: 404 })
    }

    // Add user to guild and update total score
    await Guild.findByIdAndUpdate(guildId, {
      $push: { members: user._id },
      $inc: { totalScore: user.haomunScore || 0 }
    })

    await User.findByIdAndUpdate(user._id, { guildId })

    return Response.json({ success: true, message: `Joined ${guild.name}` })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

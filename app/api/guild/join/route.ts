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

    // Verify guild exists before joining
    const guild = await Guild.findById(guildId)
    if (!guild) {
      return Response.json({ success: false, error: 'Guild not found' }, { status: 404 })
    }

    // Atomic join: Only update if user is NOT in a guild
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, guildId: null },
      { guildId },
      { new: true }
    )

    if (!updatedUser) {
      return Response.json({ success: false, error: 'You are already in a guild or join failed' }, { status: 400 })
    }

    // Add user to guild and update total score
    await Guild.findByIdAndUpdate(guildId, {
      $addToSet: { members: user._id },
      $inc: { totalScore: user.haomunScore || 0 }
    })

    return Response.json({ success: true, message: `Joined the guild successfully` })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

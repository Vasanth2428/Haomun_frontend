export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { findGuildById, updateUserByIdConditionally, updateGuildById } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { guildId } = await req.json()

    if (!guildId) return Response.json({ success: false, error: 'Guild ID is required' }, { status: 400 })

    const guild = await findGuildById(guildId)
    if (!guild) {
      return Response.json({ success: false, error: 'Guild not found' }, { status: 404 })
    }

    const updatedUser = await updateUserByIdConditionally(
      user._id,
      { guild_id: null },
      { guildId: guildId }
    )

    if (!updatedUser) {
      return Response.json({ success: false, error: 'You are already in a guild or join failed' }, { status: 400 })
    }

    const members = Array.from(new Set([...(guild.members || []), user._id]))
    const totalScore = guild.totalScore + (user.haomunScore || 0)

    await updateGuildById(guildId, { members, total_score: totalScore })

    return Response.json({ success: true, message: 'Joined the guild successfully' })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

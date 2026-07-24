export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { findGuildById, findUserById, updateUserById, updateUserByIdConditionally, updateGuildById, deleteGuildById } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)

    const currentUser = await findUserById(user._id)
    if (!currentUser?.guildId) {
      return Response.json({ success: false, error: 'You are not in a guild' }, { status: 400 })
    }

    const guild = await findGuildById(currentUser.guildId)
    if (!guild) {
      await updateUserById(user._id, { guildId: null })
      return Response.json({ success: true, message: 'Left guild (guild no longer exists)' })
    }

    if (guild.leader === user._id) {
      if (guild.members.length <= 1) {
        await deleteGuildById(guild._id)
        await updateUserById(user._id, { guildId: null })
        return Response.json({ success: true, message: 'Guild disbanded (you were the only member)' })
      }

      return Response.json({
        success: false,
        error: 'Guild leaders cannot leave. Transfer leadership first or disband the guild.'
      }, { status: 400 })
    }

    const currentScore = currentUser.haomunScore || 0
    const atomicUserUpdate = await updateUserByIdConditionally(
      user._id,
      { guild_id: guild._id, haomun_score: currentScore },
      { guildId: null }
    )

    if (!atomicUserUpdate) {
      return Response.json({
        success: false,
        error: 'Your score was updated while leaving the guild. Please try again to ensure accurate guild synchronization.'
      }, { status: 409 })
    }

    const members = (guild.members || []).filter((member) => member !== user._id)
    const totalScore = Math.max(0, guild.totalScore - currentScore)

    await updateGuildById(guild._id, { members, total_score: totalScore })

    return Response.json({ success: true, message: 'Left the guild successfully' })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

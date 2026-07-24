export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { createGuild, updateUserByIdConditionally, deleteGuildById } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { name, description, emblem } = await req.json()

    if (!name) return Response.json({ success: false, error: 'Guild name is required' }, { status: 400 })

    const sanitizedName = typeof name === 'string' ? name.trim() : ''
    if (!sanitizedName || sanitizedName.length < 3) {
      return Response.json({ success: false, error: 'Guild name must be at least 3 characters' }, { status: 400 })
    }

    const guild = await createGuild({
      name: sanitizedName,
      description: (description || '').substring(0, 200),
      emblem: (emblem || '🛡️').substring(0, 5),
      leader: user._id,
      members: [user._id],
      total_score: user.haomunScore || 0
    })

    const updatedUser = await updateUserByIdConditionally(
      user._id,
      { guild_id: null },
      { guildId: guild._id }
    )

    if (!updatedUser) {
      await deleteGuildById(guild._id)
      return Response.json({ success: false, error: 'You are already in a guild' }, { status: 400 })
    }

    return Response.json({ success: true, data: guild })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    if (e.code === '23505' || e.message?.includes('duplicate')) {
      return Response.json({ success: false, error: 'Guild name already taken' }, { status: 400 })
    }
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

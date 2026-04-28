export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import Guild from '@/lib/models/guild'
import { verifyAuth, authError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req)
    await connectDB()
    const guilds = await Guild.find({})
      .sort({ totalScore: -1 })
      .populate('leader', 'username avatarUrl')
      .limit(50)

    return Response.json({ success: true, data: guilds })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

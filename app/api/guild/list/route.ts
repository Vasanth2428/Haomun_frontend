export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import Guild from '@/lib/models/guild'

export async function GET() {
  try {
    await connectDB()
    const guilds = await Guild.find({})
      .sort({ totalScore: -1 })
      .populate('leader', 'displayName username avatarUrl')
      .limit(50)

    return Response.json({ success: true, data: guilds })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

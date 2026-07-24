export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { getLeaderboard } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter')
    const cursor = searchParams.get('cursor')

    const leaderboard = await getLeaderboard(filter === 'friends' ? 'friends' : 'all', user._id, cursor ?? undefined)
    return Response.json({ success: true, data: leaderboard.data, nextCursor: leaderboard.nextCursor })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

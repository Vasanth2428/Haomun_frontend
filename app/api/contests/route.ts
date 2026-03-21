import { verifyAuth, authError } from '@/lib/auth'
import { fetchUpcomingContests } from '@/lib/services/contest'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req)
    const contests = await fetchUpcomingContests()
    return Response.json({ success: true, data: contests })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

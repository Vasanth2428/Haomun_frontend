import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { fetchPlatformData } from '@/lib/services/fetch'

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req)
    const url = new URL(req.url)
    const platform = url.searchParams.get('platform') || 'leetcode'
    const username = url.searchParams.get('username') || ''

    if (!username) {
      return Response.json({ success: false, error: 'Username is required' }, { status: 400 })
    }

    const stats = await fetchPlatformData(platform, username)
    return Response.json({ success: true, data: stats })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

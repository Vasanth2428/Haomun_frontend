export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { searchUsers } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req)
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) {
      return Response.json({ success: true, data: [] })
    }

    const users = await searchUsers(q)
    return Response.json({ success: true, data: users })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

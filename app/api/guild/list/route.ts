export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { listGuilds } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req)
    const guilds = await listGuilds()

    return Response.json({ success: true, data: guilds })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

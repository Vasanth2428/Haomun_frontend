export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { editScrollForge } from '@/lib/services/ai'

import { scrollForgeEditSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req)
    const body = await req.json()
    const validation = scrollForgeEditSchema.safeParse(body)

    if (!validation.success) {
      return Response.json({ 
        success: false, 
        error: validation.error.errors[0].message 
      }, { status: 400 })
    }

    const { draft, instruction } = validation.data

    const result = await editScrollForge(draft, instruction)
    return Response.json({ success: true, data: result })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { editScrollForge } from '@/lib/services/ai'

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req)
    const { draft, instruction } = await req.json()

    if (!draft || typeof draft !== 'string' || !draft.trim()) {
      return Response.json({ success: false, error: 'Draft text is required' }, { status: 400 })
    }
    if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
      return Response.json({ success: false, error: 'Instruction is required' }, { status: 400 })
    }
    if (draft.length > 10000) {
      return Response.json({ success: false, error: 'Draft too long (max 10,000 chars)' }, { status: 400 })
    }

    const result = await editScrollForge(draft, instruction)
    return Response.json({ success: true, data: result })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

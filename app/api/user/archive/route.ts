export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { z } from 'zod'
import { appendUserArchive, getUserArchives, removeUserArchive } from '@/lib/supabase'

const archiveSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required').max(50000),
})

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const archives = await getUserArchives(user._id)
    return Response.json({ success: true, data: archives })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const body = await req.json()
    const validation = archiveSchema.safeParse(body)

    if (!validation.success) {
      return Response.json({
        success: false,
        error: validation.error.errors[0].message
      }, { status: 400 })
    }

    const archiveItem = {
      id: crypto.randomUUID(),
      title: validation.data.title,
      content: validation.data.content,
      timestamp: new Date().toISOString(),
    }

    const updatedUser = await appendUserArchive(user._id, archiveItem)
    return Response.json({ success: true, data: updatedUser?.archives || [] })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { searchParams } = new URL(req.url)
    const archiveId = searchParams.get('id')

    if (!archiveId) {
      return Response.json({ success: false, error: 'Archive ID is required' }, { status: 400 })
    }

    const updatedUser = await removeUserArchive(user._id, archiveId)
    return Response.json({ success: true, data: updatedUser?.archives || [] })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

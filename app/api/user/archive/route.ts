export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'
import { z } from 'zod'

const archiveSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
})

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    await connectDB()
    const userData = await User.findById(user._id).select('archives')
    return Response.json({ success: true, data: userData?.archives || [] })
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

    await connectDB()
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        $push: { 
          archives: { 
            ...validation.data, 
            timestamp: new Date() 
          } 
        } 
      },
      { new: true }
    )

    return Response.json({ success: true, data: updatedUser?.archives })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

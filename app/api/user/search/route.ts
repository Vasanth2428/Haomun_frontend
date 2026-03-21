export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req)
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) {
      return Response.json({ success: true, data: [] })
    }

    await connectDB()
    const users = await User.find({
      $or: [
        { displayName: { $regex: q, $options: 'i' } },
        { leetcodeUsername: { $regex: q, $options: 'i' } },
        { codeforcesUsername: { $regex: q, $options: 'i' } },
        { codechefUsername: { $regex: q, $options: 'i' } },
        { gfgUsername: { $regex: q, $options: 'i' } },
      ]
    })
    .select('displayName avatarUrl haomunScore masteryLevel leetcodeUsername codeforcesUsername')
    .limit(10)

    return Response.json({ success: true, data: users })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

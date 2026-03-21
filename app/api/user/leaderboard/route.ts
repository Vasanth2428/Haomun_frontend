export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter')

    await connectDB()
    
    let query = {}
    if (filter === 'friends') {
      const currentUser = await User.findById(user._id)
      query = { _id: { $in: currentUser?.friends || [] } }
    }

    const leaderboard = await User.find(query)
      .select('displayName leetcodeUsername codeforcesUsername haomunScore masteryLevel avatarUrl')
      .sort({ haomunScore: -1 })
      .limit(20)

    return Response.json({ success: true, data: leaderboard })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

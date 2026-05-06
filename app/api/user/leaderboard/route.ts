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
    const cursor = searchParams.get('cursor')

    await connectDB()

    let query: any = {}
    if (filter === 'friends') {
      // Fix N+1: `user` returned from verifyAuth already has the friends array
      query = { _id: { $in: user.friends || [] } }
    }

    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('ascii'))
        if (decoded.s !== undefined && decoded.id) {
          const cursorCondition = {
            $or: [
              { haomunScore: { $lt: decoded.s } },
              { haomunScore: decoded.s, _id: { $lt: decoded.id } }
            ]
          }
          query = query._id ? { $and: [query, cursorCondition] } : cursorCondition
        }
      } catch (e) {
        // ignore invalid cursor
      }
    }

    const limit = 20
    const leaderboard = await User.find(query)
      .select('username leetcodeUsername codeforcesUsername haomunScore masteryLevel avatarUrl')
      .sort({ haomunScore: -1, _id: -1 })
      .limit(limit + 1)

    const hasNextPage = leaderboard.length > limit
    const data = hasNextPage ? leaderboard.slice(0, limit) : leaderboard

    let nextCursor = null
    if (hasNextPage) {
      const lastItem = data[data.length - 1]
      nextCursor = Buffer.from(JSON.stringify({ 
        s: lastItem.haomunScore, 
        id: lastItem._id.toString() 
      })).toString('base64')
    }

    return Response.json({ success: true, data, nextCursor })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

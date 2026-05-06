export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'

// Escape regex-special chars so user input is treated as a literal substring
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req)
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) {
      return Response.json({ success: true, data: [] })
    }

    const safe = escapeRegex(q)

    await connectDB()
    
    // Attempt full-text search first (matches whole words based on the text index)
    let users = await User.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .select('username avatarUrl haomunScore masteryLevel leetcodeUsername codeforcesUsername')
      .limit(10)

    // Fallback to regex for partial substring matches if text search yields no results
    if (users.length === 0) {
      const safe = escapeRegex(q)
      users = await User.find({
        $or: [
          { username: { $regex: safe, $options: 'i' } },
          { leetcodeUsername: { $regex: safe, $options: 'i' } },
          { codeforcesUsername: { $regex: safe, $options: 'i' } },
          { codechefUsername: { $regex: safe, $options: 'i' } },
          { gfgUsername: { $regex: safe, $options: 'i' } },
        ]
      })
        .select('username avatarUrl haomunScore masteryLevel leetcodeUsername codeforcesUsername')
        .limit(10)
    }

    return Response.json({ success: true, data: users })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

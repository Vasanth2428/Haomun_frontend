import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    return Response.json({ success: true, data: user })
  } catch { return authError() }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { username, bio, platforms } = await req.json()

    await connectDB()
    const updates: any = {}
    if (username) updates.displayName = username
    if (bio) updates.bio = bio
    if (platforms) {
      if (platforms.leetcode) updates.leetcodeUsername = platforms.leetcode
      if (platforms.codeforces) updates.codeforcesUsername = platforms.codeforces
      if (platforms.codechef) updates.codechefUsername = platforms.codechef
      if (platforms.geeksforgeeks) updates.gfgUsername = platforms.geeksforgeeks
    }

    const updated = await User.findByIdAndUpdate(user._id, updates, { new: true })
    return Response.json({ success: true, data: updated })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) { return PATCH(req) }
export async function POST(req: NextRequest) { return PATCH(req) }

export const runtime = 'nodejs'
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

import { profileUpdateSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const body = await req.json()
    const validation = profileUpdateSchema.safeParse(body)

    if (!validation.success) {
      return Response.json({ 
        success: false, 
        error: validation.error.errors[0].message 
      }, { status: 400 })
    }

    const { displayName, platforms, avatarUrl } = validation.data
    await connectDB()
    const updates: any = {}
    if (displayName) updates.displayName = displayName
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl
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

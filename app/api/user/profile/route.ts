export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { PLATFORMS } from '@/lib/constants'
import { verifyAuth, authError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    const { password: _, ...safeUser } = user.toObject()
    return Response.json({ success: true, data: safeUser })
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

    const { username, email, bio, platforms, avatarUrl, currentPassword, newPassword } = validation.data
    await connectDB()
    const updates: any = {}
    if (username) updates.username = username
    if (email) updates.email = email
    if (bio !== undefined) updates.bio = bio
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl

    // Handle password change
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return Response.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
      }
      updates.password = newPassword
    }
    if (platforms) {
      const platformMapping: Record<string, string> = {
        [PLATFORMS.LEETCODE]: 'leetcodeUsername',
        [PLATFORMS.CODEFORCES]: 'codeforcesUsername',
        [PLATFORMS.CODECHEF]: 'codechefUsername',
        [PLATFORMS.GFG]: 'gfgUsername',
      }

      for (const [key, field] of Object.entries(platformMapping)) {
        if ((platforms as any)[key] !== undefined) {
          updates[field] = (platforms as any)[key] || null
        }
      }
    }

    const updated = await User.findByIdAndUpdate(user._id, updates, { new: true }).select('-password')
    return Response.json({ success: true, data: updated })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) { return PATCH(req) }
export async function POST(req: NextRequest) { return PATCH(req) }

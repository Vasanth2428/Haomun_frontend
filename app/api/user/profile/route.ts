export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { profileUpdateSchema } from '@/lib/validations'
import { PLATFORMS } from '@/lib/constants'
import { comparePasswordHash, safeUser, updateUserById } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    return Response.json({ success: true, data: safeUser(user) })
  } catch {
    return authError()
  }
}

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
    const updates: any = {}
    if (username) updates.username = username
    if (email) updates.email = email
    if (bio !== undefined) updates.bio = bio
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl

    if (currentPassword && newPassword) {
      const isMatch = await comparePasswordHash(currentPassword, user.password)
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

    const updated = await updateUserById(user._id, updates)
    return Response.json({ success: true, data: safeUser(updated) })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) { return PATCH(req) }
export async function POST(req: NextRequest) { return PATCH(req) }

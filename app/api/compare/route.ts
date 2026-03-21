export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { getBatchPlatformStats } from '@/lib/services/fetch'
import { generateSummary } from '@/lib/services/ai'

import { compareRequestSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req)
    const body = await req.json()
    const validation = compareRequestSchema.safeParse(body)

    if (!validation.success) {
      return Response.json({ 
        success: false, 
        error: validation.error.errors[0].message 
      }, { status: 400 })
    }

    const { users } = validation.data

    const platform = users[0]?.platform || 'leetcode'
    const results = await getBatchPlatformStats(users)
    const successful = results.filter((r: any) => r.success)
    const failed = results.filter((r: any) => !r.success)

    if (successful.length === 0) {
      return Response.json({ success: false, error: 'Failed to fetch data for all users' }, { status: 400 })
    }

    const userStats = successful.map((r: any) => r.data)
    const totalSolved = userStats.reduce((s: number, u: any) => s + (u?.solvedProblems || 0), 0)
    const avg = Math.round(totalSolved / userStats.length)

    let comparisonText: string
    try {
      comparisonText = await generateSummary({ users: userStats, platform, type: 'comparison', message: 'Generate a comparative analysis' })
    } catch {
      comparisonText = userStats.map((u: any) => `${u?.username}: ${u?.solvedProblems} problems solved`).join('\n')
    }

    return Response.json({
      success: true,
      data: {
        comparisonText, users: userStats,
        summary: { totalUsers: users.length, successfulUsers: successful.length, failedUsers: failed.length, totalSolved, averageSolved: avg, platform },
        ...(failed.length > 0 && { errors: failed }),
      }
    })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

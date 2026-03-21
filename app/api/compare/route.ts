import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { getBatchPlatformStats } from '@/lib/services/fetch'
import { generateSummary } from '@/lib/services/ai'

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req)
    const { users } = await req.json()

    if (!Array.isArray(users) || users.length === 0) {
      return Response.json({ success: false, error: 'Users array is required' }, { status: 400 })
    }
    if (users.length > 5) {
      return Response.json({ success: false, error: 'Maximum 5 users' }, { status: 400 })
    }

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

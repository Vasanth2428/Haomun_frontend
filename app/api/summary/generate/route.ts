import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { analyzeStats } from '@/lib/services/analysis'
import { generateSummary } from '@/lib/services/ai'
import { getPlatformStats } from '@/lib/services/platform'

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req)
    const { username, platform, timeWindow } = await req.json()

    if (!username || typeof username !== 'string' || !username.trim()) {
      return Response.json({ success: false, error: 'Username is required' }, { status: 400 })
    }
    if (!platform || !['leetcode', 'codeforces', 'codechef'].includes(platform)) {
      return Response.json({ success: false, error: 'Platform must be: leetcode, codeforces, or codechef' }, { status: 400 })
    }

    const stats = await getPlatformStats(platform, username)
    const transformed = {
      username: stats.username, platform: stats.platform,
      totalProblems: stats.totalSolved, timeWindow: parseInt(timeWindow) || 30,
      difficultySpread: `Easy: ${stats.difficulty.easy} | Med: ${stats.difficulty.medium} | Hard: ${stats.difficulty.hard}`,
      recentActivity: stats.recentActivity, languages: stats.languages,
      streak: `${stats.recentActivity} days`,
    }

    const insights = analyzeStats(transformed)
    const summary = await generateSummary(insights)

    return Response.json({
      success: true,
      data: { ...transformed, platformStats: stats, summary }
    })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

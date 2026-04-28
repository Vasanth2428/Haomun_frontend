export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'
import { fetchPlatformData } from '@/lib/services/fetch'
import { aggregateProfiles } from '@/lib/services/analysis'
import { generateSkillAnalysis } from '@/lib/services/ai'

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req)

    const platforms: Record<string, string | undefined> = {}
    if (user.leetcodeUsername) platforms.leetcode = user.leetcodeUsername
    if (user.codeforcesUsername) platforms.codeforces = user.codeforcesUsername
    if (user.codechefUsername) platforms.codechef = user.codechefUsername
    if (user.gfgUsername) platforms.gfg = user.gfgUsername

    if (Object.keys(platforms).length === 0) {
      return Response.json({ success: false, error: 'No platform usernames configured' }, { status: 400 })
    }

    const raw = await Promise.all(
      Object.entries(platforms).map(([p, u]) => fetchPlatformData(p, u!).catch(() => null))
    )
    const valid = raw.filter(Boolean)
    const aggregated = aggregateProfiles(valid)
    const analysis = await generateSkillAnalysis(aggregated)

    await connectDB()
    const lastHistory = user.scoreHistory?.[user.scoreHistory.length - 1]
    const shouldPushHistory = !lastHistory ||
      (new Date().getTime() - new Date(lastHistory.timestamp).getTime() > 1000 * 60 * 60 * 12) ||
      (aggregated.unifiedScore.score !== user.haomunScore)

    const updateFields: any = {
      haomunScore: aggregated.unifiedScore.score,
      masteryLevel: aggregated.unifiedScore.level,
      lastSkillAnalysis: analysis,
      lastAnalysisDate: new Date(),
    }

    if (shouldPushHistory) {
      updateFields.$push = {
        scoreHistory: {
          $each: [{ score: aggregated.unifiedScore.score, timestamp: new Date() }],
          $slice: -200
        }
      }
    }

    await User.findByIdAndUpdate(user._id, updateFields)

    return Response.json({ success: true, data: analysis })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'
import { fetchPlatformData } from '@/lib/services/fetch'
import { aggregateProfiles } from '@/lib/services/analysis'

async function handleSanctum(req: NextRequest) {
  try {
    await connectDB()
    const user = await verifyAuth(req)

    const platforms: Record<string, string | undefined> = {
      leetcode: user.leetcodeUsername,
      codeforces: user.codeforcesUsername,
      codechef: user.codechefUsername,
      gfg: user.gfgUsername,
    }

    const active = Object.entries(platforms).filter(([, u]) => !!u)
    if (active.length === 0) {
      return Response.json({
        success: true,
        data: { profiles: [], unifiedScore: { score: 0, level: 'Apprentice', metrics: {}, completeness: { score: 0 } }, isNewUser: true }
      })
    }

    const raw = await Promise.all(active.map(([p, u]) => fetchPlatformData(p, u!).catch(() => null)))
    const valid = raw.filter(Boolean)

    if (valid.length === 0) {
      return Response.json({ success: false, error: 'Could not fetch data from any linked platform.' }, { status: 400 })
    }

    const aggregated = aggregateProfiles(valid)

    // Consolidate topics
    const topicDistribution: Record<string, number> = {}
    aggregated.profiles.forEach(p => {
      Object.entries(p.topicDistribution || {}).forEach(([tag, count]) => {
        topicDistribution[tag] = (topicDistribution[tag] || 0) + (count as number)
      })
    })

    // Add scoreHistory and consolidated topics
    const finalData = {
      ...aggregated,
      topicDistribution,
      scoreHistory: user.scoreHistory || []
    }
    const lastHistory = user.scoreHistory?.[user.scoreHistory.length - 1]
    const shouldPushHistory = !lastHistory ||
      (new Date().getTime() - new Date(lastHistory.timestamp).getTime() > 1000 * 60 * 60 * 12) ||
      (aggregated.unifiedScore.score !== user.haomunScore)

    const updateFields: any = {
      haomunScore: aggregated.unifiedScore.score,
      masteryLevel: aggregated.unifiedScore.level
    }

    if (shouldPushHistory) {
      updateFields.$push = {
        scoreHistory: {
          $each: [{ score: aggregated.unifiedScore.score, timestamp: new Date() }],
          $slice: -200
        }
      }
    }

    if (aggregated.unifiedScore.score !== user.haomunScore || aggregated.unifiedScore.level !== user.masteryLevel || shouldPushHistory) {
      await User.findByIdAndUpdate(user._id, updateFields)
    }

    return Response.json({ success: true, data: finalData })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) { return handleSanctum(req) }
export async function POST(req: NextRequest) { return handleSanctum(req) }

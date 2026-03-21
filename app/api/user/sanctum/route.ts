export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/user'
import { verifyAuth, authError } from '@/lib/auth'
import { fetchPlatformData } from '@/lib/services/fetch'
import { aggregateProfiles } from '@/lib/services/analysis'

async function handleSanctum(req: NextRequest) {
  try {
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

    await connectDB()
    if (aggregated.unifiedScore.score !== user.haomunScore || aggregated.unifiedScore.level !== user.masteryLevel) {
      await User.findByIdAndUpdate(user._id, { haomunScore: aggregated.unifiedScore.score, masteryLevel: aggregated.unifiedScore.level })
    }

    return Response.json({ success: true, data: aggregated })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) { return handleSanctum(req) }
export async function POST(req: NextRequest) { return handleSanctum(req) }

import axios from 'axios'
import { PLATFORMS } from '../constants'

interface PlatformData {
  platform: string
  username: string
  solvedProblems: number
  difficultyBreakdown: Record<string, number>
  heatmapData: { date: string; count: number }[]
  topicDistribution: Record<string, number>
  performanceTrends: any[]
  rating?: number
  source: string
  note?: string
}

async function fetchLeetCodeData(username: string): Promise<PlatformData> {
  try {
    const query = `query GetLeetCodeProfile($username: String!) {
      userProfile(username: $username) {
        username
        profile { realName starRating }
        submitStats { acSubmissionNum { difficulty count } }
      }
      userCalendar(username: $username) { submissionCalendar }
    }`

    const res = await axios.post('https://leetcode.com/graphql', 
      { query, variables: { username } }, 
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (res.data.data.userProfile) {
      const profile = res.data.data.userProfile
      const calendar = res.data.data.userCalendar
      const submissions = profile.submitStats.acSubmissionNum
      const solvedProblems = submissions.reduce((s: number, sub: any) => s + sub.count, 0)

      let heatmapData: { date: string; count: number }[] = []
      try {
        if (calendar?.submissionCalendar) {
          const cal = JSON.parse(calendar.submissionCalendar)
          heatmapData = Object.entries(cal).map(([ts, count]) => ({
            date: new Date(parseInt(ts) * 1000).toISOString().split('T')[0],
            count: count as number
          }))
        }
      } catch { /* ignore */ }

      return {
        platform: PLATFORMS.LEETCODE,
        username: profile.username,
        solvedProblems,
        difficultyBreakdown: submissions.reduce((acc: any, s: any) => {
          acc[s.difficulty.toLowerCase()] = s.count
          return acc
        }, {}),
        heatmapData: heatmapData.slice(-30),
        topicDistribution: {},
        performanceTrends: [],
        source: 'api'
      }
    }
  } catch { /* fallback below */ }

  // Fallback
  return {
    platform: PLATFORMS.LEETCODE, username, solvedProblems: 0,
    difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
    heatmapData: [], topicDistribution: {}, performanceTrends: [],
    source: 'fallback-static', note: 'API failed'
  }
}

async function fetchCodeforcesData(username: string): Promise<PlatformData> {
  const infoRes = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`)
  if (infoRes.data.status !== 'OK') throw new Error('Codeforces user not found')

  const user = infoRes.data.result[0]
  const statusRes = await axios.get(`https://codeforces.com/api/user.status?handle=${username}`)
  const solvedSet = new Set<string>()
  const heatmapMap: Record<string, number> = {}

  if (statusRes.data.status === 'OK') {
    statusRes.data.result.forEach((sub: any) => {
      const date = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0]
      heatmapMap[date] = (heatmapMap[date] || 0) + 1
      if (sub.verdict === 'OK') solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`)
    })
  }

  return {
    platform: PLATFORMS.CODEFORCES, username: user.handle, solvedProblems: solvedSet.size,
    difficultyBreakdown: {}, rating: user.rating || 0,
    heatmapData: Object.entries(heatmapMap).map(([date, count]) => ({ date, count })).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30),
    topicDistribution: {}, performanceTrends: [{ rating: user.rating || 0 }],
    source: 'api'
  }
}

async function fetchCodeChefData(username: string): Promise<PlatformData | null> {
  try {
    // CodeChef is now client-rendered; HTML scraping no longer works.
    // Using community API that returns JSON directly.
    const res = await axios.get(`https://cp-rating-api.vercel.app/codechef/${encodeURIComponent(username)}`)
    const data = res.data
    const rating = parseInt(data.rating) || 0
    return {
      platform: PLATFORMS.CODECHEF, username, solvedProblems: 0,
      difficultyBreakdown: {}, rating,
      heatmapData: [], topicDistribution: {},
      performanceTrends: [{ rating }],
      source: 'api'
    }
  } catch { return null }
}

async function fetchGFGData(username: string): Promise<PlatformData | null> {
  try {
    // GFG is now client-rendered; HTML scraping no longer works.
    // Using GFG's internal practice stats API.
    const res = await axios.get(
      `https://www.geeksforgeeks.org/api/scorecard/${encodeURIComponent(username)}`
    )
    const data = res.data
    const solved = parseInt(data?.totalProblemsSolved ?? data?.totalSolved ?? '0') || 0
    return {
      platform: PLATFORMS.GFG, username, solvedProblems: solved,
      difficultyBreakdown: {}, heatmapData: [],
      topicDistribution: {}, performanceTrends: [], rating: 0,
      source: 'api'
    }
  } catch { return null }
}


export async function fetchPlatformData(platform: string, username: string): Promise<PlatformData | null> {
  switch (platform) {
    case PLATFORMS.LEETCODE: return fetchLeetCodeData(username)
    case PLATFORMS.CODEFORCES: return fetchCodeforcesData(username)
    case PLATFORMS.CODECHEF: return fetchCodeChefData(username)
    case PLATFORMS.GFG: case 'gfg': return fetchGFGData(username)
    default: throw new Error(`Unsupported platform: ${platform}`)
  }
}

export async function getBatchPlatformStats(users: { username: string; platform: string }[]) {
  return Promise.all(users.map(async (u) => {
    try {
      const data = await fetchPlatformData(u.platform || PLATFORMS.LEETCODE, u.username)
      return { success: true, data }
    } catch (e: any) {
      return { success: false, error: e.message, username: u.username }
    }
  }))
}

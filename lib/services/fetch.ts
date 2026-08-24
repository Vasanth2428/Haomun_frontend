import axios from 'axios'
import { PLATFORMS } from '../constants'

interface PlatformData {
  platform: string
  username: string
  solvedProblems: number
  difficultyBreakdown: Record<string, number>
  heatmapData: { date: string; count: number }[]
  topicDistribution: Record<string, number>
  performanceTrends: { rating?: number; date?: string }[]
  rating?: number
  source: string
  note?: string
  contestHistory?: { contestId: number; name: string; rating: number; ranking: number; handle: string }[]
  languages?: string[]
  recentActivity?: number
  submissionHistory?: { title: string; status: string; timestamp: number }[]
}

async function fetchLeetCodeData(username: string): Promise<PlatformData> {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        recentSubmissionList(username: $username, limit: 20) {
          title
          titleSlug
          status
          timestamp
        }
      }
    `;

    const res = await axios.post('https://leetcode.com/graphql',
      { query, variables: { username } },
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (res.data.data?.matchedUser) {
      const user = res.data.data.matchedUser
      const submissions = res.data.data.recentSubmissionList || []
      
      const difficulty = { easy: 0, medium: 0, hard: 0 }
      let totalSolved = 0
      
      if (user.submitStats && user.submitStats.acSubmissionNum) {
        user.submitStats.acSubmissionNum.forEach((item: any) => {
          const difficultyKey = item.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
          if (difficultyKey in difficulty) {
            difficulty[difficultyKey] = item.count
            totalSolved += item.count
          }
        })
      }

      const heatmapData: { date: string; count: number }[] = []
      const topicDistribution: Record<string, number> = {}

      const recentActivity = submissions.length

      return {
        platform: PLATFORMS.LEETCODE,
        username: user.username,
        solvedProblems: totalSolved,
        difficultyBreakdown: difficulty,
        heatmapData,
        topicDistribution,
        performanceTrends: [],
        rating: 0,
        contestHistory: [],
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

async function fetchCodeforcesData(username: string): Promise<PlatformData | null> {
  try {
    const infoRes = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`)
    if (infoRes.data.status !== 'OK') throw new Error('Codeforces user not found')

    const user = infoRes.data.result[0]
    const statusRes = await axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=500`)
    const solvedSet = new Set<string>()
    const heatmapMap: Record<string, number> = {}
    const topicCounts: Record<string, number> = {}
    const difficulty = { easy: 0, medium: 0, hard: 0 }
    const languages = new Set<string>()
    const languagesArr: string[] = []
    const submissionHistory: { title: string; status: string; timestamp: number }[] = []
    let recentActivity = 0

    const now = Date.now()
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000)

    if (statusRes.data.status === 'OK') {
      statusRes.data.result.forEach((sub: any) => {
        const date = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0]
        heatmapMap[date] = (heatmapMap[date] || 0) + 1

        if (sub.creationTimeSeconds * 1000 > oneWeekAgo) {
          recentActivity++
        }

        if (sub.programmingLanguage) {
          languages.add(sub.programmingLanguage)
        }

        if (sub.verdict === 'OK' && sub.problem) {
          const problemKey = `${sub.problem.contestId}-${sub.problem.index}`
          if (!solvedSet.has(problemKey)) {
            solvedSet.add(problemKey)
            
            const rating = sub.problem.rating
            if (rating) {
              if (rating <= 1200) difficulty.easy++
              else if (rating <= 2000) difficulty.medium++
              else difficulty.hard++
            }
          }
        }

        if (submissionHistory.length < 20) {
          submissionHistory.push({
            title: sub.problem?.name || 'Unknown',
            status: sub.verdict,
            timestamp: sub.creationTimeSeconds
          })
        }
      })
    }

    languagesArr.push(...languages)

    const ratingRes = await axios.get(`https://codeforces.com/api/user.rating?handle=${username}`)
    const contestHistory: { contestId: number; name: string; rating: number; ranking: number; handle: string }[] = []
    if (ratingRes.data.status === 'OK') {
      ratingRes.data.result.forEach((r: any) => {
        contestHistory.push({
          contestId: r.contestId,
          name: r.contestName,
          rating: r.newRating,
          ranking: r.ranking,
          handle: r.handel || username
        })
      })
    }

    const sortedHistory = contestHistory.sort((a, b) => a.contestId - b.contestId)
    const performanceTrends = sortedHistory.map(c => ({ rating: c.rating, date: new Date(c.contestId).toISOString() }))

    const totalSolved = Math.max(solvedSet.size, user.rating ? Math.floor(solvedSet.size * 1.2) : solvedSet.size)

    return {
      platform: PLATFORMS.CODEFORCES, username: user.handle, solvedProblems: totalSolved,
      difficultyBreakdown: difficulty, rating: user.rating || 0,
      heatmapData: Object.entries(heatmapMap).map(([date, count]) => ({ date, count })).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30),
      topicDistribution: topicCounts,
      performanceTrends,
      contestHistory: sortedHistory,
      languages: languagesArr,
      recentActivity,
      submissionHistory,
      source: 'api'
    }
  } catch { return null }
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
    case PLATFORMS.GFG: return fetchGFGData(username)
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

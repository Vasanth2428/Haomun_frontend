import { PLATFORMS } from '../constants'

export function analyzeStats(data: any) {
  if (data.solvedProblems === undefined || data.solvedProblems === null) {
    throw new Error(`Data Pipeline Error: solvedProblems is missing for platform ${data.platform || 'unknown'}`)
  }
  const parsedSolved = parseInt(data.solvedProblems)
  if (isNaN(parsedSolved)) {
    throw new Error(`Data Pipeline Error: solvedProblems "${data.solvedProblems}" is invalid for platform ${data.platform || 'unknown'}`)
  }

  const parsedRating = data.rating !== undefined && data.rating !== null ? parseInt(data.rating) : 0;
  const rating = isNaN(parsedRating) ? 0 : Math.max(0, parsedRating);

  const insights: any = {
    solvedProblems: Math.max(0, parsedSolved),
    heatmapData: Array.isArray(data.heatmapData) ? data.heatmapData : [],
    topicDistribution: data.topicDistribution || {},
    performanceTrends: Array.isArray(data.performanceTrends) ? data.performanceTrends : [],
    difficultyBreakdown: data.difficultyBreakdown || { easy: 0, medium: 0, hard: 0 },
    platform: data.platform || 'unknown',
    rating,
  }

  const b = insights.difficultyBreakdown
  insights.totalDifficulty = Object.values(b).reduce((s: number, c: any) => s + (parseInt(c) || 0), 0)
  insights.averageDifficulty = insights.totalDifficulty > 0
    ? ((parseInt(b.easy) || 0) * 1 + (parseInt(b.medium) || 0) * 2 + (parseInt(b.hard) || 0) * 3) / insights.totalDifficulty
    : 0

  return insights
}

export function calculateHaoMunScore(profiles: any[]) {
  let platformCount = 0, totalSolved = 0, maxRating = 0, consistencyBonus = 0

  profiles.forEach(p => {
    if (!p) return
    platformCount++
    
    if (p.solvedProblems === undefined || p.solvedProblems === null) {
      throw new Error(`Data Pipeline Error: solvedProblems is missing for platform ${p.platform || 'unknown'}`)
    }
    const parsedSolved = parseInt(p.solvedProblems)
    if (isNaN(parsedSolved)) {
      throw new Error(`Data Pipeline Error: solvedProblems "${p.solvedProblems}" is invalid for platform ${p.platform || 'unknown'}`)
    }
    const solved = Math.max(0, parsedSolved)
    totalSolved += solved
    
    const parsedRating = p.rating !== undefined && p.rating !== null ? parseInt(p.rating) : 0;
    const rating = isNaN(parsedRating) ? 0 : Math.max(0, parsedRating)
    if (rating > maxRating) maxRating = rating
    
    const heats = Array.isArray(p.heatmapData) ? p.heatmapData.length : 0
    consistencyBonus += heats * 2
  })

  totalSolved = Math.max(0, totalSolved)
  maxRating = Math.max(0, maxRating)
  consistencyBonus = Math.max(0, consistencyBonus)

  const baseScore = (totalSolved * 10) + (maxRating / 2) + consistencyBonus
  const multiplier = 1 + (platformCount > 1 ? (platformCount - 1) * 0.15 : 0)
  const score = Math.round(baseScore * multiplier) || 0

  let level = 'Apprentice'
  if (score >= 10000) level = 'Ethereal'
  else if (score >= 5000) level = 'Oracle'
  else if (score >= 2000) level = 'Master'
  else if (score >= 500) level = 'Sage'

  return {
    score, 
    level,
    metrics: { totalSolved, maxRating, consistencyBonus, platforms: platformCount },
    completeness: {
      leetcode: profiles.some(p => p?.platform === PLATFORMS.LEETCODE),
      codeforces: profiles.some(p => p?.platform === PLATFORMS.CODEFORCES),
      codechef: profiles.some(p => p?.platform === PLATFORMS.CODECHEF),
      gfg: profiles.some(p => p?.platform === PLATFORMS.GFG),
      score: Math.round((platformCount / 4) * 100),
    },
  }
}

export function aggregateProfiles(profiles: any[]) {
  const analyzed = (profiles || []).filter(Boolean).map(analyzeStats)
  const scoreResult = calculateHaoMunScore(analyzed)
  return { profiles: analyzed, unifiedScore: scoreResult, timestamp: new Date().toISOString() }
}

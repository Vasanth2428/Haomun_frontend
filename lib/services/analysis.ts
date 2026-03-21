export function analyzeStats(data: any) {
  const insights: any = {
    solvedProblems: parseInt(data.solvedProblems) || 0,
    heatmapData: Array.isArray(data.heatmapData) ? data.heatmapData : [],
    topicDistribution: data.topicDistribution || {},
    performanceTrends: Array.isArray(data.performanceTrends) ? data.performanceTrends : [],
    difficultyBreakdown: data.difficultyBreakdown || { easy: 0, medium: 0, hard: 0 },
    platform: data.platform || 'unknown',
    rating: parseInt(data.rating) || 0,
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
    totalSolved += parseInt(p.solvedProblems) || 0
    const rating = parseInt(p.rating) || 0
    if (rating > maxRating) maxRating = rating
    consistencyBonus += (Array.isArray(p.heatmapData) ? p.heatmapData.length : 0) * 2
  })

  totalSolved = Math.max(0, totalSolved)
  maxRating = Math.max(0, maxRating)
  consistencyBonus = Math.max(0, consistencyBonus)

  const baseScore = (totalSolved * 10) + (maxRating / 2) + consistencyBonus
  const multiplier = 1 + (platformCount > 1 ? (platformCount - 1) * 0.15 : 0)
  const finalScore = Math.round(baseScore * multiplier) || 0

  let level = 'Apprentice'
  if (finalScore >= 5000) level = 'Oracle'
  else if (finalScore >= 2000) level = 'Master'
  else if (finalScore >= 500) level = 'Sage'

  return {
    score: finalScore, level,
    metrics: { totalSolved, maxRating, consistencyBonus, platforms: platformCount },
    completeness: {
      leetcode: profiles.some(p => p.platform === 'leetcode'),
      codeforces: profiles.some(p => p.platform === 'codeforces'),
      codechef: profiles.some(p => p.platform === 'codechef'),
      gfg: profiles.some(p => p.platform === 'gfg' || p.platform === 'geeksforgeeks'),
      score: Math.round((platformCount / 4) * 100),
    },
  }
}

export function aggregateProfiles(profiles: any[]) {
  const analyzed = (profiles || []).filter(Boolean).map(analyzeStats)
  const scoreResult = calculateHaoMunScore(analyzed)
  return { profiles: analyzed, unifiedScore: scoreResult, timestamp: new Date().toISOString() }
}

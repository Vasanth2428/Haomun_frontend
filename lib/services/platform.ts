import { fetchPlatformData } from './fetch'

export async function getPlatformStats(platform: string, username: string) {
  const data = await fetchPlatformData(platform, username)
  if (!data) throw new Error(`Failed to fetch ${platform} data for ${username}`)

  const diff = data.difficultyBreakdown || {}
  return {
    username: data.username,
    platform: data.platform,
    totalSolved: data.solvedProblems || 0,
    difficulty: {
      easy: parseInt(String(diff.easy || diff.Easy || 0)),
      medium: parseInt(String(diff.medium || diff.Medium || 0)),
      hard: parseInt(String(diff.hard || diff.Hard || 0)),
    },
    recentActivity: Array.isArray(data.heatmapData) ? data.heatmapData.length : 0,
    languages: [] as string[],
    rating: data.rating || 0,
    source: data.source,
  }
}

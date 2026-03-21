import axios from 'axios'

interface ContestData {
  name: string; url: string; startTime: string; endTime: string
  duration: string; site: string; status: string
}

let cache: { data: ContestData[] | null; lastFetched: number | null } = { data: null, lastFetched: null }
const CACHE_DURATION = 30 * 60 * 1000

export async function fetchUpcomingContests(): Promise<ContestData[]> {
  const now = Date.now()
  if (cache.data && cache.lastFetched && (now - cache.lastFetched < CACHE_DURATION)) {
    return cache.data
  }

  try {
    const res = await axios.get('https://kontests.net/api/v1/all', { timeout: 5000 })
    const mapped = res.data.map((c: any) => ({
      name: c.name, url: c.url, startTime: c.start_time, endTime: c.end_time,
      duration: c.duration, site: c.site, status: c.status || 'upcoming'
    }))
    cache = { data: mapped, lastFetched: now }
    return mapped
  } catch {
    return cache.data || [
      { name: "The Oracle's Weekly Rite", url: 'https://leetcode.com/contest/', startTime: new Date(Date.now() + 86400000).toISOString(), endTime: new Date(Date.now() + 90000000).toISOString(), duration: '3600', site: 'LeetCode', status: 'upcoming' },
      { name: 'Codeforces Divine Div. 2', url: 'https://codeforces.com/contests', startTime: new Date(Date.now() + 172800000).toISOString(), endTime: new Date(Date.now() + 180000000).toISOString(), duration: '7200', site: 'Codeforces', status: 'upcoming' },
    ]
  }
}

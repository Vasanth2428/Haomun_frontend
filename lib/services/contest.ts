import axios from 'axios'

interface ContestData {
  name: string; url: string; start_time: string; end_time: string
  duration: string; site: string; status: string; in_24_hours: string
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
      name: c.name, url: c.url, start_time: c.start_time, end_time: c.end_time,
      duration: c.duration, site: c.site, status: c.status || 'upcoming',
      in_24_hours: c.in_24_hours || 'No'
    }))
    cache = { data: mapped, lastFetched: now }
    return mapped
  } catch {
    return cache.data || [
      { name: "The Oracle's Weekly Rite", url: 'https://leetcode.com/contest/', start_time: new Date(Date.now() + 86400000).toISOString(), end_time: new Date(Date.now() + 90000000).toISOString(), duration: '3600', site: 'LeetCode', status: 'upcoming', in_24_hours: 'No' },
      { name: 'Codeforces Divine Div. 2', url: 'https://codeforces.com/contests', start_time: new Date(Date.now() + 172800000).toISOString(), end_time: new Date(Date.now() + 180000000).toISOString(), duration: '7200', site: 'Codeforces', status: 'upcoming', in_24_hours: 'No' },
    ]
  }
}

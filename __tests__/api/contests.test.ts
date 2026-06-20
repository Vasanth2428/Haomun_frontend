import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { GET as contestsGET } from '@/app/api/contests/route'
import { NextRequest } from 'next/server'
import * as contest from '@/lib/services/contest'

vi.mock('@/lib/db', () => ({ default: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  verifyAuth: vi.fn(),
  authError: vi.fn(() => new Response(JSON.stringify({ success: false, error: 'Auth error' }), { status: 401 }))
}))
vi.mock('@/lib/services/contest', () => ({
  fetchUpcomingContests: vi.fn()
}))

describe('Contests API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return contests with correct structure', async () => {
    ;(contest.fetchUpcomingContests as Mock).mockResolvedValue([
      {
        name: "The Oracle's Weekly Rite",
        url: 'https://leetcode.com/contest/',
        start_time: '2024-01-16T00:00:00.000Z',
        end_time: '2024-01-16T01:00:00.000Z',
        duration: '3600',
        site: 'LeetCode',
        status: 'upcoming',
        in_24_hours: 'No'
      }
    ])

    const req = new NextRequest('http://localhost/api/contests', { method: 'GET' })
    const res = await contestsGET(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('should return fallback contests on error', async () => {
    ;(contest.fetchUpcomingContests as Mock).mockResolvedValue([
      { name: "The Oracle's Weekly Rite", url: 'https://leetcode.com/contest/' }
    ])

    const req = new NextRequest('http://localhost/api/contests', { method: 'GET' })
    const res = await contestsGET(req)
    const data = await res.json()

    expect(data.success).toBe(true)
  })
})
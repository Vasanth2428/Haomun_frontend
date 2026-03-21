import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET as sanctumGET } from '@/app/api/user/sanctum/route'
import User from '@/lib/models/user'
import { verifyAuth } from '@/lib/auth'
import { fetchPlatformData } from '@/lib/services/fetch'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({ default: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  verifyAuth: vi.fn(),
  authError: vi.fn(() => new Response(JSON.stringify({ success: false, error: 'Auth error' }), { status: 401 }))
}))
vi.mock('@/lib/services/fetch', () => ({
  fetchPlatformData: vi.fn()
}))
vi.mock('@/lib/models/user', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  }
}))

describe('Sanctum API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(verifyAuth as any).mockResolvedValue({ 
      _id: 'user123', 
      leetcodeUsername: 'test_lc',
      scoreHistory: []
    })
  })

  it('should fetch and aggregate profile data', async () => {
    const req = new NextRequest('http://localhost/api/user/sanctum', { method: 'GET' })

    ;(fetchPlatformData as any).mockResolvedValue({
      platform: 'leetcode',
      solvedProblems: '100',
      rating: '1500',
      difficultyBreakdown: { easy: 50, medium: 30, hard: 20 },
      topicDistribution: { 'Array': 10 }
    })

    const res = await sanctumGET(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data.unifiedScore.score).toBeGreaterThan(0)
    expect(data.data.topicDistribution['Array']).toBe(10)
  })

  it('should handle partial platform failure', async () => {
    const req = new NextRequest('http://localhost/api/user/sanctum', { method: 'GET' })

    ;(fetchPlatformData as any).mockRejectedValue(new Error('Fetch failed'))

    const res = await sanctumGET(req)
    const data = await res.json()

    // It should fail if NONE of the platforms work
    expect(data.success).toBe(false)
    expect(data.error).toContain('Could not fetch data')
  })
})

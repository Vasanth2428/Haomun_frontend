import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as summaryPOST } from '@/app/api/summary/generate/route'
import { NextRequest } from 'next/server'
import * as platform from '@/lib/services/platform'
import * as analysis from '@/lib/services/analysis'
import * as ai from '@/lib/services/ai'

vi.mock('@/lib/db', () => ({ default: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  verifyAuth: vi.fn(),
  authError: vi.fn(() => new Response(JSON.stringify({ success: false, error: 'Auth error' }), { status: 401 }))
}))
vi.mock('@/lib/services/platform', () => ({
  getPlatformStats: vi.fn()
}))
vi.mock('@/lib/services/analysis', () => ({
  analyzeStats: vi.fn()
}))
vi.mock('@/lib/services/ai', () => ({
  generateSummary: vi.fn()
}))

describe('Summary Generate API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fail with missing username', async () => {
    const req = new NextRequest('http://localhost/api/summary/generate', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const res = await summaryPOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
  })

  it('should fail with missing platform', async () => {
    const req = new NextRequest('http://localhost/api/summary/generate', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser' })
    })

    const res = await summaryPOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
  })

  it('should generate summary for valid request', async () => {
    ;(platform.getPlatformStats as any).mockResolvedValue({
      username: 'testuser',
      platform: 'leetcode',
      totalSolved: 100,
      difficulty: { easy: 50, medium: 30, hard: 20 },
      recentActivity: 30,
      languages: [],
      rating: 1500,
      source: 'api'
    })
    ;(analysis.analyzeStats as any).mockReturnValue({
      solvedProblems: 100,
      platform: 'leetcode'
    })
    ;(ai.generateSummary as any).mockResolvedValue('Test summary')

    const req = new NextRequest('http://localhost/api/summary/generate', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', platform: 'leetcode', timeWindow: 30 })
    })

    const res = await summaryPOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('summary')
    expect(data.data).toHaveProperty('platformStats')
  })
})
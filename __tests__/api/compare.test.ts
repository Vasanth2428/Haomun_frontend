import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as comparePOST } from '@/app/api/compare/route'
import { NextRequest } from 'next/server'
import * as fetch from '@/lib/services/fetch'
import * as ai from '@/lib/services/ai'

vi.mock('@/lib/db', () => ({ default: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  verifyAuth: vi.fn(),
  authError: vi.fn(() => new Response(JSON.stringify({ success: false, error: 'Auth error' }), { status: 401 }))
}))
vi.mock('@/lib/services/fetch', () => ({
  getBatchPlatformStats: vi.fn()
}))
vi.mock('@/lib/services/ai', () => ({
  generateSummary: vi.fn()
}))

describe('Compare API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fail with missing users array', async () => {
    const req = new NextRequest('http://localhost/api/compare', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const res = await comparePOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
  })

  it('should fail when all users fail to fetch', async () => {
    ;(fetch.getBatchPlatformStats as any).mockResolvedValue([
      { success: false, error: 'User not found', username: 'user1' }
    ])

    const req = new NextRequest('http://localhost/api/compare', {
      method: 'POST',
      body: JSON.stringify({
        users: [{ username: 'user1', platform: 'leetcode' }]
      })
    })

    const res = await comparePOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to fetch data for all users')
  })

  it('should return comparison with successful users', async () => {
    ;(fetch.getBatchPlatformStats as any).mockResolvedValue([
      { success: true, data: { username: 'user1', solvedProblems: 100 } },
      { success: false, error: 'User not found', username: 'user2' }
    ])
    ;(ai.generateSummary as any).mockResolvedValue('Test summary')

    const req = new NextRequest('http://localhost/api/compare', {
      method: 'POST',
      body: JSON.stringify({
        users: [
          { username: 'user1', platform: 'leetcode' },
          { username: 'user2', platform: 'leetcode' }
        ]
      })
    })

    const res = await comparePOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data.summary.successfulUsers).toBe(1)
    expect(data.data.summary.failedUsers).toBe(1)
  })

  it('should limit users to 5 maximum', async () => {
    const req = new NextRequest('http://localhost/api/compare', {
      method: 'POST',
      body: JSON.stringify({
        users: [
          { username: 'user1', platform: 'leetcode' },
          { username: 'user2', platform: 'leetcode' },
          { username: 'user3', platform: 'leetcode' },
          { username: 'user4', platform: 'leetcode' },
          { username: 'user5', platform: 'leetcode' },
          { username: 'user6', platform: 'leetcode' }
        ]
      })
    })

    const res = await comparePOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
  })
})
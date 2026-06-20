import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { GET as insightsGET } from '@/app/api/insights/route'
import { NextRequest } from 'next/server'
import * as fetch from '@/lib/services/fetch'
import * as auth from '@/lib/auth'

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

describe('Insights API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth.verifyAuth as Mock).mockResolvedValue({
      _id: 'user123',
      scoreHistory: []
    } as any)
  })

  describe('GET /api/insights', () => {
    it('should fail when username is missing', async () => {
      const req = new NextRequest('http://localhost/api/insights?platform=leetcode', { method: 'GET' })
      const res = await insightsGET(req)
      const data = await res.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Username is required')
    })

    it('should fetch platform stats for valid request', async () => {
      ;(fetch.fetchPlatformData as Mock).mockResolvedValue({
        platform: 'leetcode',
        username: 'testuser',
        solvedProblems: 100
      })

      const req = new NextRequest('http://localhost/api/insights?platform=leetcode&username=testuser', { method: 'GET' })
      const res = await insightsGET(req)
      const data = await res.json()

      expect(data.success).toBe(true)
      expect(data.data.platform).toBe('leetcode')
    })
  })
})
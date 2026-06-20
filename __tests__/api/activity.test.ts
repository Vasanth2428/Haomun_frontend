import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { GET as activityGET } from '@/app/api/user/activity/route'
import { NextRequest } from 'next/server'
import User from '@/lib/models/user'
import * as auth from '@/lib/auth'

vi.mock('@/lib/db', () => ({ default: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  verifyAuth: vi.fn(),
  authError: vi.fn(() => new Response(JSON.stringify({ success: false, error: 'Auth error' }), { status: 401 }))
}))
vi.mock('@/lib/models/user', () => ({
  default: {
    findById: vi.fn(),
  }
}))

describe('User Activity API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth.verifyAuth as Mock).mockResolvedValue({ _id: 'user123', scoreHistory: [] } as any)
  })

  it('should return empty data for new user without skill analysis', async () => {
    ;(User.findById as Mock).mockResolvedValue({
      _id: 'user123',
      lastSkillAnalysis: null,
      toObject: () => ({ _id: 'user123' })
    })

    const req = new NextRequest('http://localhost/api/user/activity', { method: 'GET' })
    const res = await activityGET(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
    expect(data.isNewUser).toBe(true)
  })

  it('should aggregate heatmap data by month', async () => {
    ;(User.findById as Mock).mockResolvedValue({
      _id: 'user123',
      lastSkillAnalysis: {
        heatmapData: [
          { date: '2024-01-15', count: 5 },
          { date: '2024-01-20', count: 3 },
          { date: '2024-02-10', count: 7 }
        ]
      }
    })

    const req = new NextRequest('http://localhost/api/user/activity', { method: 'GET' })
    const res = await activityGET(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  it('should handle missing lastSkillAnalysis', async () => {
    ;(User.findById as Mock).mockResolvedValue({
      _id: 'user123',
      lastSkillAnalysis: undefined
    })

    const req = new NextRequest('http://localhost/api/user/activity', { method: 'GET' })
    const res = await activityGET(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.isNewUser).toBe(true)
  })
})
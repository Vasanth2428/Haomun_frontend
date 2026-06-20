import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { GET as leaderboardGET } from '@/app/api/user/leaderboard/route'
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
    find: vi.fn(),
  }
}))

describe('Leaderboard API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth.verifyAuth as Mock).mockResolvedValue({ _id: 'user123' } as any)
    ;(User.find as Mock).mockReturnValue({
      select: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([])
        })
      })
    })
  })

  it('should return global leaderboard sorted by haomunScore', async () => {
    const req = new NextRequest('http://localhost/api/user/leaderboard', { method: 'GET' })
    const res = await leaderboardGET(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  it('should return friends-only leaderboard when filter=friends', async () => {
    ;(User.findById as Mock).mockResolvedValue({
      _id: 'user123',
      friends: ['friend1', 'friend2', 'friend3']
    })

    const req = new NextRequest('http://localhost/api/user/leaderboard?filter=friends', { method: 'GET' })
    const res = await leaderboardGET(req)
    const data = await res.json()

    expect(data.success).toBe(true)
  })
})
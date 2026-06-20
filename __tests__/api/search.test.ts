import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { GET as searchGET } from '@/app/api/user/search/route'
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
    find: vi.fn(),
  }
}))

describe('User Search API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth.verifyAuth as Mock).mockResolvedValue({ _id: 'user123' } as any)
    ;(User.find as Mock).mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([])
      })
    })
  })

  it('should return empty results for short query', async () => {
    const req = new NextRequest('http://localhost/api/user/search?q=a', { method: 'GET' })
    const res = await searchGET(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })

  it('should escape regex special characters in search', async () => {
    ;(User.find as Mock).mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([])
      })
    })

    const req = new NextRequest('http://localhost/api/user/search?q=test.user', { method: 'GET' })
    const res = await searchGET(req)
    const data = await res.json()

    expect(data.success).toBe(true)
  })
})
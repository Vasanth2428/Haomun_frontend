import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET as friendsGET, POST as friendsPOST, DELETE as friendsDELETE } from '@/app/api/user/friends/route'
import User from '@/lib/models/user'
import { verifyAuth } from '@/lib/auth'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({ default: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  verifyAuth: vi.fn(),
  authError: vi.fn(() => new Response(JSON.stringify({ success: false, error: 'Auth error' }), { status: 401 }))
}))
vi.mock('@/lib/models/user', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  }
}))

describe('Friends API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(verifyAuth as any).mockResolvedValue({ _id: 'user123', friends: [] })
    ;(User.findById as any).mockResolvedValue({
      _id: 'user123',
      friends: [],
      populate: vi.fn().mockResolvedValue({ friends: [] })
    })
    ;(User.findByIdAndUpdate as any).mockResolvedValue({})
  })

  describe('GET', () => {
    it('should have friends endpoint accessible', async () => {
      const req = new NextRequest('http://localhost/api/user/friends', { method: 'GET' })
      const res = await friendsGET(req)

      expect(res).toBeDefined()
    })
  })

  describe('POST', () => {
    it('should fail when adding self as friend', async () => {
      const req = new NextRequest('http://localhost/api/user/friends', {
        method: 'POST',
        body: JSON.stringify({ friendId: 'user123' })
      })

      const res = await friendsPOST(req)
      const data = await res.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Cannot add yourself as a friend')
    })

    it('should fail when friend not found', async () => {
      ;(User.findById as any).mockResolvedValue(Promise.resolve(null))

      const req = new NextRequest('http://localhost/api/user/friends', {
        method: 'POST',
        body: JSON.stringify({ friendId: 'nonexistent' })
      })

      const res = await friendsPOST(req)
      const data = await res.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('User not found')
    })
  })

  describe('DELETE', () => {
    it('should fail when friendId is missing', async () => {
      const req = new NextRequest('http://localhost/api/user/friends', { method: 'DELETE' })
      const res = await friendsDELETE(req)
      const data = await res.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Friend ID is required')
    })
  })
})
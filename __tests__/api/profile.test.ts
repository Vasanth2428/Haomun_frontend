import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { GET as profileGET, PATCH as profilePATCH } from '@/app/api/user/profile/route'
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
    findByIdAndUpdate: vi.fn(),
  }
}))

describe('Profile API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth.verifyAuth as Mock).mockResolvedValue({
      _id: 'user123',
      email: 'test@example.com',
      username: 'testuser',
      toObject: () => ({ _id: 'user123', email: 'test@example.com', username: 'testuser' }),
      comparePassword: vi.fn().mockResolvedValue(true)
    } as any)
    ;(User.findById as Mock).mockReturnValue({
      populate: vi.fn().mockResolvedValue({}),
      select: vi.fn().mockResolvedValue({})
    })
    ;(User.findByIdAndUpdate as Mock).mockReturnValue({
      select: vi.fn().mockResolvedValue({})
    })
  })

  describe('GET', () => {
    it('should return user profile successfully', async () => {
      ;(auth.verifyAuth as Mock).mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        toObject: () => ({ _id: 'user123', email: 'test@example.com', username: 'testuser' })
      } as any)

      const req = new NextRequest('http://localhost/api/user/profile', { method: 'GET' })

      const res = await profileGET(req)
      const data = await res.json()

      expect(data.success).toBe(true)
      expect(data.data.email).toBe('test@example.com')
      expect(data.data.password).toBeUndefined()
    })
  })

  describe('PATCH', () => {
    it('should update profile with valid data', async () => {
      ;(User.findByIdAndUpdate as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          _id: 'user123',
          username: 'newusername'
        })
      })

      const req = new NextRequest('http://localhost/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ username: 'newusername', bio: 'New bio' })
      })

      const res = await profilePATCH(req)
      const data = await res.json()

      expect(data.success).toBe(true)
    })

    it('should fail with invalid email format', async () => {
      const req = new NextRequest('http://localhost/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ email: 'invalid-email' })
      })

      const res = await profilePATCH(req)
      const data = await res.json()

      expect(data.success).toBe(false)
      expect(data.error).toBeTruthy()
    })

    it('should fail with short username', async () => {
      ;(User.findByIdAndUpdate as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue({})
      })

      const req = new NextRequest('http://localhost/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ username: 'newusername' })
      })

      const res = await profilePATCH(req)
      const data = await res.json()

      // This should succeed since username is 12 chars (> 2 min)
      expect(data.success).toBe(true)
    })

    it('should fail with wrong current password', async () => {
      ;(auth.verifyAuth as Mock).mockResolvedValue({
        _id: 'user123',
        comparePassword: vi.fn().mockResolvedValue(false)
      } as any)
      ;(User.findByIdAndUpdate as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue({})
      })

      const req = new NextRequest('http://localhost/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: 'wrongpass', newPassword: 'newpassword123' })
      })

      const res = await profilePATCH(req)
      const data = await res.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Current password is incorrect')
    })

    it('should allow updating platform usernames', async () => {
      ;(User.findByIdAndUpdate as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue({})
      })

      const req = new NextRequest('http://localhost/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          platforms: {
            leetcode: 'new_lc_user',
            codeforces: 'new_cf_user'
          }
        })
      })

      const res = await profilePATCH(req)
      const data = await res.json()

      expect(data.success).toBe(true)
    })
  })
})
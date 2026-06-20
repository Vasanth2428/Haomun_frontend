import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { POST as leavePOST } from '@/app/api/guild/leave/route'
import { NextRequest } from 'next/server'
import User from '@/lib/models/user'
import Guild from '@/lib/models/guild'
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
vi.mock('@/lib/models/guild', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  }
}))

describe('Guild Leave API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth.verifyAuth as Mock).mockResolvedValue({
      _id: 'user123',
      guildId: 'guild123'
    } as any)
  })

  it('should fail when user is not in a guild', async () => {
    ;(User.findById as Mock).mockResolvedValue({
      _id: 'user123',
      guildId: null
    })

    const req = new NextRequest('http://localhost/api/guild/leave', { method: 'POST' })
    const res = await leavePOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toBe('You are not in a guild')
  })

  it('should allow non-leader to leave guild successfully', async () => {
    ;(User.findById as Mock).mockImplementation((id: string) => {
      if (id === 'user123') {
        return Promise.resolve({
          _id: 'user123',
          guildId: 'guild123',
          haomunScore: 500
        })
      }
      return null
    })
    ;(Guild.findById as Mock).mockResolvedValue({
      _id: 'guild123',
      leader: 'leader123',
      members: ['user123', 'otheruser'],
      totalScore: 1000
    })
    ;(Guild.findByIdAndUpdate as Mock).mockResolvedValue({})
    ;(User.findByIdAndUpdate as Mock).mockResolvedValue({})

    const req = new NextRequest('http://localhost/api/guild/leave', { method: 'POST' })
    const res = await leavePOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
  })

  it('should disband guild when leader is the only member', async () => {
    ;(User.findById as Mock).mockImplementation((id: string) => {
      if (id === 'user123') {
        return Promise.resolve({
          _id: 'user123',
          guildId: 'guild123',
          haomunScore: 500
        })
      }
      return null
    })
    ;(Guild.findById as Mock).mockResolvedValue({
      _id: 'guild123',
      leader: 'user123',
      members: ['user123'],
      totalScore: 500
    })
    ;(Guild.findByIdAndDelete as Mock).mockResolvedValue({})
    ;(User.findByIdAndUpdate as Mock).mockResolvedValue({})

    const req = new NextRequest('http://localhost/api/guild/leave', { method: 'POST' })
    const res = await leavePOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.message).toContain('disbanded')
  })

  it('should prevent leader from leaving when other members exist', async () => {
    ;(User.findById as Mock).mockImplementation((id: string) => {
      if (id === 'user123') {
        return Promise.resolve({
          _id: 'user123',
          guildId: 'guild123',
          haomunScore: 500
        })
      }
      return null
    })
    ;(Guild.findById as Mock).mockResolvedValue({
      _id: 'guild123',
      leader: 'user123',
      members: ['user123', 'otheruser'],
      totalScore: 1000
    })

    const req = new NextRequest('http://localhost/api/guild/leave', { method: 'POST' })
    const res = await leavePOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('leaders cannot leave')
  })

  it('should clear guild reference when guild no longer exists', async () => {
    ;(User.findById as Mock).mockImplementation((id: string) => {
      if (id === 'user123') {
        return Promise.resolve({
          _id: 'user123',
          guildId: 'guild123',
          haomunScore: 500
        })
      }
      return null
    })
    ;(Guild.findById as Mock).mockResolvedValue(null)
    ;(User.findByIdAndUpdate as Mock).mockResolvedValue({})

    const req = new NextRequest('http://localhost/api/guild/leave', { method: 'POST' })
    const res = await leavePOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.message).toContain('no longer exists')
  })
})
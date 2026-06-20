import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as leavePOST } from '@/app/api/guild/leave/route'
import { NextRequest } from 'next/server'
import User from '@/lib/models/user'
import Guild from '@/lib/models/guild'
import { verifyAuth } from '@/lib/auth'

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
    ;(verifyAuth as any).mockResolvedValue({
      _id: 'user123',
      guildId: 'guild123'
    } as any)
    ;(User.findById as any).mockResolvedValue({
      _id: 'user123',
      guildId: 'guild123',
      haomunScore: 500
    })
    ;(Guild.findById as any).mockResolvedValue({
      _id: 'guild123',
      leader: 'leader123',
      members: ['user123', 'otheruser'],
      totalScore: 1000
    })
    ;(Guild.findByIdAndUpdate as any).mockResolvedValue({})
    ;(User.findByIdAndUpdate as any).mockResolvedValue({})
  })

  it('should fail when user is not in a guild', async () => {
    ;(User.findById as any).mockResolvedValue({
      _id: 'user123',
      guildId: null
    })

    const req = new NextRequest('http://localhost/api/guild/leave', { method: 'POST' })
    const res = await leavePOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toBe('You are not in a guild')
  })

  it('should have leave endpoint accessible', async () => {
    const req = new NextRequest('http://localhost/api/guild/leave', { method: 'POST' })
    const res = await leavePOST(req)

    expect(res).toBeDefined()
  })

  it('should disband guild when leader is the only member', async () => {
    ;(Guild.findById as any).mockResolvedValue({
      _id: 'guild123',
      leader: 'user123',
      members: ['user123'],
      totalScore: 500
    })
    ;(Guild.findByIdAndDelete as any).mockResolvedValue({})

    const req = new NextRequest('http://localhost/api/guild/leave', { method: 'POST' })
    const res = await leavePOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.message).toContain('disbanded')
  })

  it('should prevent leader from leaving when other members exist', async () => {
    ;(Guild.findById as any).mockResolvedValue({
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
    ;(Guild.findById as any).mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/guild/leave', { method: 'POST' })
    const res = await leavePOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.message).toContain('no longer exists')
  })
})
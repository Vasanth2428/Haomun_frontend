import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as createGuildPOST } from '@/app/api/guild/create/route'
import { POST as joinGuildPOST } from '@/app/api/guild/join/route'
import Guild from '@/lib/models/guild'
import User from '@/lib/models/user'
import { verifyAuth } from '@/lib/auth'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({ default: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  verifyAuth: vi.fn(),
  authError: vi.fn(() => new Response(JSON.stringify({ success: false, error: 'Auth error' }), { status: 401 }))
}))
vi.mock('@/lib/models/guild', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  }
}))
vi.mock('@/lib/models/user', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findOneAndUpdate: vi.fn(),
  }
}))

describe('Guild API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
      ; (verifyAuth as any).mockResolvedValue({ _id: 'user123', haomunScore: 500 })
  })

  it('should create a guild successfully', async () => {
    const req = new NextRequest('http://localhost/api/guild/create', {
      method: 'POST',
      body: JSON.stringify({ name: 'The Ancients', description: 'Power to the old' })
    })

      ; (Guild.findOne as any).mockResolvedValue(null)
      ; (Guild.create as any).mockResolvedValue({ _id: 'guild123', name: 'The Ancients' })
      ; (User.findOneAndUpdate as any).mockResolvedValue({ _id: 'user123', guildId: 'guild123' })

    const res = await createGuildPOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(Guild.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'The Ancients' }))
  })

  it('should join a guild atomically', async () => {
    const req = new NextRequest('http://localhost/api/guild/join', {
      method: 'POST',
      body: JSON.stringify({ guildId: 'guild123' })
    })

      ; (Guild.findById as any).mockResolvedValue({ _id: 'guild123', name: 'The Ancients' })
      ; (User.findOneAndUpdate as any).mockResolvedValue({ _id: 'user123', guildId: 'guild123' })
      ; (Guild.findByIdAndUpdate as any).mockResolvedValue({})

    const res = await joinGuildPOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(Guild.findById).toHaveBeenCalledWith('guild123')
    expect(User.findOneAndUpdate).toHaveBeenCalled()
    expect(Guild.findByIdAndUpdate).toHaveBeenCalled()
  })

  it('should fail if user is already in a guild', async () => {
    const req = new NextRequest('http://localhost/api/guild/join', {
      method: 'POST',
      body: JSON.stringify({ guildId: 'guild123' })
    })

      ; (Guild.findById as any).mockResolvedValue({ _id: 'guild123', name: 'The Ancients' })
      ; (User.findOneAndUpdate as any).mockResolvedValue(null) // Failed because guildId != null

    const res = await joinGuildPOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toBe('You are already in a guild or join failed')
  })

  it('should fail if guild does not exist', async () => {
    const req = new NextRequest('http://localhost/api/guild/join', {
      method: 'POST',
      body: JSON.stringify({ guildId: 'nonexistent' })
    })

      ; (Guild.findById as any).mockResolvedValue(null)

    const res = await joinGuildPOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toBe('Guild not found')
  })
})

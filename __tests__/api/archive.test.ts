import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { GET as archiveGET, POST as archivePOST, DELETE as archiveDELETE } from '@/app/api/user/archive/route'
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
    select: vi.fn(),
  }
}))

describe('User Archive API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth.verifyAuth as Mock).mockResolvedValue({ _id: 'user123' } as any)
  })

  describe('GET', () => {
    it('should return user archives', async () => {
      ;(User.findById as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          archives: [
            { title: 'First Draft', content: 'Some content', timestamp: new Date() },
            { title: 'Second Draft', content: 'More content', timestamp: new Date() }
          ]
        })
      })

      const req = new NextRequest('http://localhost/api/user/archive', { method: 'GET' })
      const res = await archiveGET(req)
      const data = await res.json()

      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
    })

    it('should return empty array when no archives', async () => {
      ;(User.findById as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue({ archives: [] })
      })

      const req = new NextRequest('http://localhost/api/user/archive', { method: 'GET' })
      const res = await archiveGET(req)
      const data = await res.json()

      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
    })
  })

  describe('POST', () => {
    it('should create archive successfully', async () => {
      ;(User.findByIdAndUpdate as Mock).mockResolvedValue({
        archives: [{ title: 'New Archive', content: 'New content', timestamp: new Date() }]
      })

      const req = new NextRequest('http://localhost/api/user/archive', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Archive', content: 'New content' })
      })

      const res = await archivePOST(req)
      const data = await res.json()

      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
    })

    it('should fail when title is missing', async () => {
      const req = new NextRequest('http://localhost/api/user/archive', {
        method: 'POST',
        body: JSON.stringify({ content: 'Some content' })
      })

      const res = await archivePOST(req)
      const data = await res.json()

      expect(data.success).toBe(false)
    })

    it('should fail when content is missing', async () => {
      const req = new NextRequest('http://localhost/api/user/archive', {
        method: 'POST',
        body: JSON.stringify({ title: 'Some title' })
      })

      const res = await archivePOST(req)
      const data = await res.json()

      expect(data.success).toBe(false)
    })
  })

  describe('DELETE', () => {
    it('should delete archive successfully', async () => {
      ;(User.findByIdAndUpdate as Mock).mockResolvedValue({ archives: [] })

      const req = new NextRequest('http://localhost/api/user/archive?id=archive123', { method: 'DELETE' })
      const res = await archiveDELETE(req)
      const data = await res.json()

      expect(data.success).toBe(true)
    })

    it('should fail when id is missing', async () => {
      const req = new NextRequest('http://localhost/api/user/archive', { method: 'DELETE' })
      const res = await archiveDELETE(req)
      const data = await res.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Archive ID is required')
    })
  })
})
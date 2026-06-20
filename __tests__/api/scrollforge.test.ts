import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { POST as scrollforgePOST } from '@/app/api/summary/scrollforge/edit/route'
import { NextRequest } from 'next/server'
import * as ai from '@/lib/services/ai'

vi.mock('@/lib/db', () => ({ default: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  verifyAuth: vi.fn(),
  authError: vi.fn(() => new Response(JSON.stringify({ success: false, error: 'Auth error' }), { status: 401 }))
}))
vi.mock('@/lib/services/ai', () => ({
  editScrollForge: vi.fn()
}))

describe('ScrollForge Edit API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(ai.editScrollForge as Mock).mockResolvedValue({ newText: 'Edited draft text', error: undefined })
  })

  it('should fail with missing draft', async () => {
    const req = new NextRequest('http://localhost/api/summary/scrollforge/edit', {
      method: 'POST',
      body: JSON.stringify({ instruction: 'Make it formal' })
    })

    const res = await scrollforgePOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toBeTruthy()
  })

  it('should fail with missing instruction', async () => {
    const req = new NextRequest('http://localhost/api/summary/scrollforge/edit', {
      method: 'POST',
      body: JSON.stringify({ draft: 'This is a test draft with some content to edit.' })
    })

    const res = await scrollforgePOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toBeTruthy()
  })

  it('should edit draft successfully', async () => {
    ;(ai.editScrollForge as Mock).mockResolvedValue({
      newText: 'Edited draft text',
      error: undefined
    })

    const req = new NextRequest('http://localhost/api/summary/scrollforge/edit', {
      method: 'POST',
      body: JSON.stringify({
        draft: 'This is a test draft.',
        instruction: 'Make it formal'
      })
    })

    const res = await scrollforgePOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('newText')
  })
})
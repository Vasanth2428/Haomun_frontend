import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as registerPOST } from '@/app/api/user/register/route'
import { NextRequest } from 'next/server'
import User from '@/lib/models/user'

vi.mock('@/lib/db', () => ({ default: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  generateToken: vi.fn(() => 'test_token'),
  authError: vi.fn(() => new Response(JSON.stringify({ success: false, error: 'Auth error' }), { status: 401 }))
}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn()
  }))
}))
vi.mock('@/lib/models/user', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  }
}))

describe('Auth API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register a new user successfully', async () => {
    const req = new NextRequest('http://localhost/api/user/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', displayName: 'Tester' })
    })

    ;(User.findOne as any).mockResolvedValue(null)
    ;(User.create as any).mockResolvedValue({ 
      _id: 'user123', 
      email: 'test@example.com',
      toObject: () => ({ _id: 'user123', email: 'test@example.com' })
    })

    const res = await registerPOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data.password).toBeUndefined() // DEFENSE: Ensure hash is leaked!
    expect(User.create).toHaveBeenCalled()
  })

  it('should fail if email already exists', async () => {
    const req = new NextRequest('http://localhost/api/user/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'existing@example.com', password: 'password123' })
    })

    ;(User.findOne as any).mockResolvedValue({ email: 'existing@example.com' })

    const res = await registerPOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toBe('User already exists')
  })
})

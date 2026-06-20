import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as loginPOST } from '@/app/api/user/login/route'
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
  }
}))

describe('Login API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should login user successfully with valid credentials', async () => {
    const req = new NextRequest('http://localhost/api/user/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    })

    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      toObject: () => ({ _id: 'user123', email: 'test@example.com' }),
      comparePassword: vi.fn().mockResolvedValue(true)
    }

    ;(User.findOne as any).mockResolvedValue(mockUser)

    const res = await loginPOST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.data.email).toBe('test@example.com')
    expect(data.data.password).toBeUndefined()
  })

  it('should fail with invalid email format', async () => {
    const req = new NextRequest('http://localhost/api/user/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email', password: 'password123' })
    })

    const res = await loginPOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid')
  })

  it('should fail when password is missing', async () => {
    const req = new NextRequest('http://localhost/api/user/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' })
    })

    const res = await loginPOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
  })

  it('should fail when user does not exist', async () => {
    const req = new NextRequest('http://localhost/api/user/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'password123' })
    })

    ;(User.findOne as any).mockResolvedValue(null)

    const res = await loginPOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should fail with wrong password', async () => {
    const req = new NextRequest('http://localhost/api/user/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' })
    })

    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      toObject: () => ({ _id: 'user123', email: 'test@example.com' }),
      comparePassword: vi.fn().mockResolvedValue(false)
    }

    ;(User.findOne as any).mockResolvedValue(mockUser)

    const res = await loginPOST(req)
    const data = await res.json()

    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })
})
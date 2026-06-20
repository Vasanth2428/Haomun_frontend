import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { generateToken, authError } from '@/lib/auth'
import jwt from 'jsonwebtoken'

vi.mock('jsonwebtoken')
vi.mock('@/lib/db', () => ({ default: vi.fn() }))

describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test_secret_key'
    ;(jwt.sign as Mock).mockReturnValue('mock_token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateToken', () => {
    it('should generate token for valid userId', () => {
      const token = generateToken('user123')

      expect(token).toBe('mock_token')
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user123' },
        'test_secret_key',
        { expiresIn: '7d' }
      )
    })

    it('should throw error when JWT_SECRET not defined', () => {
      const originalSecret = process.env.JWT_SECRET
      delete process.env.JWT_SECRET

      expect(() => generateToken('user123')).toThrow('JWT_SECRET')

      process.env.JWT_SECRET = originalSecret
    })
  })

  describe('authError', () => {
    it('should return 401 response with error message', () => {
      const res = authError()

      expect(res.status).toBe(401)
    })
  })
})
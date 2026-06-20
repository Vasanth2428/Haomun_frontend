import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateToken, authError } from '@/lib/auth'
import jwt from 'jsonwebtoken'

vi.mock('jsonwebtoken')
vi.mock('@/lib/db', () => ({ default: vi.fn() }))

describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test_secret'
    ;(jwt.sign as any).mockReturnValue('mock_token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateToken', () => {
    it('should generate token for valid userId', () => {
      const token = generateToken('user123')

      expect(token).toBe('mock_token')
    })
  })

  describe('authError', () => {
    it('should return 401 response with error message', () => {
      const res = authError()

      expect(res.status).toBe(401)
    })
  })
})
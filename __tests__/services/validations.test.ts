import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema, profileUpdateSchema, generateSummarySchema, pdfRequestSchema, scrollForgeEditSchema, friendSchema, compareRequestSchema } from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      })

      expect(result.success).toBe(true)
    })

    it('should fail with invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'invalid-email',
        password: 'password123'
      })

      expect(result.success).toBe(false)
    })

    it('should fail with short password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: '12345'
      })

      expect(result.success).toBe(false)
    })

    it('should fail with short username', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        username: 'a'
      })

      expect(result.success).toBe(false)
    })

    it('should trim whitespace from inputs', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      })

      expect(result.success).toBe(true)
    })
  })

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(true)
    })

    it('should fail with empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: ''
      })

      expect(result.success).toBe(false)
    })
  })

  describe('profileUpdateSchema', () => {
    it('should validate partial updates', () => {
      const result = profileUpdateSchema.safeParse({
        bio: 'New bio text'
      })

      expect(result.success).toBe(true)
    })

    it('should validate platform usernames', () => {
      const result = profileUpdateSchema.safeParse({
        platforms: {
          leetcode: 'new_lc_user',
          codeforces: ''
        }
      })

      expect(result.success).toBe(true)
    })

    it('should validate password change with current password', () => {
      const result = profileUpdateSchema.safeParse({
        currentPassword: 'oldpass',
        newPassword: 'newpassword123'
      })

      expect(result.success).toBe(true)
    })

    it('should fail with short new password', () => {
      const result = profileUpdateSchema.safeParse({
        currentPassword: 'oldpass',
        newPassword: 'short'
      })

      expect(result.success).toBe(false)
    })
  })

  describe('generateSummarySchema', () => {
    it('should validate summary request', () => {
      const result = generateSummarySchema.safeParse({
        username: 'testuser',
        platform: 'leetcode',
        timeWindow: 30
      })

      expect(result.success).toBe(true)
    })

    it('should fail with invalid platform', () => {
      const result = generateSummarySchema.safeParse({
        username: 'testuser',
        platform: 'invalid_platform'
      })

      expect(result.success).toBe(false)
    })

    it('should fail with empty username', () => {
      const result = generateSummarySchema.safeParse({
        username: '',
        platform: 'leetcode'
      })

      expect(result.success).toBe(false)
    })
  })

  describe('pdfRequestSchema', () => {
    it('should validate PDF request', () => {
      const result = pdfRequestSchema.safeParse({
        summary: 'Test summary content',
        insights: { key: 'value' }
      })

      expect(result.success).toBe(true)
    })

    it('should fail with empty summary', () => {
      const result = pdfRequestSchema.safeParse({
        summary: '',
        insights: {}
      })

      expect(result.success).toBe(false)
    })
  })

  describe('scrollForgeEditSchema', () => {
    it('should validate scrollforge edit request', () => {
      const result = scrollForgeEditSchema.safeParse({
        draft: 'This is a draft to edit.',
        instruction: 'Make it formal'
      })

      expect(result.success).toBe(true)
    })

    it('should fail with empty draft', () => {
      const result = scrollForgeEditSchema.safeParse({
        draft: '',
        instruction: 'Make it formal'
      })

      expect(result.success).toBe(false)
    })

    it('should fail with empty instruction', () => {
      const result = scrollForgeEditSchema.safeParse({
        draft: 'Some draft.',
        instruction: ''
      })

      expect(result.success).toBe(false)
    })
  })

  describe('friendSchema', () => {
    it('should validate friend request', () => {
      const result = friendSchema.safeParse({
        friendId: 'user123'
      })

      expect(result.success).toBe(true)
    })

    it('should fail with empty friendId', () => {
      const result = friendSchema.safeParse({
        friendId: ''
      })

      expect(result.success).toBe(false)
    })
  })

  describe('compareRequestSchema', () => {
    it('should validate compare request', () => {
      const result = compareRequestSchema.safeParse({
        users: [
          { username: 'user1', platform: 'leetcode' },
          { username: 'user2', platform: 'codeforces' }
        ]
      })

      expect(result.success).toBe(true)
    })

    it('should fail with empty users array', () => {
      const result = compareRequestSchema.safeParse({
        users: []
      })

      expect(result.success).toBe(false)
    })

    it('should fail with more than 5 users', () => {
      const result = compareRequestSchema.safeParse({
        users: [
          { username: 'user1', platform: 'leetcode' },
          { username: 'user2', platform: 'leetcode' },
          { username: 'user3', platform: 'leetcode' },
          { username: 'user4', platform: 'leetcode' },
          { username: 'user5', platform: 'leetcode' },
          { username: 'user6', platform: 'leetcode' }
        ]
      })

      expect(result.success).toBe(false)
    })

    it('should fail with invalid platform in users', () => {
      const result = compareRequestSchema.safeParse({
        users: [
          { username: 'user1', platform: 'invalid' }
        ]
      })

      expect(result.success).toBe(false)
    })
  })
})
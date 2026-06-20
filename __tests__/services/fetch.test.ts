import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPlatformData, getBatchPlatformStats } from '@/lib/services/fetch'
import axios from 'axios'

vi.mock('axios')

describe('Web Scraping Service - fetchPlatformData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchPlatformData', () => {
    it('should fetch LeetCode data successfully', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: {
          data: {
            userProfile: {
              username: 'testuser',
              submitStats: { acSubmissionNum: [{ difficulty: 'Easy', count: 50 }, { difficulty: 'Medium', count: 30 }, { difficulty: 'Hard', count: 20 }] }
            },
            userCalendar: { submissionCalendar: '{"1234567890": 5, "1234567891": 3}' }
          }
        }
      })

      const result = await fetchPlatformData('leetcode', 'testuser')

      expect(result!.platform).toBe('leetcode')
      expect(result!.username).toBe('testuser')
      expect(result!.solvedProblems).toBe(100)
      expect(result!.difficultyBreakdown).toEqual({ easy: 50, medium: 30, hard: 20 })
    })

    it('should return fallback data when LeetCode API fails', async () => {
      vi.mocked(axios.post).mockRejectedValue(new Error('Network error'))

      const result = await fetchPlatformData('leetcode', 'nonexistent')

      expect(result!.source).toBe('fallback-static')
      expect(result!.note).toBe('API failed')
      expect(result!.solvedProblems).toBe(0)
    })

    it('should fetch Codeforces data successfully', async () => {
      vi.mocked(axios.get).mockImplementation((url: string) => {
        if (url.includes('user.info')) {
          return Promise.resolve({
            data: { status: 'OK', result: [{ handle: 'testuser', rating: 1500 }] }
          })
        }
        return Promise.resolve({
          data: { status: 'OK', result: [{ creationTimeSeconds: 1704067200 }] }
        })
      })

      const result = await fetchPlatformData('codeforces', 'testuser')

      expect(result).not.toBeNull()
      expect(result!.platform).toBe('codeforces')
      expect(result!.username).toBe('testuser')
    })

    it('should return null for non-existent Codeforces user', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: { status: 'FAILED' }
      })

      const result = await fetchPlatformData('codeforces', 'nonexistent')
      expect(result).toBeNull()
    })

    it('should fetch CodeChef data successfully', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: { rating: '1800' }
      })

      const result = await fetchPlatformData('codechef', 'testuser')

      expect(result).not.toBeNull()
      expect(result!.platform).toBe('codechef')
      expect(result!.rating).toBe(1800)
    })

    it('should fetch GFG data successfully', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: { totalProblemsSolved: '150' }
      })

      const result = await fetchPlatformData('gfg', 'testuser')

      expect(result).not.toBeNull()
      expect(result!.platform).toBe('gfg')
      expect(result!.solvedProblems).toBe(150)
    })

    it('should throw error for unsupported platform', async () => {
      await expect(fetchPlatformData('unsupported', 'testuser')).rejects.toThrow('Unsupported platform')
    })
  })

  describe('getBatchPlatformStats', () => {
    it('should fetch stats for multiple users', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { rating: '1500' } })
      vi.mocked(axios.post).mockResolvedValue({ data: { data: { userProfile: null } } })

      const results = await getBatchPlatformStats([
        { username: 'user1', platform: 'codechef' },
        { username: 'user2', platform: 'gfg' }
      ])

      expect(results).toHaveLength(2)
    })

    it('should handle partial failures in batch', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'))
      vi.mocked(axios.post).mockRejectedValue(new Error('Network error'))

      const results = await getBatchPlatformStats([
        { username: 'user1', platform: 'codechef' },
        { username: 'user2', platform: 'codechef' }
      ])

      expect(results).toHaveLength(2)
    })
  })
})
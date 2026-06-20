import { describe, it, expect } from 'vitest'
import { analyzeStats, calculateHaoMunScore, aggregateProfiles } from '@/lib/services/analysis'

describe('Analysis Service', () => {
  describe('analyzeStats', () => {
    it('should analyze stats with valid data', () => {
      const input = {
        platform: 'leetcode',
        solvedProblems: '100',
        rating: '1500',
        difficultyBreakdown: { easy: 50, medium: 30, hard: 20 },
        heatmapData: [{ date: '2024-01-01', count: 5 }],
        topicDistribution: { 'Array': 10 }
      }

      const result = analyzeStats(input)

      expect(result.solvedProblems).toBe(100)
      expect(result.platform).toBe('leetcode')
      expect(result.difficultyBreakdown).toEqual({ easy: 50, medium: 30, hard: 20 })
      expect(result.totalDifficulty).toBe(100)
    })

    it('should handle null values in input', () => {
      const input = {
        solvedProblems: null,
        rating: null,
        difficultyBreakdown: null,
        heatmapData: null,
        topicDistribution: null
      }

      const result = analyzeStats(input)

      expect(result.solvedProblems).toBe(0)
      expect(result.rating).toBe(0)
      expect(result.difficultyBreakdown).toEqual({ easy: 0, medium: 0, hard: 0 })
      expect(result.heatmapData).toEqual([])
    })

    it('should calculate average difficulty correctly', () => {
      const input = {
        difficultyBreakdown: { easy: 50, medium: 30, hard: 20 }
      }

      const result = analyzeStats(input)

      expect(result.averageDifficulty).toBeCloseTo(1.67, 1)
    })

    it('should handle non-numeric difficulty values in calculations', () => {
      const input = {
        difficultyBreakdown: { easy: 'abc', medium: 'def', hard: 'ghi' }
      }

      const result = analyzeStats(input)

      expect(result.totalDifficulty).toBe(0)
      expect(result.averageDifficulty).toBe(0)
    })
  })

  describe('calculateHaoMunScore', () => {
    it('should calculate score for single platform', () => {
      const profiles = [{
        platform: 'leetcode',
        solvedProblems: '100',
        rating: '1500',
        heatmapData: Array(50).fill({ date: '2024-01-01' })
      }]

      const result = calculateHaoMunScore(profiles as any)

      expect(result.score).toBe(1850)
      expect(result.level).toBe('Sage')
      expect(result.metrics.platforms).toBe(1)
    })

    it('should calculate score for multiple platforms with bonus', () => {
      const profiles = [
        { platform: 'leetcode', solvedProblems: '100', rating: '1500', heatmapData: [] },
        { platform: 'codeforces', solvedProblems: '50', rating: '1200', heatmapData: [] }
      ]

      const result = calculateHaoMunScore(profiles as any)

      expect(result.score).toBeGreaterThan(2000)
      expect(result.level).toBe('Master')
    })

    it('should return zero score for empty profiles', () => {
      const result = calculateHaoMunScore([])

      expect(result.score).toBe(0)
      expect(result.level).toBe('Apprentice')
    })

    it('should handle null profiles in array', () => {
      const profiles = [null, undefined, { platform: 'leetcode', solvedProblems: '100', rating: '0', heatmapData: [] }]

      const result = calculateHaoMunScore(profiles as any)

      expect(result.score).toBeGreaterThan(0)
    })

    it('should calculate completeness score', () => {
      const profiles = [
        { platform: 'leetcode', solvedProblems: '100', rating: '1500', heatmapData: [] },
        { platform: 'codeforces', solvedProblems: '50', rating: '1200', heatmapData: [] }
      ]

      const result = calculateHaoMunScore(profiles as any)

      expect(result.completeness.score).toBe(50)
    })

    it('should assign correct levels based on score thresholds', () => {
      const levels = [
        { score: 0, level: 'Apprentice' },
        { score: 600, level: 'Sage' },
        { score: 2500, level: 'Master' },
      ]

      levels.forEach(({ score, level }) => {
        const profiles = [{
          platform: 'leetcode',
          solvedProblems: String(Math.ceil(score / 10)),
          rating: '0',
          heatmapData: []
        }]
        const result = calculateHaoMunScore(profiles as any)
        expect(result.level).toBe(level)
      })
    })
  })

  describe('aggregateProfiles', () => {
    it('should aggregate profiles with timestamps', () => {
      const profiles = [
        { platform: 'leetcode', solvedProblems: '100', rating: '1500', heatmapData: [], difficultyBreakdown: {} }
      ]

      const result = aggregateProfiles(profiles as any)

      expect(result.profiles).toHaveLength(1)
      expect(result.unifiedScore).toBeDefined()
      expect(result.timestamp).toBeDefined()
    })

    it('should handle empty profiles', () => {
      const result = aggregateProfiles([])

      expect(result.profiles).toEqual([])
      expect(result.unifiedScore.score).toBe(0)
    })

    it('should filter out falsy profiles', () => {
      const profiles = [null, undefined, { platform: 'leetcode', solvedProblems: '100', rating: '0', heatmapData: [], difficultyBreakdown: {} }]

      const result = aggregateProfiles(profiles as any)

      expect(result.profiles).toHaveLength(1)
    })
  })
})
import { describe, it, expect } from 'vitest'
import { calculateHaoMunScore } from '@/lib/services/analysis'

describe('calculateHaoMunScore', () => {
  it('should calculate zero score for empty profiles', () => {
    const result = calculateHaoMunScore([])
    expect(result.score).toBe(0)
    expect(result.level).toBe('Apprentice')
  })

  it('should calculate correct score for a single platform', () => {
    const profiles = [{
      platform: 'leetcode',
      solvedProblems: '100',
      rating: '1500',
      heatmapData: new Array(50).fill({})
    }]

    // (100 * 10) + (1500 / 2) + (50 * 2) = 1000 + 750 + 100 = 1850
    // Multiplier for 1 platform = 1
    const result = calculateHaoMunScore(profiles as any)
    expect(result.score).toBe(1850)
    expect(result.level).toBe('Sage')
  })

  it('should apply bonus multiplier for multiple platforms', () => {
    const profiles = [
      { platform: 'leetcode', solvedProblems: '100', rating: '0', heatmapData: [] },
      { platform: 'codeforces', solvedProblems: '50', rating: '1200', heatmapData: [] }
    ]

    // Base: (150 * 10) + (1200 / 2) + 0 = 1500 + 600 = 2100
    // Multiplier for 2 platforms = 1 + (1 * 0.15) = 1.15
    // 2100 * 1.15 = 2415
    const result = calculateHaoMunScore(profiles as any)
    expect(result.score).toBe(2415)
    expect(result.level).toBe('Master')
  })

  it('should handle missing data gracefully', () => {
    const profiles = [null, { platform: 'leetcode', solvedProblems: 'abc', rating: null }]
    const result = calculateHaoMunScore(profiles as any)
    expect(result.score).toBe(0)
    expect(result.level).toBe('Apprentice')
  })
})

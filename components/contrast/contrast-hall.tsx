'use client'

import { useState } from 'react'
import { compareAllies } from '@/utils/api'
import CompareChart from '@/components/charts/CompareChart'
import { PLATFORMS } from '@/lib/constants'
import styles from './contrast-hall.module.css'

interface ContrastHallProps {
  onForge: (data: any) => void
}

interface Ally {
  username: string
  platform: string
}

export default function ContrastHall({ onForge }: ContrastHallProps) {
  const [allies, setAllies] = useState<Ally[]>([
    { username: '', platform: PLATFORMS.LEETCODE },
    { username: '', platform: PLATFORMS.LEETCODE },
    { username: '', platform: PLATFORMS.LEETCODE }
  ])
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateAlly = (index: number, field: keyof Ally, value: string) => {
    const newAllies = [...allies]
    newAllies[index] = { ...newAllies[index], [field]: value }
    setAllies(newAllies)
  }

  const handleCompare = async () => {
    const validAllies = allies.filter(a => a.username.trim() !== '')
    if (validAllies.length < 2) return

    setLoading(true)
    setError('')
    setComparison(null)

    const result = await compareAllies(validAllies)

    if (result.success) {
      setComparison(result.data.data || result.data)
    } else {
      setError(result.error || 'Failed to compare allies')
    }
    setLoading(false)
  }

  const handleForge = () => {
    if (comparison) {
      onForge(comparison)
    }
  }

  return (
    <div className="pavilion-container" style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="text-gradient-gold" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>Contrast Hall</h1>
        <p style={{ color: 'var(--haomun-mist)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
          Compare the intellectual paths of your allies to discern the divergence in your masteries.
        </p>
      </div>

      <div className="contrast-grid" style={{ gap: '32px' }}>
        {allies.map((ally, index) => (
          <div key={index} className="ally-card glass-panel hover-lift" style={{ borderTop: '4px solid var(--haomun-gold)' }}>
            <h3 className="ally-card-header" style={{ textAlign: 'center', color: 'var(--haomun-gold)' }}>Ally {index + 1}</h3>
            <div className="form-group">
              <label className="form-label">Digital Handle</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter handle..."
                value={ally.username}
                onChange={(e) => updateAlly(index, 'username', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Realm</label>
              <select
                className="form-select"
                value={ally.platform}
                onChange={(e) => updateAlly(index, 'platform', e.target.value as any)}
              >
                <option value={PLATFORMS.LEETCODE}>LeetCode</option>
                <option value={PLATFORMS.CODEFORCES}>Codeforces</option>
                <option value={PLATFORMS.CODECHEF}>CodeChef</option>
                <option value={PLATFORMS.GFG}>GFG</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '48px' }}>
        <button className="btn btn-primary" onClick={handleCompare} disabled={loading} style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
          {loading ? 'Consulting Records...' : 'Harmonize & Compare'}
        </button>
      </div>

      {error && (
        <div className="scroll-card glass-panel" style={{ marginTop: '32px', borderColor: 'var(--haomun-crimson)', color: 'var(--haomun-crimson)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {comparison && (
        <div className={styles.slideUp}>
          <div className="scroll-card glass-panel" style={{ marginTop: '48px', borderLeft: '4px solid var(--haomun-primary)' }}>
            <h2 className="scroll-header" style={{ color: 'var(--haomun-primary)' }}>Comparison Scroll</h2>
            <div className="forge-text" style={{ color: 'var(--haomun-scroll)', fontSize: '1.1rem' }}>
              {comparison.comparisonText || comparison.summary || 'Awaiting celestial alignment...'}
            </div>
          </div>

          <div className="chart-container glass-panel hover-lift" style={{ marginTop: '32px' }}>
            <h3 className="chart-title">Comparative Resonance Analysis</h3>
            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <CompareChart
                users={comparison.users?.map((u: any) => ({
                  username: u.username || u.handle || 'Unknown',
                  solved: u.solved || u.totalSolved || 0,
                  rating: u.rating || 0,
                  consistency: u.consistency || u.streak || 0,
                  contests: u.contests || u.contestsAttended || 0,
                  topics: u.topics || u.topicsCovered || 0,
                })) || []}
              />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="btn btn-primary" onClick={handleForge} style={{ boxSizing: 'border-box' }}>
              Forge Comparative Scroll ⚒
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

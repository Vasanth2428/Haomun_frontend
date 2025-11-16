'use client'

import { useState } from 'react'
import { compareAllies } from '@/utils/api'

interface ContrastHallProps {
  onForge: (data: any) => void
}

interface Ally {
  username: string
  platform: string
}

export default function ContrastHall({ onForge }: ContrastHallProps) {
  const [allies, setAllies] = useState<Ally[]>([
    { username: '', platform: 'leetcode' },
    { username: '', platform: 'leetcode' },
    { username: '', platform: 'leetcode' }
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
      setComparison(result.data)
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
    <div className="pavilion-container">
      <h1 className="scroll-header">Contrast Hall</h1>
      <p style={{ color: 'var(--haomun-mist)', marginBottom: '32px' }}>
        Compare the intellectual paths of up to three allies
      </p>

      <div className="contrast-grid">
        {allies.map((ally, index) => (
          <div key={index} className="ally-card">
            <h3 className="ally-card-header">Ally {index + 1}</h3>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter username..."
                value={ally.username}
                onChange={(e) => updateAlly(index, 'username', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Platform</label>
              <select
                className="form-select"
                value={ally.platform}
                onChange={(e) => updateAlly(index, 'platform', e.target.value)}
              >
                <option value="leetcode">LeetCode</option>
                <option value="codeforces">Codeforces</option>
                <option value="codechef">CodeChef</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button className="btn btn-primary" onClick={handleCompare} disabled={loading}>
          {loading ? 'Fetching comparison...' : 'Compare Allies'}
        </button>
      </div>

      {error && (
        <div className="scroll-card" style={{ marginTop: '16px', borderColor: 'var(--haomun-crimson)' }}>
          <div style={{ color: 'var(--haomun-crimson)', textAlign: 'center' }}>
            {error}
          </div>
        </div>
      )}

      {comparison && (
        <>
          <div className="scroll-card" style={{ marginTop: '32px' }}>
            <h2 className="scroll-header">Comparison Scroll</h2>
            <div className="forge-text" style={{ color: 'var(--haomun-scroll)' }}>
              {comparison.comparisonText || comparison.summary || 'Comparison data will appear here'}
            </div>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Comparative Analysis</h3>
            <div style={{ color: 'var(--haomun-mist)', textAlign: 'center', padding: '40px' }}>
              {comparison.chartData || '[Chart data will appear here]'}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button className="btn btn-primary" onClick={handleForge}>
              Forge Scroll
            </button>
          </div>
        </>
      )}
    </div>
  )
}

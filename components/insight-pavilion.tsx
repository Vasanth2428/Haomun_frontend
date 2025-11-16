'use client'

import { useState } from 'react'
import { unveilInsight } from '@/utils/api'

interface InsightPavilionProps {
  onForge: (data: any) => void
}

export default function InsightPavilion({ onForge }: InsightPavilionProps) {
  const [username, setUsername] = useState('')
  const [platform, setPlatform] = useState('leetcode')
  const [timeWindow, setTimeWindow] = useState('30')
  const [insight, setInsight] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUnveil = async () => {
    if (!username) return
    
    setLoading(true)
    setError('')
    setInsight(null)
    
    const result = await unveilInsight({ username, platform, timeWindow })
    
    if (result.success) {
      setInsight(result.data)
    } else {
      setError(result.error || 'Failed to generate insights')
    }
    setLoading(false)
  }

  const handleForge = () => {
    if (insight) {
      onForge(insight)
    }
  }

  return (
    <div className="pavilion-container">
      <h1 className="scroll-header">Insight Pavilion</h1>
      <p style={{ color: 'var(--haomun-mist)', marginBottom: '32px' }}>
        Enter your seal to unveil the patterns of your intellectual journey
      </p>

      <div className="scroll-card">
        <div className="form-group">
          <label className="form-label">Seal (Username)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Platform</label>
          <select
            className="form-select"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
            <option value="codechef">CodeChef</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Time Window (days)</label>
          <select
            className="form-select"
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">365 days</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleUnveil} disabled={loading}>
          {loading ? 'Generating insights...' : 'Unveil Insight'}
        </button>

        {error && (
          <div className="scroll-card" style={{ marginTop: '16px', borderColor: 'var(--haomun-crimson)' }}>
            <div style={{ color: 'var(--haomun-crimson)', textAlign: 'center' }}>
              {error}
            </div>
          </div>
        )}
      </div>

      {insight && (
        <>
          <div className="scroll-card" style={{ marginTop: '32px' }}>
            <h2 className="scroll-header">Your Insight Scroll</h2>
            <div className="forge-text" style={{ color: 'var(--haomun-scroll)' }}>
              {insight.summary}
            </div>

            <div className="insights-grid">
              <div className="insight-item">
                <div className="insight-label">Total Problems</div>
                <div className="insight-value">{insight.totalSolved || 'N/A'}</div>
              </div>
              <div className="insight-item">
                <div className="insight-label">Difficulty</div>
                <div className="insight-value">
                  {insight.difficulty || 'N/A'}
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-label">Recent Activity</div>
                <div className="insight-value">{insight.recentActivity || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Activity Distribution</h3>
            <div style={{ color: 'var(--haomun-mist)', textAlign: 'center', padding: '40px' }}>
              {insight.chartData || '[Chart data will appear here]'}
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

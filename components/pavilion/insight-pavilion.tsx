'use client'

import { useState } from 'react'
import { unveilInsight } from '@/lib/api/client'
import { PLATFORMS } from '@/lib/constants'
import DifficultyChart from '@/components/charts/DifficultyChart'
import styles from './insight-pavilion.module.css'

interface InsightPavilionProps {
  onForge: (data: any) => void
}

export default function InsightPavilion({ onForge }: InsightPavilionProps) {
  const [username, setUsername] = useState('')
  const [platform, setPlatform] = useState(PLATFORMS.LEETCODE)
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
      const insightData = result.data.data || result.data;
      setInsight(insightData)
    } else {
      setError(result.error || 'Failed to generate insights')
    }
    setLoading(false)
  }

  return (
    <div className="pavilion-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div className={styles.headerArea} style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="text-gradient-gold" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>Insight Pavilion</h1>
        <p style={{ color: 'var(--haomun-mist)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
          Enter your digital seal to manifest the patterns of your mastery through the Oracle&apos;s eye.
        </p>
      </div>

      <div className={`pavilion-layout-wrapper ${insight ? 'has-insight' : 'empty-state'}`} style={{
        display: 'grid',
        gridTemplateColumns: insight ? '400px 1fr' : '1fr',
        maxWidth: insight ? '1200px' : '500px',
        margin: '0 auto',
        gap: '40px',
        width: '100%',
        transition: 'all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)',
        position: 'relative',
        flex: 1
      }}>
        {/* Input Card */}
        <div className="scroll-card glass-panel runic-glow" style={{
          height: 'fit-content',
          position: insight ? 'sticky' : 'relative',
          top: insight ? '100px' : '0',
          zIndex: 10
        }}>
          <h2 className="scroll-header">Invoke Oracle</h2>
          <div className="form-group" style={{ marginTop: '24px' }}>
            <label className="form-label">Digital Seal (Username)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your handle..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Realm (Platform)</label>
              <select className="form-select" value={platform} onChange={(e) => setPlatform(e.target.value as any)}>
                <option value={PLATFORMS.LEETCODE}>LeetCode</option>
                <option value={PLATFORMS.CODEFORCES}>Codeforces</option>
                <option value={PLATFORMS.CODECHEF}>CodeChef</option>
                <option value={PLATFORMS.GFG}>GFG</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Epoch (Days)</label>
              <select className="form-select" value={timeWindow} onChange={(e) => setTimeWindow(e.target.value)}>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="365">365 Days</option>
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px', padding: '16px', fontSize: '1.1rem' }}
            onClick={handleUnveil}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.loadingDots}>Consulting...</span>
            ) : 'Manifest Insights'}
          </button>

          {error && (
            <div style={{ color: 'var(--haomun-crimson)', marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="results-wrapper">
          {insight ? (
            <div className={styles.resultsArea}>
              <div className="scroll-card glass-panel" style={{ borderLeft: '4px solid var(--haomun-gold)' }}>
                <h2 className="scroll-header" style={{ color: 'var(--haomun-gold-bright)' }}>Manifested Scroll</h2>
                <div className="forge-text" style={{ fontSize: '1.2rem', color: 'var(--haomun-scroll)', marginBottom: '32px' }}>
                  {insight.summary}
                </div>

                <div className="insights-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <div className="insight-item hover-lift glass-panel">
                    <div className="insight-label">Mastered Trials</div>
                    <div className="insight-value">{insight.platformStats?.totalSolved || insight.totalProblems || 'N/A'}</div>
                  </div>
                  <div className="insight-item hover-lift glass-panel">
                    <div className="insight-label">Difficulty Spectrum</div>
                    <div className="insight-value" style={{ fontSize: '1rem' }}>
                      {insight.platformStats?.difficulty ?
                        `E: ${insight.platformStats.difficulty.easy} | M: ${insight.platformStats.difficulty.medium} | H: ${insight.platformStats.difficulty.hard}`
                        : (insight.difficultySpread || 'N/A')}
                    </div>
                  </div>
                  <div className="insight-item hover-lift glass-panel">
                    <div className="insight-label">Recent Activity</div>
                    <div className="insight-value" style={{ fontSize: '1rem' }}>{insight.recentActivity || 'Consult records'}</div>
                  </div>
                </div>
              </div>

              <div className="chart-container glass-panel hover-lift" style={{ marginTop: '32px' }}>
                <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>📊</span> Difficulty Distribution
                </h3>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                  <DifficultyChart
                    easy={insight.platformStats?.difficulty?.easy || 0}
                    medium={insight.platformStats?.difficulty?.medium || 0}
                    hard={insight.platformStats?.difficulty?.hard || 0}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'end', marginTop: '32px' }}>
                <button className="btn btn-primary" onClick={() => onForge(insight)}>
                  Forge Eternal Scroll ⚒
                </button>
              </div>
            </div>
          ) : (
            !loading && (
              <div className="oracle-background-aura" style={{
                position: 'fixed',
                top: '55%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: -1,
                opacity: 0.03,
                pointerEvents: 'none',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '30rem' }}>👁</span>
              </div>
            )
          )}
        </div>
      </div>

    </div>
  )
}

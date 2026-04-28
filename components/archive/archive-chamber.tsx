'use client'

import { useState, useEffect } from 'react'
import ActivityChart from '@/components/charts/ActivityChart'

interface ArchiveChamberProps {
  onForge: (data: any) => void
}

interface ArchiveEntry {
  title: string
  content: string
  timestamp: string | Date
}

export default function ArchiveChamber({ onForge }: ArchiveChamberProps) {
  const [archives, setArchives] = useState<ArchiveEntry[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      setLoading(true)
      try {
        const { getArchive, getActivity } = await import('@/lib/api/client')
        const [archiveRes, activityRes] = await Promise.all([
          getArchive(controller.signal),
          getActivity(controller.signal)
        ])

        if (archiveRes.success) setArchives(archiveRes.data || [])
        if (activityRes.success) setChartData(activityRes.data || [])

        if (!archiveRes.success && !activityRes.success) {
          setError('Failed to retrieve historical records.')
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        setError(err.message || 'The stellar alignment was lost.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="pavilion-container" style={{ textAlign: 'center', padding: '100px' }}>
        <div className="runic-spinner">🏺</div>
        <p className="text-gradient-gold" style={{ marginTop: '20px' }}>Consulting the historical records...</p>
      </div>
    )
  }

  return (
    <div className="pavilion-container" style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="text-gradient-gold" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>Archive Chamber</h1>
        <p style={{ color: 'var(--haomun-mist)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
          Traverse the halls of your past manifestations and revisit the wisdom of previous trials.
        </p>
      </div>

      {error ? (
        <div className="scroll-card glass-panel" style={{ borderColor: 'var(--haomun-crimson)', textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--haomun-mist)' }}>{error}</p>
        </div>
      ) : archives.length === 0 ? (
        <div className="scroll-card glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>📜</span>
          <p style={{ color: 'var(--haomun-mist)' }}>The scrolls of your past are yet to be written.</p>
        </div>
      ) : (
        <div className="archive-list" style={{ display: 'grid', gap: '20px' }}>
          {archives.map((entry: ArchiveEntry, i: number) => (
            <div key={i} className="scroll-card glass-panel hover-lift" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: '4px solid var(--haomun-gold-mute)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--haomun-gold)', fontWeight: 'bold', fontFamily: 'Cinzel' }}>
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--haomun-scroll)' }}>{entry.title}</h3>
                </div>
                <p style={{ color: 'var(--haomun-mist)', fontSize: '0.95rem' }}>{entry.content.substring(0, 120)}...</p>
              </div>
              <button
                className="btn btn-secondary"
                style={{ marginLeft: '32px', padding: '8px 24px', fontSize: '0.85rem' }}
                onClick={() => onForge({
                  summary: entry.content,
                  metadata: { title: entry.title, timestamp: entry.timestamp }
                })}
              >
                Consult Scroll
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="chart-container glass-panel hover-lift" style={{ marginTop: '40px' }}>
        <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>📈</span> Activity Timeline
        </h3>
        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          <ActivityChart
            data={chartData.length > 0 ? chartData : [
              { date: 'Jan', solved: 0 },
              { date: 'Feb', solved: 0 },
              { date: 'Mar', solved: 0 },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

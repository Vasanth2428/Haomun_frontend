'use client'

import ActivityChart from '@/components/charts/ActivityChart'

interface ArchiveChamberProps {
  onForge: (data: any) => void
}

const mockArchive = [
  {
    id: 1,
    title: 'LeetCode Journey - Q3 2024',
    timestamp: '2024-10-15',
    excerpt: 'A comprehensive analysis of problem-solving patterns across 90 days...',
    content: 'Detailed analysis of your LeetCode journey from July to September 2024. You solved 67 problems with a focus on dynamic programming and graph algorithms. Your streak reached 23 days, demonstrating exceptional consistency.'
  },
  {
    id: 2,
    title: 'GitHub Contributions Analysis',
    timestamp: '2024-09-22',
    excerpt: 'Exploring repository contributions and coding patterns...',
    content: 'Your GitHub activity shows strong contributions to open-source projects. Primary languages: TypeScript (45%), Python (30%), Go (25%). Most active repositories focused on web development frameworks.'
  },
  {
    id: 3,
    title: 'Codeforces Rating Evolution',
    timestamp: '2024-08-10',
    excerpt: 'Tracking competitive programming progress and contest performance...',
    content: 'Contest participation analysis reveals steady rating improvement. Solved 32 problems across 8 contests. Strongest areas: number theory and combinatorics. Areas for growth: segment trees and advanced data structures.'
  }
]

export default function ArchiveChamber({ onForge }: ArchiveChamberProps) {
  const handleViewInForge = (entry: typeof mockArchive[0]) => {
    onForge({
      summary: entry.content,
      metadata: { title: entry.title, timestamp: entry.timestamp }
    })
  }

  return (
    <div className="pavilion-container" style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="text-gradient-gold" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>Archive Chamber</h1>
        <p style={{ color: 'var(--haomun-mist)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
          Traverse the halls of your past manifestations and revisit the wisdom of previous trials.
        </p>
      </div>

      <div className="archive-list" style={{ display: 'grid', gap: '20px' }}>
        {mockArchive.map((entry) => (
          <div key={entry.id} className="scroll-card glass-panel hover-lift" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: '4px solid var(--haomun-gold-mute)'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--haomun-gold)', fontWeight: 'bold', fontFamily: 'Cinzel' }}>{entry.timestamp}</span>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--haomun-scroll)' }}>{entry.title}</h3>
              </div>
              <p style={{ color: 'var(--haomun-mist)', fontSize: '0.95rem' }}>{entry.excerpt}</p>
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

      <div className="chart-container glass-panel hover-lift" style={{ marginTop: '40px' }}>
        <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>📈</span> Activity Timeline
        </h3>
        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          <ActivityChart
            data={[
              { date: 'Jul', solved: 12 },
              { date: 'Aug', solved: 18 },
              { date: 'Sep', solved: 37 },
              { date: 'Oct', solved: 29 },
              { date: 'Nov', solved: 45 },
              { date: 'Dec', solved: 52 },
              { date: 'Jan', solved: 41 },
              { date: 'Feb', solved: 58 },
              { date: 'Mar', solved: 63 },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

'use client'

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
    <div className="pavilion-container">
      <h1 className="scroll-header">Archive Chamber</h1>
      <p style={{ color: 'var(--haomun-mist)', marginBottom: '32px' }}>
        Revisit the wisdom scrolls of your past journeys
      </p>

      <div className="archive-list">
        {mockArchive.map((entry) => (
          <div key={entry.id} className="archive-entry">
            <div className="archive-entry-content">
              <h3 className="archive-entry-title">{entry.title}</h3>
              <div className="archive-entry-meta">{entry.timestamp}</div>
              <p className="archive-entry-excerpt">{entry.excerpt}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => handleViewInForge(entry)}>
              View in Forge
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

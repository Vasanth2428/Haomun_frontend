'use client'

import { useState, useEffect } from 'react'
import { getLeaderboard } from '@/lib/api/client'
import styles from './leaderboard.module.css'

export default function Leaderboard({ friendsOnly = false }: { friendsOnly?: boolean }) {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function fetchLeaderboard(signal?: AbortSignal) {
      setLoading(true)
      try {
        const result = await getLeaderboard(friendsOnly ? 'friends' : undefined, undefined, signal)
        if (result.success) {
          setEntries(result.data)
        } else {
          setError(result.error || 'Failed to manifest leaderboard.')
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        setError(`Consultation lost: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard(controller.signal)
    return () => controller.abort()
  }, [friendsOnly])

  return (
    <div className={styles.leaderboardContainer}>
      <h2 className="scroll-header">{friendsOnly ? 'Comrade Rankings' : 'Global Seekers'}</h2>

      {loading ? (
        <p className="text-gradient-gold" style={{ textAlign: 'center', padding: '40px' }}>Consulting the collective resonance...</p>
      ) : error ? (
        <p style={{ color: 'var(--haomun-crimson)', textAlign: 'center', padding: '40px' }}>{error}</p>
      ) : entries.length === 0 ? (
        <p style={{ color: 'var(--haomun-mist)', textAlign: 'center', padding: '40px' }}>No records found in this realm.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Seeker</th>
                <th>Resonance</th>
                <th>Score</th>
                {/* Actions column if needed */}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry._id} className={styles.row}>
                  <td className={styles.rank}>#{index + 1}</td>
                  <td>
                    <div className={styles.userInfo}>
                      <span className={styles.avatar}>{entry.username?.[0] || '👤'}</span>
                      <span>{entry.username}</span>
                    </div>
                  </td>
                  <td className={styles.level}>{entry.masteryLevel}</td>
                  <td className={styles.score}>{entry.haomunScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

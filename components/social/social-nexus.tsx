'use client'

import { useState, useEffect } from 'react'
import { getFriends, searchUsers, addFriend, removeFriend } from '@/utils/api'
import Leaderboard from './leaderboard'
import GuildNexus from './GuildNexus'
import styles from './social-nexus.module.css'

export default function SocialNexus() {
  const [friends, setFriends] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [showFriendsOnly, setShowFriendsOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<'circle' | 'guilds'>('circle')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    setLoading(true)
    const result = await getFriends()
    if (result.success) setFriends(result.data)
    setLoading(false)
  }

  const handleSearch = async () => {
    if (searchTerm.length < 2) return
    setSearching(true)
    const result = await searchUsers(searchTerm)
    if (result.success) setSearchResults(result.data)
    setSearching(false)
  }

  const handleAddFriend = async (friendId: string) => {
    setStatus('Sending friendship resonance...')
    const result = await addFriend(friendId)
    if (result.success) {
      setStatus('Resonance established.')
      fetchFriends()
      setSearchResults(prev => prev.filter(u => u._id !== friendId))
    } else {
      setStatus(`Failed: ${result.error}`)
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    setStatus('Severing resonance...')
    const result = await removeFriend(friendId)
    if (result.success) {
      setStatus('Resonance severed.')
      fetchFriends()
    } else {
      setStatus(`Failed: ${result.error}`)
    }
  }

  return (
    <div className="pavilion-container" style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="text-gradient-gold" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>Social Nexus</h1>
        <p style={{ color: 'var(--haomun-mist)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
          Connect with fellow seekers and synchronize your mastery across the digital realm.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
          <button 
            className={`btn ${activeTab === 'circle' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ padding: '12px 32px', fontFamily: 'Cinzel' }}
            onClick={() => setActiveTab('circle')}
          >
            The Circle
          </button>
          <button 
            className={`btn ${activeTab === 'guilds' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ padding: '12px 32px', fontFamily: 'Cinzel' }}
            onClick={() => setActiveTab('guilds')}
          >
            Guild Nexus
          </button>
        </div>
      </div>

      {activeTab === 'guilds' ? (
        <GuildNexus />
      ) : (
        <>
          <div className={styles.nexusGrid}>
        {/* Friends List */}
        <div className="scroll-card glass-panel runic-glow">
          <h2 className="scroll-header">Synchronized Comrades ({friends.length})</h2>
          <div className={styles.listContainer}>
            {loading ? (
              <p className="text-gradient-gold" style={{ textAlign: 'center', padding: '40px' }}>Consulting the nexus...</p>
            ) : friends.length === 0 ? (
              <p style={{ color: 'var(--haomun-mist)', textAlign: 'center', padding: '40px' }}>No resonances found in your circle.</p>
            ) : (
              friends.map(friend => (
                <div key={friend._id} className={styles.friendItem}>
                  <div className={styles.friendInfo}>
                    <div className={styles.avatarPlaceholder}>{friend.displayName?.[0] || '👤'}</div>
                    <div>
                      <div className={styles.friendName}>{friend.displayName}</div>
                      <div className={styles.friendLevel}>{friend.masteryLevel} • {friend.haomunScore} pts</div>
                    </div>
                  </div>
                  <button className="btn-text" style={{ color: 'var(--haomun-crimson)' }} onClick={() => handleRemoveFriend(friend._id)}>Sever</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Search & Discovery */}
        <div className="scroll-card glass-panel">
          <h2 className="scroll-header">Discover Seekers</h2>
          <div className="form-group" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by name or handle..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>Invoke</button>
          </div>

          <div className={styles.listContainer} style={{ marginTop: '20px' }}>
            {searching ? (
              <p className="text-gradient-gold" style={{ textAlign: 'center', padding: '40px' }}>Searching realms...</p>
            ) : searchResults.length === 0 && searchTerm.length >= 2 ? (
              <p style={{ color: 'var(--haomun-mist)', textAlign: 'center', padding: '40px' }}>No seekers found with that seal.</p>
            ) : (
              searchResults.map(user => (
                <div key={user._id} className={styles.friendItem}>
                  <div className={styles.friendInfo}>
                    <div className={styles.avatarPlaceholder}>{user.displayName?.[0] || '👤'}</div>
                    <div>
                      <div className={styles.friendName}>{user.displayName}</div>
                      <div className={styles.friendLevel}>{user.masteryLevel} • {user.haomunScore} pts</div>
                    </div>
                  </div>
                  {!friends.some(f => f._id === user._id) && (
                    <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => handleAddFriend(user._id)}>Connect</button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }} className="scroll-card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="scroll-header" style={{ margin: 0 }}>The Rankings</h2>
          <div className="tab-group" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
            <button 
              className={`btn ${!showFriendsOnly ? 'btn-primary' : 'btn-text'}`} 
              style={{ padding: '6px 16px', fontSize: '0.8rem' }}
              onClick={() => setShowFriendsOnly(false)}
            >
              Global
            </button>
            <button 
              className={`btn ${showFriendsOnly ? 'btn-primary' : 'btn-text'}`} 
              style={{ padding: '6px 16px', fontSize: '0.8rem' }}
              onClick={() => setShowFriendsOnly(true)}
            >
              Comrades
            </button>
          </div>
        </div>
        <Leaderboard friendsOnly={showFriendsOnly} />
      </div>
      </>
      )}

      {status && (
        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--haomun-gold)', fontSize: '0.9rem' }}>{status}</div>
      )}
    </div>
  )
}

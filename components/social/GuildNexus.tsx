'use client'

import { useState, useEffect } from 'react'
import { getGuilds, createGuild, joinGuild, getProfile } from '@/utils/api'
import styles from './social-nexus.module.css' // Reusing some base styles

export default function GuildNexus() {
  const [guilds, setGuilds] = useState<any[]>([])
  const [userGuildId, setUserGuildId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [status, setStatus] = useState('')
  
  const [formData, setFormData] = useState({ name: '', description: '', emblem: '🛡️' })

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [])

  const fetchData = async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const [guildsResult, profileResult] = await Promise.all([
        getGuilds(signal), 
        getProfile(signal)
      ])
      
      if (guildsResult.success) setGuilds(guildsResult.data)
      if (profileResult.success) {
        const user = profileResult.data.user || profileResult.data
        setUserGuildId(user.guildId || null)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setStatus(`Resonance lost: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name) return
    setStatus('Forging guild seal...')
    const result = await createGuild(formData)
    if (result.success) {
      setStatus(`Guild ${formData.name} established.`)
      setShowCreate(false)
      fetchData()
    } else {
      setStatus(`Failed: ${result.error}`)
    }
  }

  const handleJoin = async (id: string) => {
    setStatus('Pledging resonance...')
    const result = await joinGuild(id)
    if (result.success) {
      setStatus('Joined the collective.')
      fetchData()
    } else {
      setStatus(`Failed: ${result.error}`)
    }
  }

  const myGuild = guilds.find(g => g._id === userGuildId)

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {myGuild ? (
        <div className="scroll-card glass-panel runic-glow" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span style={{ fontSize: '3rem' }}>{myGuild.emblem}</span>
              <div>
                <h2 className="text-gradient-gold" style={{ fontSize: '2rem', margin: 0 }}>{myGuild.name}</h2>
                <p style={{ color: 'var(--haomun-mist)', margin: '4px 0' }}>{myGuild.description}</p>
                <div style={{ fontSize: '0.85rem', color: 'var(--haomun-slate)' }}> Level: {myGuild.level} • {myGuild.members?.length || 0} Members</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="insight-label">Collective Score</div>
              <div className="insight-value" style={{ fontSize: '2.5rem' }}>{myGuild.totalScore}</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--haomun-mist)', marginBottom: '16px' }}>You have not pledged your residency to any Guild.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel Ritual' : 'Forge New Guild'}
          </button>
        </div>
      )}

      {showCreate && !userGuildId && (
        <div className="scroll-card glass-panel" style={{ marginBottom: '32px', border: '1px solid var(--haomun-gold)' }}>
          <h3 className="scroll-header">Guild Manifestation</h3>
          <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
            <div className="form-group">
              <label className="form-label">Guild Name</label>
              <input 
                className="form-input" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="The Celestial Seekers..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Purpose (Description)</label>
              <textarea 
                className="form-input" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="To transcend the digital limits..."
                style={{ height: '80px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emblem (Emoji)</label>
              <input 
                className="form-input" 
                value={formData.emblem} 
                onChange={e => setFormData({...formData, emblem: e.target.value})}
                placeholder="🛡️"
              />
            </div>
            <button className="btn btn-primary" onClick={handleCreate}>Finalize Manifestation</button>
          </div>
        </div>
      )}

      <div className="scroll-card glass-panel">
        <h3 className="scroll-header">The Hall of Collectives</h3>
        <div style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
          {loading ? (
            <p className="text-gradient-gold" style={{ textAlign: 'center' }}>Consulting the collective...</p>
          ) : guilds.length === 0 ? (
            <p style={{ color: 'var(--haomun-mist)', textAlign: 'center' }}>No guilds have manifested in this realm yet.</p>
          ) : (
            guilds.map(guild => (
              <div key={guild._id} className="insight-item glass-panel" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '20px',
                border: guild._id === userGuildId ? '1px solid var(--haomun-gold)' : undefined
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '2rem' }}>{guild.emblem}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--haomun-gold)' }}>{guild.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--haomun-slate)' }}>{guild.members?.length || 0} Members • Leader: {guild.leader?.username}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--haomun-mist)' }}>SCORE</div>
                    <div style={{ fontWeight: 'bold' }}>{guild.totalScore}</div>
                  </div>
                  {!userGuildId && (
                    <button className="btn btn-secondary" style={{ padding: '6px 16px' }} onClick={() => handleJoin(guild._id)}>Join</button>
                  )}
                  {userGuildId === guild._id && (
                    <span style={{ color: 'var(--haomun-gold)', fontSize: '0.8rem', fontWeight: 'bold' }}>MEMBER</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {status && (
        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--haomun-gold)', fontSize: '0.9rem' }}>{status}</div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Metadata } from 'next'
import { login, register } from '@/utils/api'
import { setAuthCookie } from '@/utils/auth'

export const metadata: Metadata = {
  title: 'Login | HaoMun - The Sanctum Entry',
  description: 'Enter the Sanctum of HaoMun to manifest your digital mastery and synchronize your coding profiles.',
}

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = isLogin ? { email, password } : { email, password, username }
    const result = await (isLogin ? login(payload) : register(payload))

    if (result.success) {
      if (result.data.token) {
        setAuthCookie(result.data.token)
      }
      router.push('/pavilion')
    } else {
      setError(result.error || 'Authentication failed')
    }
    setLoading(false)
  }

  return (
    <div className="glass-panel runic-glow" style={{
      width: '100%',
      maxWidth: '480px',
      padding: '48px',
      borderTop: '4px solid var(--haomun-gold)',
      boxShadow: '0 0 50px rgba(0,0,0,0.8)',
      animation: 'fadeIn 0.4s ease-out',
    }}>
      <h2 className="text-gradient-gold" style={{ textAlign: 'center', marginBottom: '32px', fontSize: '2rem' }}>
        {isLogin ? 'Enter the Sanctum' : 'Join the Order'}
      </h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label className="form-label">Digital Avatar (Username)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Choose your moniker..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Digital Seal (Email)</label>
          <input
            type="email"
            className="form-input"
            placeholder="Your archive email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cipher (Password)</label>
          <input
            type="password"
            className="form-input"
            placeholder="Your secret key..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '24px', padding: '16px', fontSize: '1.1rem' }}
          disabled={loading}
        >
          {loading ? 'Consulting Oracle...' : (isLogin ? 'Grant Access' : 'Initiate Rite')}
        </button>

        {error && (
          <div style={{
            color: 'var(--haomun-crimson)',
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '0.9rem',
            padding: '12px',
            background: 'rgba(211, 47, 47, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(211, 47, 47, 0.2)',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--haomun-mist)', fontSize: '0.95rem' }}>
          {isLogin ? "Awaiting your first seal?" : "Already part of the Order?"}
          <button
            type="button"
            style={{
              marginLeft: '12px',
              color: 'var(--haomun-gold)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Cinzel',
              fontWeight: '700',
              letterSpacing: '1px',
            }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'REGISTER' : 'LOGIN'}
          </button>
        </div>
      </form>
    </div>
  )
}

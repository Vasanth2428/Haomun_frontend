'use client'

import { useState } from 'react'
import { login, register, setAuthToken } from '@/lib/api/client'
import styles from './auth-modal.module.css'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (user: any) => void
    isMandatory?: boolean
}

export default function AuthModal({ isOpen, onClose, onSuccess, isMandatory }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const payload = isLogin ? { email, password } : { email, password, username }
        const result = await (isLogin ? login(payload) : register(payload))

        if (result.success) {
            if (result.data.token) {
                setAuthToken(result.data.token)
            }
            onSuccess(result.data.user || result.data)
            onClose()
        } else {
            setError(result.error || 'Authentication failed')
        }
        setLoading(false)
    }

    return (
        <div className={styles.modalOverlay} onClick={isMandatory ? undefined : onClose}>
            <div className={`${styles.modalContent} glass-panel runic-glow`} onClick={(e) => e.stopPropagation()} style={{ borderTop: '4px solid var(--haomun-gold)' }}>
                {!isMandatory && <button className={styles.modalClose} onClick={onClose}>&times;</button>}

                <h2 className="text-gradient-gold" style={{ textAlign: 'center', marginBottom: '32px', fontSize: '2rem' }}>
                    {isLogin ? 'Enter the Sanctum' : 'Join the Order'}
                </h2>

                <form onSubmit={handleSubmit} className={styles.formSlideUp}>
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

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '24px', padding: '16px', fontSize: '1.1rem' }} disabled={loading}>
                        {loading ? 'Consulting Oracle...' : (isLogin ? 'Grant Access' : 'Initiate Rite')}
                    </button>

                    {error && (
                        <div style={{ color: 'var(--haomun-crimson)', marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', padding: '12px', background: 'rgba(211, 47, 47, 0.1)', borderRadius: '8px', border: '1px solid rgba(211, 47, 47, 0.2)' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--haomun-mist)', fontSize: '0.95rem' }}>
                        {isLogin ? "Awaiting your first seal?" : "Already part of the Order?"}
                        <button
                            type="button"
                            className="btn-text"
                            style={{ marginLeft: '12px', color: 'var(--haomun-gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cinzel', fontWeight: '700', letterSpacing: '1px' }}
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'REGISTER' : 'LOGIN'}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    )
}

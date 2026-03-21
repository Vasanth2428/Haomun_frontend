'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Ω] Celestial Error Observed:', error)
  }, [error])

  return (
    <div className="pavilion-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '70vh',
      textAlign: 'center',
      padding: '40px'
    }}>
      <div className="glass-panel runic-glow" style={{ padding: '60px', border: '2px solid var(--haomun-crimson)' }}>
        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '24px' }}>🛡️</span>
        <h1 className="text-gradient-gold" style={{ fontSize: '2.5rem', marginBottom: '16px', fontFamily: 'Cinzel' }}>Resonance Interrupted</h1>
        <p style={{ color: 'var(--haomun-mist)', fontSize: '1.2rem', marginBottom: '32px', maxWidth: '500px' }}>
          The Pavilion has encountered a profound disturbance in the digital aether. Your current session has been shielded from collapse.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => reset()}
            style={{ padding: '12px 32px' }}
          >
            Attempt Re-alignment
          </button>
          <Link href="/" className="btn btn-secondary" style={{ padding: '12px 32px' }}>
            Return to Gates
          </Link>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '40px', textAlign: 'left', background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '4px', border: '1px solid var(--haomun-charcoal)' }}>
            <code style={{ fontSize: '0.8rem', color: 'var(--haomun-crimson)' }}>{error.message}</code>
          </div>
        )}
      </div>
    </div>
  )
}

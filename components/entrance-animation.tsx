'use client'

import { useEffect, useState } from 'react'

interface EntranceAnimationProps {
  onComplete: () => void
}

export default function EntranceAnimation({ onComplete }: EntranceAnimationProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        onComplete()
      }, 800)
    }, 4000)

    return () => clearTimeout(timer)
  }, [onComplete])

  const handleSkip = () => {
    setFadeOut(true)
    setTimeout(() => {
      onComplete()
    }, 800)
  }

  return (
    <div className={`entrance-container ${fadeOut ? 'entrance-fade-out' : ''}`}>
      <button className="skip-button" onClick={handleSkip}>
        Skip
      </button>

      <div className="entrance-circle">
        <svg viewBox="0 0 200 200">
          <circle className="runic-circle" cx="100" cy="100" r="90" />
          <circle className="runic-circle" cx="100" cy="100" r="75" style={{ animationDelay: '0.3s' }} />
          <circle className="runic-circle" cx="100" cy="100" r="60" style={{ animationDelay: '0.6s' }} />
          <text 
            x="100" 
            y="50" 
            textAnchor="middle" 
            fill="var(--haomun-gold)" 
            fontSize="16" 
            fontFamily="Cormorant Garamond"
            opacity="0"
            style={{ animation: 'textReveal 1s ease-out 2.5s forwards' }}
          >
            ᚺ
          </text>
          <text 
            x="100" 
            y="160" 
            textAnchor="middle" 
            fill="var(--haomun-gold)" 
            fontSize="16" 
            fontFamily="Cormorant Garamond"
            opacity="0"
            style={{ animation: 'textReveal 1s ease-out 2.5s forwards' }}
          >
            ᛗ
          </text>
        </svg>
      </div>

      <h1 className="entrance-title">HaoMun</h1>
      <p className="entrance-subtitle">The Intelligence Pavilion</p>
    </div>
  )
}

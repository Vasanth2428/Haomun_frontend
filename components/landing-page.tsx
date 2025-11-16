'use client'

interface LandingPageProps {
  onEnter: () => void
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="landing-page" onClick={onEnter}>
      <div className="landing-content">
        <div className="landing-circles">
          <svg viewBox="0 0 400 400" className="runic-circles">
            <circle cx="200" cy="200" r="180" className="runic-circle" />
            <circle cx="200" cy="200" r="140" className="runic-circle" />
            <circle cx="200" cy="200" r="100" className="runic-circle" />
            <circle cx="200" cy="200" r="60" className="runic-circle" />
            
            <circle cx="200" cy="200" r="8" className="center-dot" fill="#C9A961" />
          </svg>
        </div>
        
        <h1 className="landing-title">HaoMun</h1>
        <p className="landing-subtitle">The Intelligence Pavilion</p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface NavbarProps {
  currentPage: string
  onNavigate: (page: 'pavilion' | 'contrast' | 'archive' | 'forge') => void
  onTriggerIntro?: () => void
}

export default function Navbar({ currentPage, onNavigate, onTriggerIntro }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onTriggerIntro) {
      onTriggerIntro()
    }
  }

  const handleNavigate = (page: 'pavilion' | 'contrast' | 'archive' | 'forge') => {
    onNavigate(page)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-top-row">
          <a href="#" className="navbar-brand" onClick={handleBrandClick}>
            HaoMun
          </a>
          
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
              {/* Main gate */}
              <rect x="11" y="18" width="10" height="12" strokeWidth="2"/>
              <path d="M 14 22 L 14 28" strokeWidth="1.5"/>
              <path d="M 18 22 L 18 28" strokeWidth="1.5"/>
              
              {/* Left tower */}
              <rect x="4" y="12" width="6" height="18" strokeWidth="1.8"/>
              <polygon points="4,12 7,8 10,12" fill="currentColor"/>
              <rect x="5.5" y="15" width="3" height="3" strokeWidth="1"/>
              
              {/* Right tower */}
              <rect x="22" y="12" width="6" height="18" strokeWidth="1.8"/>
              <polygon points="22,12 25,8 28,12" fill="currentColor"/>
              <rect x="23.5" y="15" width="3" height="3" strokeWidth="1"/>
              
              {/* Main building roof */}
              <polygon points="9,18 16,14 23,18" fill="none" strokeWidth="2"/>
              
              {/* Decorative base */}
              <line x1="4" y1="30" x2="28" y2="30" strokeWidth="2.5"/>
            </svg>
          </button>
        </div>

        <ul className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li>
            <a
              href="#"
              className={`navbar-link ${currentPage === 'pavilion' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigate('pavilion') }}
            >
              Insight Pavilion
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`navbar-link ${currentPage === 'contrast' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigate('contrast') }}
            >
              Contrast Hall
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`navbar-link ${currentPage === 'archive' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigate('archive') }}
            >
              Archive Chamber
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`navbar-link ${currentPage === 'forge' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigate('forge') }}
            >
              Scroll Forge
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

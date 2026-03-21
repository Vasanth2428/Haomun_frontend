'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import styles from './navbar.module.css'

interface NavbarProps {
  onTriggerIntro?: () => void
}

export default function Navbar({ onTriggerIntro }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onTriggerIntro) {
      onTriggerIntro()
    }
  }

  const handleLogout = () => {
    logout()
  }

  const navLinks = [
    { href: '/pavilion', label: 'Pavilion', icon: '✦' },
    { href: '/sanctum', label: 'Sanctum', icon: '⛩', auth: true },
    { href: '/social', label: 'Nexus', icon: '👥', auth: true },
    { href: '/contrast', label: 'Contrast', icon: '☯' },
    { href: '/contests', label: 'Trials', icon: '⚔' },
    { href: '/archive', label: 'Archive', icon: '📜' },
    { href: '/forge', label: 'Forge', icon: '⚒' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          {/* Left: Brand */}
          <div className={styles.navbarLeft}>
            <a href="#" className="navbar-brand" onClick={handleBrandClick}>
              HaoMun
            </a>
          </div>

          {/* Center: Main Links */}
          <ul className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {navLinks.map((link) => {
              if (link.auth && !user) return null;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`navbar-link ${isActive(link.href) ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className={styles.navIcon}>{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Right: Actions */}
          <div className={styles.navbarRight}>
            <div className="user-actions">
              {!user ? (
                <Link href="/login" className={`btn btn-primary ${styles.btnSm}`}>
                  Enter Sanctum
                </Link>
              ) : (
                <div className={styles.userProfileNav}>
                  <Link
                    href="/profile"
                    className={`${styles.userNameLink} ${isActive('/profile') ? styles.active : ''}`}
                  >
                    <span className={styles.profileIcon}>👤</span>
                    {user.username}
                  </Link>
                  <button className={styles.logoutBtn} onClick={handleLogout} title="Depart Sanctum">
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="11" y="18" width="10" height="12" strokeWidth="2" />
                <path d="M 14 22 L 14 28" strokeWidth="1.5" />
                <path d="M 18 22 L 18 28" strokeWidth="1.5" />
                <rect x="4" y="12" width="6" height="18" strokeWidth="1.8" />
                <polygon points="4,12 7,8 10,12" fill="currentColor" />
                <rect x="22" y="12" width="6" height="18" strokeWidth="1.8" />
                <polygon points="22,12 25,8 28,12" fill="currentColor" />
                <polygon points="9,18 16,14 23,18" fill="none" strokeWidth="2" />
                <line x1="4" y1="30" x2="28" y2="30" strokeWidth="2.5" />
              </svg>
            </button>
          </div>
        </div>

      </nav>
    </>
  )
}

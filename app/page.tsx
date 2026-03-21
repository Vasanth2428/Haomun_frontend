import Link from 'next/link'
import { cookies } from 'next/headers'
import styles from './landing.module.css'

export const metadata = {
  title: 'HaoMun | Ancient Wisdom meets AI Intelligence',
  description: 'Ancient wisdom meets modern intelligence. The ultimate analysis platform for seekers of digital mastery.',
  keywords: 'competitive programming, leetcode analytics, codeforces stats, programming social network, AI coding insights',
  openGraph: {
    images: ['/og-image.png'],
  },
}

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')
  const isLoggedIn = !!token

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HaoMun Intelligence Suite',
    operatingSystem: 'Web',
    applicationCategory: 'EducationalApplication',
    description: 'Ancient wisdom meets modern intelligence. The ultimate analysis platform for competitive programmers.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '128',
    },
  }

  return (
    <div className={styles.landingWrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>HaoMun</h1>
        <p className={styles.heroSubtitle}>
          The convergence of ancient strategic wisdom and modern artificial intelligence. 
          Manifest your digital mastery across every realm of code.
        </p>
        <div className={styles.ctaContainer}>
          {isLoggedIn ? (
            <Link href="/pavilion" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.2rem' }}>
              Return to Pavilion 🏯
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.2rem' }}>
                Enter Sanctum ✨
              </Link>
              <Link href="/register" className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '1.2rem' }}>
                Begin Ascension ⚔
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Features Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>The Four Pillars</h2>
          <p style={{ color: 'var(--haomun-mist)' }}>Architected for the elite seeker of knowledge.</p>
        </div>
        
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🏯</span>
            <h3 className={styles.featureTitle}>Intelligence Pavilion</h3>
            <p className={styles.featureText}>
              Harmonize your profiles from LeetCode, Codeforces, CodeChef, and GFG. 
              Real-time cross-platform analytics in a single source of truth.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⚒</span>
            <h3 className={styles.featureTitle}>Scroll Forge</h3>
            <p className={styles.featureText}>
              Leverage Gemini 1.5 Pro to forge deep skill post-mortems and AI-driven performance reports. 
              Refine your manifest with the Oracle's precision.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📜</span>
            <h3 className={styles.featureTitle}>Archive Chamber</h3>
            <p className={styles.featureText}>
              Map your consistency across time and realms. 
              Track every manifestation and observe the evolution of your mastery with high-fidelity heatmaps.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>👥</span>
            <h3 className={styles.featureTitle}>Social Nexus</h3>
            <p className={styles.featureText}>
              Compete, connect, and collaborate. 
              Filtered leaderboards, friend management, and future-ready Guild mechanics for deep collective growth.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Section / Structured Data could be added here */}

      <footer className={styles.footer}>
        <p>&copy; 2026 HaoMun Intelligence Suite. All rights reserved.</p>
        <p style={{ marginTop: '8px', opacity: 0.5 }}>Where Ancient Wisdom Meets Modern Intelligence.</p>
      </footer>
    </div>
  )
}

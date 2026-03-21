import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="pavilion-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh',
      textAlign: 'center'
    }}>
      <div className="glass-panel" style={{ padding: '60px', opacity: 0.8 }}>
        <span style={{ fontSize: '5rem', display: 'block', marginBottom: '20px' }}>🏮</span>
        <h1 className="text-gradient-gold" style={{ fontSize: '3rem', marginBottom: '16px', fontFamily: 'Cinzel' }}>404 - Area Incorporeal</h1>
        <p style={{ color: 'var(--haomun-mist)', fontSize: '1.1rem', marginBottom: '32px' }}>
          Even the Oracle cannot find the record you seek in this sector.
        </p>
        <Link href="/" className="btn btn-primary" style={{ padding: '12px 32px' }}>
          Seek the Pavilion
        </Link>
      </div>
    </div>
  )
}

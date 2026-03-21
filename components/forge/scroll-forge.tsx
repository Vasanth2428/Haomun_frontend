'use client'

import { useState } from 'react'
import { scribeEdit, createReportPdf, saveToArchive } from '@/utils/api'
import styles from './scroll-forge.module.css'

interface ScrollForgeProps {
  data: any
}

export default function ScrollForge({ data }: ScrollForgeProps) {
  const [content, setContent] = useState(data?.summary || data?.content || '')
  const [scribing, setScribing] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [status, setStatus] = useState('')

  const handleScribe = async (tone: string) => {
    setScribing(true)
    setStatus('The Oracle Scribe is refining your manifest...')
    const result = await scribeEdit(content, tone)
    if (result.success) {
      setContent(result.data.refinedText || result.data)
      setStatus('Manifestation refined.')
    } else {
      setStatus(`Scribe error: ${result.error}`)
    }
    setScribing(false)
  }

  const handleRelease = async () => {
    setReleasing(true)
    setStatus('Forging the eternal scroll (PDF)...')
    const result = await createReportPdf(content)
    if (result.success) {
      setStatus('The eternal scroll has been forged successfully!')
      // In a real app, this might trigger a download or show a link
      if (result.data.pdfUrl) {
        window.open(result.data.pdfUrl, '_blank')
      }
    } else {
      setStatus(`Forging failed: ${result.error}`)
    }
    setReleasing(false)
  }

  const [preserving, setPreserving] = useState(false)
  const handlePreserve = async () => {
    setPreserving(true)
    setStatus('Preserving manifestation in the Archive Chamber...')
    const title = `Manifestation - ${new Date().toLocaleDateString()}`
    const result = await saveToArchive(title, content)
    
    if (result.success) {
      setStatus('Manifestation successfully preserved in the Archive.')
    } else {
      setStatus(`Preservation failed: ${result.error}`)
    }
    setPreserving(false)
  }

  return (
    <div className={`pavilion-container ${styles.fadeIn}`}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="text-gradient-gold" style={{ fontSize: '3.3rem', marginBottom: '16px' }}>Scroll Forge</h1>
        <p style={{ color: 'var(--haomun-mist)', fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto' }}>
          Impart permanence to the Oracle's wisdom and manifest the eternal record of your mastery.
        </p>
      </div>

      <div className="forge-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        <div className="scroll-card glass-panel runic-glow" style={{ minHeight: '500px', borderTop: '4px solid var(--haomun-gold)' }}>
          <textarea
            className="forge-textarea"
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--haomun-scroll)',
              fontSize: '1.2rem',
              lineHeight: '1.8',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              padding: '24px'
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Awaiting the first stroke of the scribe..."
          />
        </div>

        <div className="forge-sidebar">
          <div className="scroll-card glass-panel" style={{ marginBottom: '24px' }}>
            <h3 className="scroll-header" style={{ fontSize: '1rem' }}>Oracle Actions</h3>
            <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => handleScribe('professional')}
                disabled={scribing}
              >
                <span>🖋</span> Formal Manifestation
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => handleScribe('motivational')}
                disabled={scribing}
              >
                <span>🔥</span> Inspiring Resonance
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => handleScribe('critical')}
                disabled={scribing}
              >
                <span>⚖</span> Stern Judgement
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--haomun-gold)' }}
                onClick={handlePreserve}
                disabled={preserving || scribing}
              >
                <span>🏺</span> Preserve in Archive
              </button>
            </div>
          </div>

          <div className="scroll-card glass-panel" style={{ borderLeft: '4px solid var(--haomun-primary)' }}>
            <h3 className="scroll-header" style={{ fontSize: '1rem', color: 'var(--haomun-primary)' }}>Final Rite</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--haomun-mist)', marginBottom: '20px' }}>
              Transform this ephemeral manifestation into a celestial scroll (PDF).
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px' }}
              onClick={handleRelease}
              disabled={releasing}
            >
              {releasing ? 'Forging Eternal...' : 'Release Eternal Scroll'}
            </button>
          </div>

          {status && (
            <div style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: status.includes('failed') || status.includes('error') ? 'var(--haomun-crimson)' : 'var(--haomun-gold)',
              animation: 'fadeIn 0.4s ease-out'
            }}>
              {status}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

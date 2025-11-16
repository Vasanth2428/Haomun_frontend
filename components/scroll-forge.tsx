'use client'

import { useState, useRef, useEffect } from 'react'
import { scribeEdit, releaseScroll } from '@/utils/api'

interface ScrollForgeProps {
  data: any
}

interface Message {
  role: 'user' | 'ai'
  content: string
}

export default function ScrollForge({ data }: ScrollForgeProps) {
  const [scrollText, setScrollText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data?.summary) {
      setScrollText(data.summary)
    }
  }, [data])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInvokeScribe = async () => {
    if (!userInput.trim()) return

    const newUserMessage: Message = { role: 'user', content: userInput }
    setMessages(prev => [...prev, newUserMessage])
    setUserInput('')
    setLoading(true)
    setError('')

    const result = await scribeEdit(scrollText, userInput)
    
    if (result.success) {
      const aiMessage: Message = { 
        role: 'ai', 
        content: 'I have refined your scroll based on your instruction.' 
      }
      setMessages(prev => [...prev, aiMessage])
      setScrollText(result.data.newText || result.data.text || scrollText)
    } else {
      const errorMessage: Message = { 
        role: 'ai', 
        content: `Error: ${result.error || 'Failed to refine scroll'}` 
      }
      setMessages(prev => [...prev, errorMessage])
      setError(result.error || 'Failed to refine scroll')
    }
    setLoading(false)
  }

  const handleRelease = async () => {
    setLoading(true)
    setError('')
    
    const result = await releaseScroll(scrollText)
    
    if (result.success) {
      alert(`Scroll released! Report ID: ${result.data.reportId || 'Generated'}`)
    } else {
      setError(result.error || 'Failed to release scroll')
    }
    setLoading(false)
  }

  return (
    <div className="pavilion-container">
      <h1 className="scroll-header">Scroll Forge</h1>
      <p style={{ color: 'var(--haomun-mist)', marginBottom: '24px' }}>
        Refine your scroll with the wisdom of the Oracle Scribe
      </p>

      <div className="forge-container">
        <div className="forge-preview">
          <div className="forge-preview-content">
            <h2 className="forge-title">
              {data?.metadata?.title || 'Your Insight Scroll'}
            </h2>
            <div className="forge-text">{scrollText}</div>
          </div>
        </div>

        <div className="scribe-panel">
          <h3 className="scribe-header">Oracle Scribe</h3>
          <div className="scribe-messages">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--haomun-slate)', padding: '20px' }}>
                Invoke the Oracle Scribe to refine your scroll...
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`scribe-message ${
                  msg.role === 'user' ? 'scribe-message-user' : 'scribe-message-ai'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="scribe-message scribe-message-ai">
                {userInput ? 'Refining your scroll...' : 'Processing...'}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="scribe-input-area">
            <textarea
              className="scribe-textarea"
              placeholder="Give instructions to the Oracle Scribe..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleInvokeScribe()
                }
              }}
              disabled={loading}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleInvokeScribe}
              disabled={loading || !userInput.trim()}
            >
              {loading ? 'Invoking...' : 'Invoke Scribe'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="scroll-card" style={{ marginTop: '16px', borderColor: 'var(--haomun-crimson)' }}>
          <div style={{ color: 'var(--haomun-crimson)', textAlign: 'center' }}>
            {error}
          </div>
        </div>
      )}

      <div className="release-button-container">
        <button className="btn btn-secondary" onClick={handleRelease} disabled={loading}>
          {loading ? 'Releasing...' : 'Release Scroll'}
        </button>
      </div>
    </div>
  )
}

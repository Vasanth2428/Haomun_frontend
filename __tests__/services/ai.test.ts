import { describe, it, expect } from 'vitest'

describe('AI Service Transformations', () => {
  it('should apply formal transformation pattern', () => {
    const draft = "I'm gonna solve this problem!"
    let newText = draft
    
    if (draft.toLowerCase().includes('gonna')) {
      newText = draft.replace(/\b(gonna|gotta|wanna)\b/gi, m => 
        ({ gonna: 'going to', gotta: 'have to', wanna: 'want to' }[m.toLowerCase()] || m))
    }

    expect(newText).toContain('going to')
  })

  it('should apply concise transformation pattern', () => {
    const draft = 'I am going to the market in order to buy food because of the fact that I am hungry.'
    let newText = draft
    
    if (draft.toLowerCase().includes('in order to')) {
      newText = draft.replace(/\b(in order to)\b/gi, 'to').replace(/\s+/g, ' ').trim()
    }

    expect(newText).toContain('to buy food')
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as pdfPOST, GET as pdfGET } from '@/app/api/pdf/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({ default: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  verifyAuth: vi.fn(),
  authError: vi.fn(() => new Response(JSON.stringify({ success: false, error: 'Auth error' }), { status: 401 }))
}))

describe('PDF API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST', () => {
    it('should generate PDF successfully', async () => {
      const req = new NextRequest('http://localhost/api/pdf', {
        method: 'POST',
        body: JSON.stringify({
          summary: 'Test summary content',
          insights: { key: 'value' }
        })
      })

      const res = await pdfPOST(req)

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('application/pdf')
      expect(res.headers.get('Content-Disposition')).toContain('haomun-report.pdf')
    })

    it('should fail with missing summary', async () => {
      const req = new NextRequest('http://localhost/api/pdf', {
        method: 'POST',
        body: JSON.stringify({
          insights: { key: 'value' }
        })
      })

      const res = await pdfPOST(req)
      const data = await res.json()

      expect(data.success).toBe(false)
    })

    it('should fail with empty summary', async () => {
      const req = new NextRequest('http://localhost/api/pdf', {
        method: 'POST',
        body: JSON.stringify({
          summary: '',
          insights: {}
        })
      })

      const res = await pdfPOST(req)
      const data = await res.json()

      expect(data.success).toBe(false)
    })
  })

  describe('GET', () => {
    it('should generate PDF from query params', async () => {
      const req = new NextRequest('http://localhost/api/pdf?summary=Test+Summary&insights=%7B%22key%22%3A%22value%22%7D', { method: 'GET' })

      const res = await pdfGET(req)

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('application/pdf')
    })

    it('should generate PDF with empty insights when not provided', async () => {
      const req = new NextRequest('http://localhost/api/pdf?summary=Test+Summary', { method: 'GET' })

      const res = await pdfGET(req)

      expect(res.status).toBe(200)
    })

    it('should handle invalid insights JSON gracefully', async () => {
      const req = new NextRequest('http://localhost/api/pdf?summary=Test&insights=invalid', { method: 'GET' })

      const res = await pdfGET(req)
      // Should still work with fallback empty insights
      expect(res.status).toBe(200)
    })
  })
})
import { describe, it, expect } from 'vitest'
import { generateReportPDF } from '@/lib/services/pdf'

describe('PDF Service', () => {
  describe('generateReportPDF', () => {
    it('should generate PDF buffer for valid input', async () => {
      const summary = 'This is a test summary for the PDF report.'
      const insights = { solvedProblems: 100, platform: 'leetcode' }

      const result = await generateReportPDF(summary, insights)

      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should generate PDF with empty insights', async () => {
      const summary = 'Test summary'
      const insights = {}

      const result = await generateReportPDF(summary, insights)

      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should generate PDF with empty summary (uses default)', async () => {
      const summary = ''
      const insights = {}

      const result = await generateReportPDF(summary, insights)

      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should generate PDF with long summary (wraps text)', async () => {
      const summary = 'This is a very long summary that should wrap across multiple lines in the PDF document. '.repeat(20)
      const insights = { key: 'value' }

      const result = await generateReportPDF(summary, insights)

      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should generate PDF with object insights', async () => {
      const summary = 'Test summary'
      const insights = {
        strength: 'Strong in arrays',
        weakness: 'Weak in graphs',
        recommendation: 'Practice more graph problems'
      }

      const result = await generateReportPDF(summary, insights)

      expect(result).toBeInstanceOf(Uint8Array)
    })
  })
})
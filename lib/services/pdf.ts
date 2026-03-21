import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function generateReportPDF(summary: string, insights: any): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)

  const margin = 50
  const pageWidth = 595.28
  const pageHeight = 841.89
  const contentWidth = pageWidth - 2 * margin

  let page = doc.addPage([pageWidth, pageHeight])
  let y = pageHeight - 60

  const addNewPage = () => {
    page = doc.addPage([pageWidth, pageHeight])
    y = pageHeight - 60
    return page
  }

  // Header
  page.drawText('HaoMun Intelligence Report', { x: margin, y, font: boldFont, size: 24, color: rgb(0.83, 0.69, 0.22) })
  y -= 40
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, { x: margin, y, font, size: 10, color: rgb(0.5, 0.5, 0.5) })
  y -= 40

  // Summary title
  page.drawText('Summary', { x: margin, y, font: boldFont, size: 14, color: rgb(0.2, 0.2, 0.2) })
  y -= 25

  // Word-wrap summary text
  const words = (summary || 'No summary available').split(/\s+/)
  let line = ''
  
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(test, 11) > contentWidth) {
      page.drawText(line, { x: margin, y, font, size: 11, color: rgb(0.3, 0.3, 0.3) })
      y -= 16
      line = word

      if (y < 60) {
        page = addNewPage()
      }
    } else {
      line = test
    }
  }
  if (line) {
    page.drawText(line, { x: margin, y, font, size: 11, color: rgb(0.3, 0.3, 0.3) })
    y -= 30
  }

  // Insights
  if (insights && Object.keys(insights).length > 0) {
    if (y < 120) page = addNewPage()
    
    page.drawText('Manifested Insights', { x: margin, y, font: boldFont, size: 14, color: rgb(0.2, 0.2, 0.2) })
    y -= 25

    Object.entries(insights).forEach(([key, value]) => {
      if (y < 60) page = addNewPage()
      const text = `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
      
      // Simple wrap for insights
      if (font.widthOfTextAtSize(text, 10) > contentWidth) {
         page.drawText(text.substring(0, 80) + '...', { x: margin, y, font, size: 10, color: rgb(0.4, 0.4, 0.4) })
      } else {
         page.drawText(text, { x: margin, y, font, size: 10, color: rgb(0.4, 0.4, 0.4) })
      }
      y -= 14
    })
  }

  const pdfBytes = await doc.save()
  return pdfBytes
}

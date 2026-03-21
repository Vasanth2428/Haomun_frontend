import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function generateReportPDF(summary: string, insights: any): Promise<Buffer> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)

  const page = doc.addPage([595.28, 841.89]) // A4
  const { height } = page.getSize()
  let y = height - 60

  // Title
  page.drawText('HaoMun Intelligence Report', { x: 50, y, font: boldFont, size: 24, color: rgb(0.83, 0.69, 0.22) })
  y -= 40

  // Date
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, { x: 50, y, font, size: 10, color: rgb(0.5, 0.5, 0.5) })
  y -= 30

  // Summary
  page.drawText('Summary', { x: 50, y, font: boldFont, size: 14, color: rgb(0.2, 0.2, 0.2) })
  y -= 20

  // Word-wrap summary text
  const words = (summary || 'No summary available').split(' ')
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(test, 11) > 495) {
      page.drawText(line, { x: 50, y, font, size: 11, color: rgb(0.3, 0.3, 0.3) })
      y -= 16
      line = word
      if (y < 60) break
    } else {
      line = test
    }
  }
  if (line && y >= 60) {
    page.drawText(line, { x: 50, y, font, size: 11, color: rgb(0.3, 0.3, 0.3) })
  }

  const pdfBytes = await doc.save()
  return Buffer.from(pdfBytes)
}

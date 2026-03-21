import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { generateReportPDF } from '@/lib/services/pdf'

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req)
    const { summary, insights } = await req.json()
    const pdfBuffer = await generateReportPDF(summary, insights)

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="haomun-report.pdf"',
      },
    })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await verifyAuth(req)
    const url = new URL(req.url)
    const summary = url.searchParams.get('summary') || ''
    const insights = JSON.parse(url.searchParams.get('insights') || '{}')
    const pdfBuffer = await generateReportPDF(summary, insights)

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="haomun-report.pdf"',
      },
    })
  } catch (e: any) {
    if (e.message === 'No token provided' || e.message === 'User not found') return authError()
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}

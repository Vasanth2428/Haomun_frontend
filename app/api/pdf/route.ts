export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { verifyAuth, authError } from '@/lib/auth'
import { generateReportPDF } from '@/lib/services/pdf'

import { pdfRequestSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    await verifyAuth(req)
    const body = await req.json()
    const validation = pdfRequestSchema.safeParse(body)

    if (!validation.success) {
      return Response.json({ 
        success: false, 
        error: validation.error.errors[0].message 
      }, { status: 400 })
    }

    const { summary, insights } = validation.data
    const pdfBuffer = await generateReportPDF(summary, insights)

    return new Response(new Uint8Array(pdfBuffer), {
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

    return new Response(new Uint8Array(pdfBuffer), {
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

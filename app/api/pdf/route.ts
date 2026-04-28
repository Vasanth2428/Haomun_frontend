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

    return new Response(pdfBuffer as any, {
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

    let insights = {}
    const insightsParam = url.searchParams.get('insights')
    if (insightsParam) {
      try {
        insights = JSON.parse(insightsParam)
      } catch (e) {
        console.error('Failed to parse insights JSON:', e)
      }
    }

    const validation = pdfRequestSchema.safeParse({ summary, insights })
    if (!validation.success) {
      return Response.json({
        success: false,
        error: validation.error.errors[0].message
      }, { status: 400 })
    }

    const pdfBuffer = await generateReportPDF(validation.data.summary, validation.data.insights)

    return new Response(pdfBuffer as any, {
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

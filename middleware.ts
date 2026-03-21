import { NextResponse, NextRequest } from 'next/server'

// In-memory rate limit store (Note: In production, use Redis)
const rateLimitStore = new Map<string, { count: number, resetAt: number }>()

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous'
  const path = request.nextUrl.pathname
  const token = request.cookies.get('haomun_token')?.value

  // Only rate limit API routes
  if (path.startsWith('/api')) {
    const now = Date.now()
    const entry = rateLimitStore.get(ip) || { count: 0, resetAt: now + 60000 }

    if (now > entry.resetAt) {
      entry.count = 0
      entry.resetAt = now + 60000
    }

    entry.count++
    rateLimitStore.set(ip, entry)

    if (entry.count > 60) { // 60 Req per minute
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too many requests. The Oracle needs a moment to breathe.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}

import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Rate limiting is intentionally omitted here.
  // In-memory Maps reset on every serverless cold start, making them useless in production.
  // When scaling, use Upstash Redis or Vercel's Edge Config for rate limiting.
  // For now, this middleware is a pass-through for API routes.

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}

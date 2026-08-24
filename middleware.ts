import { NextResponse, NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

const AI_RATE_LIMIT_PATHS = ['/api/summary', '/api/scrollforge', '/api/compare']

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const pathname = request.nextUrl.pathname

  const shouldRateLimit = AI_RATE_LIMIT_PATHS.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  )

  if (shouldRateLimit) {
    try {
      const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip)

      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        })
      }

      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', limit.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', reset.toString())
      return response
    } catch (error) {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}

import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']

export function middleware(req: NextRequest) {
  const token = req.cookies.get('haomun_token')?.value
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  // Unauthenticated user trying to access a protected route → redirect to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Authenticated user trying to access login/register → redirect to pavilion
  if (token && isPublic) {
    return NextResponse.redirect(new URL('/pavilion', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.*|apple-icon.*).*)'],
}

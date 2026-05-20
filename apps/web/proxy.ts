import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // JWT session cookie set by NextAuth — exists = logged in
  const session =
    request.cookies.get('authjs.session-token') ??
    request.cookies.get('__Secure-authjs.session-token')

  const isLoggedIn = !!session
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}

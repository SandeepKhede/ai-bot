import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // JWT session cookie set by NextAuth — exists = logged in
  const session =
    request.cookies.get('authjs.session-token') ??
    request.cookies.get('__Secure-authjs.session-token')

  const isLoggedIn = !!session
  const { pathname } = request.nextUrl

  // Protect dashboard and setup — redirect to login if not logged in
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/setup')) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from login/signup to dashboard
  if ((pathname === '/login' || pathname === '/signup') && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/setup/:path*', '/setup', '/login', '/signup'],
}

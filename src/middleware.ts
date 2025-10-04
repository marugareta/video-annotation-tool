import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (token) {
      if (pathname === '/') {
        const redirectUrl = token.role === 'admin' ? '/admin' : '/videos';
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }

      if (pathname.startsWith('/admin') && token.role !== 'admin') {
        return NextResponse.redirect(new URL('/videos', req.url));
      }

      if (pathname === '/login' || pathname === '/register') {
        const redirectUrl = token.role === 'admin' ? '/admin' : '/videos';
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
    }

    if (!token) {
      if (pathname === '/login' || pathname === '/register') {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        if (pathname === '/login' || pathname === '/register') {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/videos/:path*',
    '/annotate/:path*',
    '/login',
    '/register'
  ]
};
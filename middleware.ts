import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Admin sayfalarını kontrol et
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Auth kontrolü (cookie ile)
    const authCookie = request.cookies.get('adminAuth');
    
    // Eğer auth yoksa login'e yönlendir
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

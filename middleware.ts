import { NextRequest, NextResponse } from 'next/server';
export function middleware(req: NextRequest) {
  const token = req.cookies.get('subflow_token')?.value;
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  if (isDashboard && !token) return NextResponse.redirect(new URL('/login', req.url));
  if (req.nextUrl.pathname === '/login' && token) return NextResponse.redirect(new URL('/dashboard', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/dashboard/:path*', '/login'] };

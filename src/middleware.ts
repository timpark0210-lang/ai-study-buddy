import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lowerPath = pathname.toLowerCase();
  
  // LOG: Systematic Debugging Instrumentation (Level 1)
  console.log(`[PROXY] Incoming: ${pathname} | Normalized: ${lowerPath}`);

  // Defensive Guard: Immediately intercept and fix any nested or regional locale suffixes
  // This breaks the loop before next-intl's internal logic can trigger another redirect.
  if (lowerPath.includes('en-nz') || lowerPath.match(/\/(en|ko)\/(en|ko)/)) {
    const url = request.nextUrl.clone();
    // Normalize to standard /en or /ko
    url.pathname = lowerPath.startsWith('/ko') ? '/ko' : '/en';
    const redirectUrl = url.toString();
    console.log(`[PROXY] 🚩 REDIRECT: ${pathname} -> ${redirectUrl}`);
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(ko|en)/:path*',
    '/((?!api|_next|_static|_vercel|.*\\..*).*)'
  ]
};

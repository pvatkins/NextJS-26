// frontend/src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Basic ')) {
    try {
      const authValue = authHeader.slice(6);
      const decoded = atob(authValue);
      const separator = decoded.indexOf(':');

      const username = decoded.slice(0, separator);
      const password = decoded.slice(separator + 1);

      if (
        username === process.env.ADMIN_DIAGNOSTIC_USER &&
        password === process.env.ADMIN_DIAGNOSTIC_PASS
      ) {
        return NextResponse.next();
      }
    } catch {
      // Invalid authentication value; return the challenge below.
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="CARC Administration"',
    },
  });
}

export const config = {
  matcher: [
    '/test-get-full-name/:path*',
    '/test-get-last-entries/:path*',
    '/members/:path*',
  ],
};
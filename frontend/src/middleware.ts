// frontend/src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const [scheme, encodedCredentials] = authHeader.split(' ');

    if (scheme === 'Basic' && encodedCredentials) {
      const decodedCredentials = atob(encodedCredentials);

      // Split only at the first colon so a password may contain colons.
      const separatorIndex = decodedCredentials.indexOf(':');

      if (separatorIndex !== -1) {
        const username = decodedCredentials.substring(0, separatorIndex);
        const password = decodedCredentials.substring(separatorIndex + 1);

        if (
          username === process.env.ADMIN_DIAGNOSTIC_USER &&
          password === process.env.ADMIN_DIAGNOSTIC_PASS
        ) {
          return NextResponse.next();
        }
      }
    }
  }

  // No valid credentials:
  // cause the browser to display its native Basic Authentication dialog.
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="CARC Restricted Area"',
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
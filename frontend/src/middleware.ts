// frontend/src/middleware.ts
import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    try {
      // 1. Properly split and extract ONLY the base64 token string array item
      const tokenSegments = authHeader.split(' ');
      const base64Token = tokenSegments[1];

      // 2. Safely decode the raw base64 credentials text string layout
      const decodedString = atob(base64Token);
      const [username, password] = decodedString.split(':');

      const secureUser = process.env.ADMIN_DIAGNOSTIC_USER;
      const securePass = process.env.ADMIN_DIAGNOSTIC_PASS;

      if (username === secureUser && password === securePass) {
        return NextResponse.next();
      }
    } catch (e) {
      console.error("❌ Middleware credentials parsing failed:", e);
    }
  }

  // Trigger browser's native login prompt modal on credential miss
  return new NextResponse('Authentication Required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Diagnostic Portal"',
    },
  });
}

// 3. Optimized Matcher Matrix
// Keeps public pages open while locking admin tools completely down
export const config = {
  matcher: [
    '/test-get-full-name',
    '/test-get-last-entries',
    '/members',
  ],
};
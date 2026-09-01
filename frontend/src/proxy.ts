// frontend/src/proxy.ts

import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (authorization) {
    const [scheme, encodedCredentials] = authorization.split(" ");

    if (scheme === "Basic" && encodedCredentials) {
      const decodedCredentials = Buffer.from(
        encodedCredentials,
        "base64"
      ).toString("utf8");

      const separatorPosition = decodedCredentials.indexOf(":");

      if (separatorPosition !== -1) {
        const username = decodedCredentials.slice(0, separatorPosition);
        const password = decodedCredentials.slice(separatorPosition + 1);

        if (
          username === process.env.PROTECTED_PAGE_USERNAME &&
          password === process.env.PROTECTED_PAGE_PASSWORD
        ) {
          return NextResponse.next();
        }
      }
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="CARC Administration"',
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  matcher: [
    "/test-get-full-name/:path*",
    "/testGetLastEntries/:path*",
    "/members/:path*",
  ],
};
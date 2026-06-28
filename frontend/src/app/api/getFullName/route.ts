// frontend/src/app/api/getFullName/route.ts
export const dynamic = "force-dynamic"; // Ensure this route is always dynamic and not statically optimized
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Safely read whatever raw JSON body arrived from the test page
    const body = await request.json().catch(() => null);
    
    // Log the event directly to the Next.js console panel
    console.log("🌐 Next.js Proxy Route triggered. Payload content:", body);

    if (!body) {
      return NextResponse.json({ error: "Empty or invalid JSON body sent" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    // 2. Direct, raw forwarding passthrough loop to core Express backend
    const response = await fetch(`${backendUrl}/api/getFullName`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    // 3. Extract payload response from port 5000
    const data = await response.json().catch(() => ({}));

    // Pass the identical execution status code directly back down to page.js
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error("❌ Next.js Proxy Route execution exploded:", error.message);
    return NextResponse.json(
      { error: "Internal Proxy Forwarding Error", details: error.message }, 
      { status: 500 }
    );
  }
}

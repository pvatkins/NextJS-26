// frontend/src/app/api/getFullName/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // ✅ FIX: Validate either format so both single lookups and batches pass through
    if (!body.callsign && (!body.callsigns || !Array.isArray(body.callsigns))) {
      return NextResponse.json(
        { error: "A valid 'callsign' string or 'callsigns' array is required" }, 
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    // Forward the complete payload seamlessly to your Express backend
    const response = await fetch(`${backendUrl}/api/getFullName`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Express backend batch query failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ Next.js Proxy Route Crashed:", error.message);
    return NextResponse.json(
      { error: "Internal Proxy Error", details: error.message }, 
      { status: 500 }
    );
  }
}

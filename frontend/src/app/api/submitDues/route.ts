//frontend/src/app/api/submitDues/route.ts
export const dynamic = "force-dynamic"; // Ensure this route is always dynamic and not statically optimized
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Proxy dues data payload directly to backend Express server
    //was const backendResponse = await fetch("http://localhost:5000/api/submitDues", {
    const backendResponse = await fetch("http://127.0.0.1:5000/api/submitDues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Failed to submit dues to backend" },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

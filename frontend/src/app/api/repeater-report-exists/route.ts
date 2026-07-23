// frontend/src/app/api/repeater-report-exists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callsign = searchParams.get('callsign')?.trim().toUpperCase();
    const dateStr = searchParams.get('date'); // Target audit date (YYYY-MM-DD)

    if (!callsign) {
      return NextResponse.json({ error: "Missing required 'callsign' tracking parameter" }, { status: 400 });
    }

    console.log(`[Compliance API] Verifying FCC recorded broadcast log presence for: ${callsign} on Date: ${dateStr || 'Latest'}`);

    // Adjust table/column names if your compliance audio catalog uses a specific logging layout
    let queryStr = "SELECT myindex FROM pp_tnx WHERE callsigns = ?";
    const queryParams: any[] = [callsign];

    if (dateStr) {
      queryStr += " AND DATE(mydate) = DATE(?)";
      queryParams.push(dateStr);
    }

    queryStr += " ORDER BY myindex DESC LIMIT 1";

    const [rows] = await pool.query<mysql.RowDataPacket[]>(queryStr, queryParams);
    const exists = rows.length > 0;

    console.log(`[Compliance API] Verification for ${callsign}: ${exists ? '✅ COMPLIANT LOG RECORDED' : '❌ NO COMPLIANCE RECORD FOUND'}`);

    return NextResponse.json({ 
      success: true, 
      exists,
      message: exists ? "Broadcast compliance recording verified." : "Missing required broadcast audio documentation."
    }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Critical Failure inside Next.js broadcast compliance check:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

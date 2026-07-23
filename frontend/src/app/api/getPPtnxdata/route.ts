// frontend/src/app/api/getPPtnxdata/route.ts
import mysql from 'mysql2/promise';
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log("[Serverless API] Fetching last 10 historical transaction logs from pp_tnx...");

    // 1. Fetch the 10 most recent records from the transaction ledger
    // ✅ Notice we select 'donation' instead of the dropped repeater fields
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      `SELECT 
        myindex, 
        mydate, 
        years, 
        callsigns,
        primary_,
        family,
        donation,
        subtotal,
        paypalfee,
        clubreceives,
        total,
        FullName,
        pay_paypal,
        transaction_status, 
        pp_orderID,
        pp_id,
        pp_total,
        pp_orderID
       FROM pp_tnx
       ORDER BY myindex DESC 
       LIMIT 10`
    );

    console.log(`✅ Successfully retrieved ${rows.length} transaction entries.`);

    // 2. Return the data payload back using the standard Next.js NextResponse object
    return NextResponse.json({ success: true, entries: rows }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Critical Failure inside Next.js /api/getLastEntries route:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

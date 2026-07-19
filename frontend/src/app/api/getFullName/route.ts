// frontend/src/app/api/getFullName/route.ts
import mysql from 'mysql2/promise';
import { NextRequest, NextResponse } from 'next/server';

// Explicit interface matching the incoming body expectation
interface LookupRequestBody {
  callsigns?: string[];
}

export async function POST(request: NextRequest) {
  let callsignsLog = "UNKNOWN";
  try {
    const body = (await request.json()) as LookupRequestBody;
    const { callsigns } = body;

    if (!callsigns || !Array.isArray(callsigns) || callsigns.length === 0) {
      return NextResponse.json({ error: "Invalid payload. 'callsigns' must be a non-empty array." }, { status: 400 });
    }

    callsignsLog = callsigns.join(', ');
    console.log(`[Serverless API] Executing batch name lookup for: ${callsignsLog}`);

    // 1. FIXED: Initialize the pool INSIDE the active request method thread. This guarantees Next.js has fully resolved and loaded your frontend/.env.local variables!
    
    const pool = mysql.createPool({
      host: process.env.MYSQL_SERVER || 'localhost',
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || 'carcmbrlst_20231017',
      port: Number(process.env.MYSQL_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 3,
      queueLimit: 0
    });

    console.log('Pool created successfully. Proceding to Sanity check and batch lookup...');

    // Sanity check
    const [test_rows] = await pool.query(
      "SELECT CALLSIGN, FULLNAME FROM merged WHERE CALLSIGN = 'AI6BB'"
    );
    console.log(test_rows);

    // 2. Clean and normalize your list of callsigns to uppercase text parameters
    const cleanCallsigns = callsigns.map((c: string) => c.trim().toUpperCase());

    // 3. Generate a dynamic list of question marks matching the number of array elements
    const placeholders = cleanCallsigns.map(() => "?").join(", ");
    console.log(`[Serverless API] Executing optimized batch lookup against Amazon RDS for ${cleanCallsigns.length} users.`);

    // 4. Inject the placeholders string and pass the flat data array cleanly
    const sqlQuery = `SELECT Callsign, FullName FROM merged WHERE Callsign IN (${placeholders})`;
    const [rows] = await pool.query<mysql.RowDataPacket[]>(sqlQuery, cleanCallsigns);

    // Build the clean key-value dictionary mapping
    const resultsMap: Record<string, string> = {};

    // Seed map with UNKNOWN fallbacks
    callsigns.forEach(call => {
      resultsMap[call.toUpperCase()] = "UNKNOWN";
    });

    // Overwrite with actual hits from the database rows
    rows.forEach(row => {
      if (row.Callsign && row.FullName) {
        resultsMap[row.Callsign.toUpperCase()] = row.FullName.trim();
      }
    });

    // 5. Cleanly close the temporary serverless connection pool reference
    await pool.end();

    console.log("✅ Batch lookup completed successfully. Returning matrix mapping data.");
    return NextResponse.json({ results: resultsMap }, { status: 200 });

  } catch (error: any) {
    console.error(`❌ Critical Failure inside Next.js /api/getFullName route for ${callsignsLog}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


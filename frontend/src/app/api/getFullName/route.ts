// frontend/src/app/api/getFullName/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Initialize the serverless-optimized database connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_SERVER || 'localhost',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'carcmbrlst_20231017',
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0
});

// Explicit interface matching the incoming body expectation
interface LookupRequestBody {
  callsigns?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LookupRequestBody;
    const { callsigns } = body;

    if (!callsigns || !Array.isArray(callsigns) || callsigns.length === 0) {
      return NextResponse.json({ error: "Invalid payload. 'callsigns' must be a non-empty array." }, { status: 400 });
    }

    console.log(`[Serverless API] Executing batch name lookup for: ${callsigns.join(', ')}`);

    // Fire exactly ONE optimized SQL IN() query to fetch all relevant records
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      "SELECT Callsign, FullName FROM merged WHERE Callsign IN (?)",
      [callsigns]
    );

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

    console.log("✅ Batch lookup completed successfully. Returning matrix mapping data.");
    return NextResponse.json({ results: resultsMap }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Critical Failure inside Next.js /api/getFullName route:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

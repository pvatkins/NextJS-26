// frontend/src/app/api/submitDues/route.ts
import mysql from 'mysql2/promise';
import { NextRequest, NextResponse } from 'next/server';

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

// Helper function to safely format money fields as strings (matching your legacy layout)
// Using the Unicode escape sequence for a non-breaking space
function fmtMoneyStr(val: any): string {
  if (val === undefined || val === null || val === '') return "$\u00A00.00";
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return "$\u00A00.00";
  return `$\u00A0${num.toFixed(2)}`; 
}

interface DuesRequestBody {
  callsign?: string;
  total?: number | string;
  years?: number | string;
  newmember?: boolean;
  callsigns?: string;
  primary?: number | string;
  family?: number | string;
  repeater?: number | string;      // Sent by legacy front-end fields
  digipeater?: number | string;    // Sent by legacy front-end fields
  donation?: number | string;      // Raw donation value if present
  subtotal?: number | string;
  paypalfee?: number | string;
  clubreceives?: number | string;
  pp_total?: number;
  date?: string;
  transaction_status?: 'pending' | 'posted' | 'cancelled';
}

export async function POST(request: NextRequest) {
  try {
    const formData = (await request.json()) as DuesRequestBody;

    if (!formData.callsign || !formData.total) {
      return NextResponse.json({ error: "Missing required form data" }, { status: 400 });
    }

    // Generate our persistent system tracking token
    const new_pp_id = `PP_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    let resolvedFullName = "UNKNOWN MEMBER";
    const cleanCallsign = formData.callsign.trim().toUpperCase();

    // 1. Instantly look up the member's resolved name
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      "SELECT FullName FROM merged WHERE callsign = ?",
      [cleanCallsign]
    );
    // 2. Safely extract index 0 of the matching dataset array rows
    if (rows && rows.length > 0 && rows[0].FullName) {
      resolvedFullName = rows[0].FullName.trim();
      console.log(`[Dues API] Successfully resolved callsign ${cleanCallsign} to: ${resolvedFullName}`);
    } else {
      console.warn(`[Dues API] Callsign ${cleanCallsign} not found in database registry. Defaulting to fallback name.`);
    }

    // 2. Handle DB Migration Schema updates: Combine old properties into your new donation field
    const rawRepeater = typeof formData.repeater === 'number' ? formData.repeater : parseFloat(formData.repeater || '0');
    const rawDigi = typeof formData.digipeater === 'number' ? formData.digipeater : parseFloat(formData.digipeater || '0');
    const rawDonation = typeof formData.donation === 'number' ? formData.donation : parseFloat(formData.donation || '0');

    // Sum everything up cleanly to match the database schema adjustment you made earlier
    const totalDonationValue = rawRepeater + rawDigi + rawDonation;

    // 3. Construct your clean SQL insertion template
    // ✅ Notice we explicitly removed 'repeater' and 'digipeater' columns from the schema query
    // And then put them back in.
    const repeaterValue = fmtMoneyStr(0);
    const digipeaterValue = fmtMoneyStr(0);

    const insertSql = `
      INSERT INTO pp_tnx (
        years,
        \`new\`,
        callsigns,
        FullName,
        primary_,
        family,
        repeater,
        digipeater,
        donation,
        subtotal,
        paypalfee,
        clubreceives,
        total,
        pp_total,
        mydate,
        transaction_status,
        pp_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      formData.years ?? 0,
      formData.newmember ?? false,
      formData.callsigns ?? "",
      resolvedFullName,
      fmtMoneyStr(formData.primary),
      fmtMoneyStr(formData.family),
      repeaterValue,  // Added back in for schema compliance
      digipeaterValue,  // Added back in for schema compliance
      fmtMoneyStr(totalDonationValue), // Saved into the newly configured single column
      fmtMoneyStr(formData.subtotal),
      fmtMoneyStr(formData.paypalfee),
      fmtMoneyStr(formData.clubreceives),
      fmtMoneyStr(formData.total),
      formData.pp_total ?? 0,
      formData.date ?? new Date().toISOString().slice(0, 19).replace('T', ' '),
      formData.transaction_status ?? "pending",
      new_pp_id,
    ];

    // Execute database insert natively inside the Next.js API layer
    await pool.query(insertSql, insertValues);
    console.log(`[Serverless API] Ledger saved natively. Resolved Name for Token: ${resolvedFullName}`);

    return NextResponse.json({ success: true, transactionId: new_pp_id }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Serverless Database error in /api/submitDues:", error);
    return NextResponse.json({ error: "Failed to initialize dues tracking record: " + error.message }, { status: 500 });
  }
}

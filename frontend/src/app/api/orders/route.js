// frontend/src/app/api/orders/route.js
import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

// 1. Initialize a serverless-optimized database connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_SERVER || 'localhost',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'carcmbrlst_20231017',
  waitForConnections: true,
  connectionLimit: 3, // Low connection limit prevents serverless function exhaustion
  queueLimit: 0
});

// 2. Core token generator rewritten inside the serverless layer
async function generateAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  
  // ✅ FIXED: Using the accurate sandbox endpoint path string
  const baseUrl = process.env.PAYPAL_BASE_URL?.trim() || "https://api-m.sandbox.paypal.com";

  if (!clientId || !clientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET keys");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${auth}`,
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`PayPal Authentication Failure: ${errorMsg}`);
  }

  const data = await response.json();
  return data.access_token;
}

// 3. Named POST handler matching standard Next.js App Router conventions
export async function POST(request) {
  let trackingToken = "UNKNOWN";
  
  try {
    // Read the incoming JSON body payload out of the standard web Request object
    const body = await request.json();
    trackingToken = body.trackingToken;

    console.log(`[Serverless API] Creating PayPal Order for tracking token: ${trackingToken}`);

    // Execute database rows check using the pooled connection
    const [rows] = await pool.query("SELECT pp_total FROM pp_tnx WHERE pp_id = ?", [trackingToken]);
    
    if (!rows || rows.length === 0) {
      console.error(`❌ Tracking token '${trackingToken}' not found in database ledger.`);
      return NextResponse.json({ error: "Tracking token pending or not found." }, { status: 404 });
    }

    // ✅ FIXED: Unified destination string variable paths
    const baseUrl = process.env.PAYPAL_BASE_URL?.trim() || "https://api-m.sandbox.paypal.com";

    // Calculate and log the price verification data
    const verifiedPrice = parseFloat(rows[0].pp_total).toFixed(2);
    console.log(`✅ Verified price for tracking token ${trackingToken}: $${verifiedPrice}`);

    // Obtain dynamic PayPal access token credentials
    const accessToken = await generateAccessToken();
    console.log(`[Serverless API] Sending Order Creation Request to PayPal...`);

    // FIRST: Execute the actual network fetch call to populate the 'response' variable
    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: trackingToken,
          amount: {
            currency_code: "USD",
            value: verifiedPrice
          }
        }]
      })
    });

    // SECOND: Now you can safely inspect and log the rawText payload response
    const rawText = await response.text();
    
    if (!rawText || rawText.trim().length === 0) {
      throw new Error(`PayPal Server returned an empty response string with status: ${response.status}`);
    }
    
    console.log(`Raw response from PayPal: ${rawText}`);

    // If everything looks good, parse the JSON data matrix
    if (!response.ok) {
      throw new Error(`PayPal Order API Rejection: ${rawText}`);
    }
    
    const orderData = JSON.parse(rawText);

    // Update the database record tracker row
    await pool.query(
      "UPDATE pp_tnx SET pp_orderID = ? WHERE pp_id = ?",
      [orderData.id, trackingToken]
    );

    return NextResponse.json({ id: orderData.id }, { status: 200 });

  } catch (error) {
    console.error(`❌ Error creating PayPal order for tracking token ${trackingToken}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

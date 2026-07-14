// frontend/src/app/api/orders/[orderID]/capture/route.js
import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

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

// Helper function to generate an access token from PayPal Sandbox
async function generateAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
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

// Named POST handler to process the transaction capture step
export async function POST(request, { params }) {
  try {
    // Await params to safely extract the dynamic orderID variable out of the URL path
    const resolvedParams = await params;
    const { orderID } = resolvedParams;

    console.log(`[Serverless API] Capturing PayPal Order ID: ${orderID}`);

    // Obtain dynamic PayPal handshake credentials
    const accessToken = await generateAccessToken();
    const baseUrl = process.env.PAYPAL_BASE_URL?.trim() || "https://api-m.sandbox.paypal.com";

    // Execute network fetch handshake to PayPal's capture endpoint
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      }
    });

    const rawText = await response.text();
    if (!rawText || rawText.trim().length === 0) {
      throw new Error(`PayPal Server returned an empty response string with status: ${response.status}`);
    }

    const data = JSON.parse(rawText);
    console.log(`PayPal order status for order ${orderID}: ${data.status}`);

    if (!response.ok) {
      console.error("❌ PayPal Capture API Rejection Payload:", data);
      return NextResponse.json(data, { status: response.status });
    }

    // Verify that the capture was successful
    const purchaseUnit = data.purchase_units?.[0];

    const captureStatus = purchaseUnit?.payments?.captures?.[0]?.status;
    const purchaseStatus = data.status;

    console.log(`Current purchase status for order ${orderID}: ${purchaseStatus}`);
    console.log(`Current capture status for order ${orderID}: ${captureStatus}`);

if (purchaseStatus === "COMPLETED") {
  console.log(`✅ PayPal Order ${orderID} completed successfully! Updating pp_tnx table...`);

  // ✅ FIXED: Changed status from 'completed' to 'posted' to match your MySQL database constraints!
  await pool.query(
    "UPDATE pp_tnx SET transaction_status = 'posted', pp_response = ? WHERE pp_orderID = ?",
    [JSON.stringify(data), orderID]
  );
  
  console.log(`🔄 Updated pp_tnx table: transaction_status set to 'posted' for order ${orderID}`);
} else {
  console.warn(`⚠️ Capture completed but payment status is: ${captureStatus}`);
}


    // Return standard Next.js Response object
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("❌ Critical Failure inside Next.js /api/orders/capture route:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


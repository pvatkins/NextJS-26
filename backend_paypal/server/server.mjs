// backend_paypal/server/server.mjs
import express from "express";

// import https from "https"; for AWS
import http from "http"; // For local development 

import cors from 'cors'; // Import cors
import "dotenv/config";
import fs from "fs";
import mysql from "mysql2/promise"; // Use mysql2/promise for async/await
import fetch from "node-fetch"; // Make sure node-fetch is installed if on Node < 18 or not using fetch globally
import os from "os";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// ──> ADD THESE GLOBAL TOKEN CACHE VARIABLES AT THE VERY TOP OF YOUR FILE:
let cachedToken = null;
let tokenExpiryTime = 0;
let activeTokenPromise = null; // Prevents overlapping concurrent authorization requests

const lines = [
  `----------------------------------------------`,
  ` Environment Diagnostics for PayPal debugging:`,
  `----------------------------------------------`,
  `Current Working Directory  : ${process.cwd()}`,
  `Node.js version            : ${process.version}`,
  `Platform                   : ${process.platform} | Arch: ${process.arch}`,
  `Hostname                   : ${os.hostname()}`,
  `Env file path              : ${path.resolve('.env')}`,
  `MYSQL_SERVER               : ${process.env.MY_SQL_SERVER}`,
  `MYSQL_USER                 : ${process.env.MY_SQL_USER}`,
  `PAYPAL_PORT                : ${process.env.PAYPAL_PORT || '5556 (default)'}`,
  `ENVIRONMENT                : ${process.env.ENVIRONMENT}`,
  `CLIENT_ID                  : ${process.env.PAYPAL_CLIENT_ID ? '[SET]' : '[NOT SET]'}`,
  `PAYPAL_BASE_URL            : ${process.env.PAYPAL_BASE_URL || '[NOT SET, using default sandbox URL]'}`,
  `----------------------------------------------`,
];

// 1. Ensure you extract the current file system paths securely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔍 Express Views Path explicitly set to:", path.join(__dirname, "../views"));

// --- Setup daily rotating log file ---
const logDir = path.resolve(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const today = new Date().toISOString().split("T")[0];
const logFile = path.join(logDir, `env-check-${today}.log`);

function logMessage(message) {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, formatted);
  console.log(message);
}

// Example usage
logMessage("💳 PayPal backend starting up...");
logMessage(`✅ ENVIRONMENT = ${process.env.ENVIRONMENT ?? "<undefined>"}`);
logMessage(`✅ MY_SQL_SERVER = ${process.env.MY_SQL_SERVER ?? "<undefined>"}`);
logMessage(`✅ PAYPAL_PORT = ${process.env.PAYPAL_PORT ?? "<undefined>"}`);
logMessage(lines)


// Ensure this path is correct relative to where server.js is executed
const certOptions = {
  key: fs.readFileSync(process.env.KEY_PATH),
  cert: fs.readFileSync(process.env.CERT_PATH)
};

const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  ENVIRONMENT,
  PAYPAL_PORT = 5556,
  MY_SQL_SERVER,
  MY_SQL_USER,
  MY_SQL_PWD,
  MY_SQL_DB,
  MY_SQL_PORT = 3306,
  SUCCESS_URL = process.env.SUCCESS_URL || 'http://localhost:3000/paypal-success', // Adjust for production
  CANCEL_URL = process.env.CANCEL_URL || 'http://localhost:3000/paypal-cancel',  // Adjust for production

  // These are used in the make_payment page
} = process.env;

const environment = ENVIRONMENT || 'sandbox';
const base = environment === 'development' ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
const app = express();
console.log(`💳 PayPal backend initialized in ${environment} mode. Base URL: ${base}`);

// --- Middleware ---
// Enable CORS for frontend requests (adjust origin for production)
app.use(cors({
  origin: ['http://localhost:3000', 'https://coastsidearc.org'], // Allow your Next.js frontend
  methods: ['GET', 'POST'],
  credentials: true // If you're sending cookies/auth headers
}));

// parse JSON request bodies (replaces body-parser.json())
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'client' directory (if 'checkout.html' is here)
app.use(express.static(path.join(__dirname, '../public'))); // Use path.join for robustness

// --- Custom Template Engine (for index.html rendering) ---
app.engine('sjf.html', (filePath, options, callback) => {
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(err);
    const rendered = content.toString()
      .replace(/_\|title\|_/g, options.title || '')
      .replace(/_\|message\|_/g, options.message || '')
      .replace(/_\|pp_id\|_/g, options.pp_id || '')
      .replace(/_\|succ_url\|_/g, options.succ_url || '')
      .replace(/_\|canc_url\|_/g, options.canc_url || '')
      .replace(/_\|client_id\|_/g, options.client_id || '')
      .replace(/_\|P6\|_/g, options.P6 || '')
      .replace(/_\|P1\|_/g, options.P1 || '')
      .replace(/_\|P2\|_/g, options.P2 || '')
      .replace(/_\|P3\|_/g, options.P3 || '')
      .replace(/_\|P4\|_/g, options.P4 || '')
      .replace(/_\|P5\|_/g, options.P5 || '')
      .replace(/_\|P7\|_/g, options.P7 || '');
    return callback(null, rendered);
  });
});

// 2. Set the view engine to EJS
app.set("view engine", "ejs");
// 3. FORCE EXPRESS TO LOOK INSIDE THE CORRECT FOLDER BY USING AN ABSOLUTE PATH
// path.join(__dirname, "../views") maps directly to backend_paypal/views
app.set("views", path.join(__dirname, "../views"));

// --- MySQL Connection Pool (using mysql2/promise) ---
const pool = mysql.createPool({
  host: process.env.MY_SQL_SERVER || 'localhost',
  user: process.env.MY_SQL_USER || 'Paul_A',
  port: parseInt(process.env.MY_SQL_PORT, 10), // Ensure port is a number
  password: process.env.MY_SQL_PASSWORD,
  database: process.env.MY_SQL_DATABASE || 'carcmbrlst_20231017',
  waitForConnections: true,
  connectionLimit: 10,
});

// Helper function to generate an access token from PayPal Sandbox
async function generateAccessToken() {
  console.log("Keys loaded:", !!process.env.PAYPAL_CLIENT_ID, !!process.env.PAYPAL_CLIENT_SECRET);
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch access token: ${errorText}`);
  }

  const data = await response.json();
  
  // ✅ Make sure you assign the variable properly from PayPal's response (access_token)
  const accessToken = data.access_token; 
  return accessToken;
}

/*
  try {
    const token = await activeTokenPromise;
    return token;
  } finally {
    // Clear out the temporary lock loop so future lookups can execute cleanly
    activeTokenPromise = null;
  }
}
*/

// --- Database Helper Functions (Parameterized Queries!) ---
const SelectPaypalTnx = async (pp_id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM pp_tnx WHERE pp_id = ?`, // Use '?' for parameter
      [pp_id] // Pass parameter as an array
    );
    return rows;
  } catch (error) {
    console.error("Error in SelectPaypalTnx:", error);
    throw error;
  }
};

const UpdatePaypalTnx = async (pp_id, orderID, jResp) => {
  try {
    const pp_response_json = JSON.stringify({ 'orderID': jResp['id'], 'purchase_units': jResp['purchase_units'] });
    const [result] = await pool.execute(
      `UPDATE pp_tnx SET transaction_status = ?, pp_orderID = ?, pp_response = ? WHERE pp_id = ?`,
      ['posted', orderID, pp_response_json, pp_id]
    );
    return result;
  } catch (error) {
    console.error("Error in UpdatePaypalTnx:", error);
    throw error;
  }
};

// --- NEW API ROUTE: For Full Name Lookup ---
app.post('/api/getFullName', async (req, res) => {
  const { callsign } = req.body;
  if (!callsign) {
    return res.status(400).json({ error: 'Callsign is required' });
  }
  try {
    const [rows] = await pool.execute(
      'SELECT FullName FROM merged WHERE callsign = ? LIMIT 1',
      [callsign]
    );
    if (rows.length > 0) {
      res.status(200).json({ result: { FullName: rows[0].FullName } });
    } else {
      res.status(200).json({ result: null });
    }
  } catch (error) {
    console.error("Error in /api/getFullName:", error);
    res.status(500).json({ error: 'Failed to retrieve FullName' });
  }
});

// --- NEW API ROUTE: For Initial Dues Transaction Insertion ---
app.post('/api/submitDues', async (req, res) => {
  const formData = req.body;
  // Generate a unique PayPal ID for your internal record
  const new_pp_id = `PP_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  formData.pp_id = new_pp_id; // Add to formData to be inserted

  try {
    // Extract necessary fields from formData for insertion into pp_tnx
    const {
      years, newmember, callsigns, ncallsigns, callsign, 
      fullname,
      primary, family, donation, 
      subtotal, pay_paypal, paypalfee, clubreceives, 
      total, 
      pp_total, date, transaction_status, pp_id
    } = formData;

     const [result] = await pool.execute(
      `INSERT INTO pp_tnx (years, new, callsigns, FullName, primary,family, donation, subtotal, pay_paypal, paypal_fee,cub_receives, total_charges, pp_total,transaction_date, transaction_status, pp_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        years, newmember, callsigns, fullname || 'N/A', // Default if fullname is null
        primary, family, donation, subtotal, pay_paypal,
        paypalfee, clubreceives, total, pp_total, date, transaction_status, pp_id]
    );

/*     const [result] = await pool.execute(
      `INSERT INTO pp_tnx (
                years, newmember, callsigns, ncallsigns, callsign, fullname,
                primary_dues, family_dues, donation,
                subtotal, pay_paypal, paypal_fee, club_receives, total_charges,
                pp_total, transaction_date, transaction_status, pp_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        years, newmember, callsigns, ncallsigns, callsign, fullname || 'N/A', // Default if fullname is null
        primary, family, donation, subtotal, pay_paypal,
        paypalfee, clubreceives, total, pp_total, date, transaction_status, pp_id
      ]
    ); */
    res.status(200).json({ message: 'Data inserted successfully', new_pp_id });
  } catch (error) {
    console.error("Error in /api/submitDues:", error);
    res.status(500).json({ error: 'Failed to insert data into pp_tnx' });
  }
});

// --- Route: Create Order ---
app.post("/api/orders", async (req, res) => {
  try {
    const { trackingToken } = req.body;
    console.log(`282 Creating PayPal Order for local tracking token: ${trackingToken}`);

    // 1. Verify rows exist before proceeding
    const [rows] = await pool.query("SELECT pp_total FROM pp_tnx WHERE pp_id = ?", [trackingToken]);

    if (!rows || rows.length === 0) {
      console.error(`284 ❌ Tracking token '${trackingToken}' not found in database ledger yet.`);
      return res.status(404).json({ error: "Tracking token pending or not found." });
    }

    const verifiedPrice = parseFloat(rows[0].pp_total).toFixed(2);
    const accessToken = await generateAccessToken();
    // Fixed base URL to use the correct PayPal API endpoint for order creation (sandbox or live based on environment)
    // const baseUrl = process.env.PAYPAL_BASE_URL || "https://paypal.com";
    const baseUrl = process.env.PAYPAL_BASE_URL || (environment === 'development' ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com");

    console.log(`294 ✅ Verified price for PayPal order creation: $${verifiedPrice}`);
    console.log(`295 🔐 Access token ${accessToken} successfully generated for PayPal API handshake.`);
    console.log(`296 Base URL: ${baseUrl}`);

    // 2. Execute network fetch handshake
    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: trackingToken,
          amount: { currency_code: "USD", value: verifiedPrice }
        }]
      })
    });

    // Intercept raw text to prevent "Unexpected end of JSON input" crash
    const rawText = await response.text();

    if (!rawText || rawText.trim().length === 0) {
      throw new Error(`PayPal Server returned an empty response string with HTTP Status: ${response.status}`);
    }

    // Now it is 100% safe to parse as JSON object data
    const data = JSON.parse(rawText);
    console.log("323 📦 PayPal API Response received for order creation:", data);

    if (!response.ok) {
      console.error("326 ❌ PayPal API Rejection Payload:", data);
      return res.status(response.status).json(data);
    }

    const payPalOrderId = data.id;
    console.log(`331 ✅ PayPal Order Token successfully created: ${payPalOrderId}`);

    // Update your tracking row state immediately
    await pool.query("UPDATE pp_tnx SET pp_orderID = ? WHERE pp_id = ?", [payPalOrderId, trackingToken]);
    console.log(`🔄 Updated pp_tnx table: pp_orderID set for tracking token ${trackingToken}`);

    return res.status(200).json(data);

  } catch (error) {
    console.error("340 ❌ Critical Failure inside /api/orders route:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// --- Route: Capture Payment ---
app.post("/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    console.log(`349 📥 Request to capture PayPal order received. Order ID: ${orderID}`);
  

    // 1. Generate secure token authorization credentials
    const accessToken = await generateAccessToken();
    const baseUrl = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

    // 2. Call PayPal's API directly to execute the funds capture
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ PayPal Capture Rejection Payload:", data);
      return res.status(response.status).json(data);
    }

    console.log(`💰 PayPal Capture Successful! Status: ${data.status}`);

    // 3. IF THE TRANSACTION WAS COMPLETED: Synchronize your main database!
    if (data.status === "COMPLETED") {
      console.log("🔄 Synchronizing payment record status inside main backend database...");

      // Update your MySQL tracking entry status from 'pending' to 'posted'
      // By using the reference_id passed during creation, or matching tokens
      const referenceId = data.purchase_units?.[0]?.reference_id;

      if (referenceId) {
        await pool.query(
          "UPDATE pp_tnx SET transaction_status = 'posted' WHERE pp_id = ?",
          [referenceId]
        );
        console.log(`✅ Table updated! Record ${referenceId} is now officially marked as 'posted'.`);
      }
    }

    // Return the successful payload back to the frontend checkout.ejs
    return res.status(200).json(data);

  } catch (error) {
    console.error("❌ Critical Failure inside capture route:", error.message);
    return res.status(500).json({ error: "Internal Server Error during capture execution" });
  }
});


// --- Routes for Payment Flow from Frontend ---
app.get('/make_payment/:pp_id_arg', async (req, res) => {
  const pp_id_arg = req.params.pp_id_arg;

  console.log("👉 Dynamic injection handshake passing Client ID:", pp_id_arg);
  res.render("checkout",
    { clientId: process.env.PAYPAL_CLIENT_ID });
});

const server = http.createServer(app);
server.listen(5556, () => {
  console.log("PayPal backend running locally on http://localhost:5556");
})

// end of file
// backend/src/server.ts

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import mysql from "mysql2/promise";
import fetch from "node-fetch";
import os from "os";
import path from "path";

// --- Setup daily rotating log file ---
const logDir = path.resolve(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const today = new Date().toISOString().split("T")[0]; // e.g. "2025-09-27"
const logFile = path.join(logDir, `env-check-${today}.log`);

function logMessage(message: string) {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, formatted);
  console.log(message);
}

dotenv.config();
const port = process.env.PORT || 5000;
// Pepre the diagnostic info for debugging
const diagnostics = [
  "\n---------------------------------------------------",
  "🔧 Environment Diagnostics for backend debugging:",
  "---------------------------------------------------",
  `Working Directory: ${process.cwd()}`,
  `Node.js version: ${process.version}`,
  `Platform: ${process.platform} | Arch: ${process.arch}`,
  `Hostname: ${os.hostname()}`,
  `env file path: ${path.resolve('.env')}`,
  `MYSQL_SERVER: ${process.env.MY_SQL_SERVER}`,
  `MYSQL_USER: ${process.env.MY_SQL_USER}`,
  `ENVIRONMENT: ${process.env.ENVIRONMENT}`,
  `PORT: ${process.env.PORT || '5000 (default)'}`,
  "-------------------------------------------------",
].join("\n");

// Also append to Logs/env_check.log
try {
  logMessage(diagnostics);
} catch (err) {
  console.error("Failed to write to log file:", err);
}

const app = express();

// --- Middleware ---
/*
This middleware reduces the possible hardcoding of allowed origins.
by use of regex-like functions such as startsWith.
*/
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-side
      if (
        origin.startsWith("http://localhost:300") ||
        origin.startsWith("http://192.168.1.222:300") ||
        origin.startsWith("http://192.168.1.216:300") ||
        origin === "https://coastsidearc.org"
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// --- Helper to enforce env vars ---
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// --- MySQL Connection Pool ---
const pool = mysql.createPool({
  connectionLimit: 10,
  host: requireEnv("MY_SQL_SERVER"),
  user: requireEnv("MY_SQL_USER"),
  port: parseInt(process.env.MY_SQL_PORT || "3306", 10),
  password: requireEnv("MY_SQL_PASSWORD"),
  database: requireEnv("MY_SQL_DATABASE"),
});

// --- API Route 1: Get FullName ---
// backend/src/server.ts (Express Main Backend)

interface MergedRow extends RowDataPacket {
  callsign: string;
  FullName: string;
}

app.post("/api/getFullName", async (req, res) => {
  const { callsign, callsigns } = req.body;

  // Normalize inputs into a single array of unique uppercase strings
  let targetCallsigns: string[] = [];
  if (Array.isArray(callsigns)) {
    targetCallsigns = [...new Set(callsigns.map((c: string) => c.trim().toUpperCase()))];
  } else if (callsign) {
    targetCallsigns = [callsign.trim().toUpperCase()];
  }

  if (targetCallsigns.length === 0) {
    return res.status(400).json({ error: "No callsigns provided" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Dynamically build placeholder variables (?, ?, ?)
    const placeholders = targetCallsigns.map(() => "?").join(", ");
    const query = `SELECT callsign, FullName FROM merged WHERE callsign IN (${placeholders})`;
    console.log(query)
    console.log(`Executing batch name lookup for: ${targetCallsigns.join(", ")}`);
    const [rows] = await connection.execute<MergedRow[]>(query, targetCallsigns);

    // Convert rows into an index-independent dictionary map: { "AB1CD": "Paul Atkins" }
    const resultsMap: Record<string, string> = {};
    rows.forEach((row) => {
      resultsMap[row.callsign.toUpperCase()] = row.FullName;
    });

    return res.status(200).json({ results: resultsMap });

  } catch (error: any) {
    console.error("❌ Database error in batch getFullName:", error.message);
    return res.status(500).json({ error: "Failed to retrieve FullNames" });
  } finally {
    if (connection) connection.release();
  }
});

// --- API Route 2: Submit Dues Data ---
// Formatting helper for monetary strings to ensure consistent database storage
function fmtMoneyStr(value: any): number {
  /**
   * Formats a raw numeric value into an exact 9-character width monetary string.
   * Example: 39.54 -> "  $ 39.54" (Two leading spaces + '$ ' + 5 characters)
   * @param {number|string} value - The input monetary value
   * @returns {string} An exactly 9-character long string
   */
  // Coerce input to float number, default to 0 if invalid
  const numericValue = parseFloat(value) || 0.00;

  // Format to standard 2 decimal spaces
  const baseString = `$\u00a0${numericValue.toFixed(2)}`;

  // Pad with leading spaces to guarantee an exact width of 9 characters
  return baseString.padStart(9, '\u00a0'); // Unicode non-breaking space for consistent width
}

//API Route 2: Submit Dues Data

app.post("/api/submitDues", async (req, res) => {
  const formData = req.body as Partial<DuesFormData>;

  if (!formData.callsign || !formData.total) {
    return res.status(400).json({ error: "Missing required form data" });
  }

  const new_pp_id = `PP_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  let connection;

  try {
    connection = await pool.getConnection();

    // ──> THE FIX: Automatically resolve the FullName from the database row index!
    let resolvedFullName = "UNKNOWN MEMBER";

    if (formData.callsign) {
      const cleanCallsign = formData.callsign.trim().toUpperCase();

      // Execute the exact query logic your test suite utilizes
      const [memberRows] = await connection.execute<any[]>(
        "SELECT FullName FROM merged WHERE callsign = ?",
        [cleanCallsign]
      );

      if (memberRows.length > 0 && memberRows[0].FullName) {
        resolvedFullName = memberRows[0].FullName;
      }
    }

    const insertSql = `
      INSERT INTO pp_tnx (
        years, \`new\`, callsigns, FullName, \`primary\`, family, repeater, digipeater, donation,
        subtotal, paypalfee, clubreceives, total, pp_total, mydate, transaction_status, pp_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
    `;

    const insertValues = [
      formData.years ?? 0,
      formData.newmember ?? false,
      formData.callsigns ?? "",

      // ✅ Now resolves to a clean name (e.g. "Paul Atkins") instead of "U N D E F I N E D"
      resolvedFullName,

      fmtMoneyStr(formData.primary) ?? "$ 0.00",
      fmtMoneyStr(formData.family) ?? "$ 0.00",
      fmtMoneyStr(formData.repeater) ?? "$ 0.00",
      fmtMoneyStr(formData.digipeater) ?? "$ 0.00",
      fmtMoneyStr(formData.donation) ?? "$ 0.00",
      fmtMoneyStr(formData.subtotal) ?? "$ 0.00",
      fmtMoneyStr(formData.paypalfee) ?? "$ 0.00",
      fmtMoneyStr(formData.clubreceives) ?? "$ 0.00",
      fmtMoneyStr(formData.total) ?? "$ 0.00",
      formData.pp_total ?? 0,
      formData.date ?? new Date().toISOString().slice(0, 19).replace('T', ' '),
      formData.transaction_status ?? "pending",
      new_pp_id
    ];

    await connection.execute(insertSql, insertValues);

    console.log(`✅ Ledger saved successfully. Resolved Name for Tracking Token: ${resolvedFullName}`);
    return res.status(200).json({ success: true, transactionId: new_pp_id });

  } catch (error: any) {
    console.error("❌ Database error in /api/submitDues:", error);
    return res.status(500).json({ error: "Failed to initialize dues tracking record" });
  } finally {
    if (connection) connection.release();
  }
});

// --- API Route 3: Check Repeater Report Existence ---
app.get("/api/repeater-report-exists", async (req, res) => {
  const { year, month } = req.query as { year?: string; month?: string };

  if (!year || !month) {
    return res
      .status(400)
      .json({ error: "Year and month are required query params" });
  }

  let monthNum = parseInt(month, 10); // ensures "07" → 7
  const reportUrl = `https://audio.stickerburr.net/files/${monthNum}_${year}/index.html`;

  try {
    // Add this right before your fetch statement to force a terminal output line
    console.log("👉 PROXY OUTBOUND PAYLOAD INTERCEPT:", JSON.stringify(body));

    const response = await fetch(reportUrl, { method: "HEAD" });

    if (response.ok) {
      res.status(200).json({ exists: true, url: reportUrl });
    } else if (response.status === 404) {
      res
        .status(200)
        .json({ exists: false, url: reportUrl, message: "File not found." });
    } else {
      res.status(500).json({
        exists: false,
        url: reportUrl,
        message: `Server error: ${response.status}`,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      exists: false,
      url: reportUrl,
      message: `Network error: ${error.message}`,
    });
  }
});

// --- API Route 4: Get pp_tnx data ---
app.get("/api/getPPtnxdata", async (req, res) => {
  const status = req.query.status as string | undefined;

  // Use an array to build the query cleanly and prevent spacing typos
  const queryParts = ["SELECT * FROM pp_tnx"];
  const params: any[] = [];

  if (status) {
    queryParts.push(" WHERE transaction_status = ?");
    params.push(status);
  }

  // Explicitly add the order by date clause
  queryParts.push(" ORDER BY mydate DESC");

  // Limit to 20 results to prevent overwhelming the frontend
  queryParts.push(" LIMIT 20");

  const finalQuery = queryParts.join(" ");
  console.log("Executing query:", finalQuery, "with params:", params);

  let connection;
  try {
    // Using pool.getConnection() matches your Route 1 pattern perfectly
    connection = await pool.getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(finalQuery, params);

    if (rows.length > 0) {
      return res.status(200).json({ results: rows });
    } else {
      // Return 200 with an empty array instead of 404 so the frontend doesn't crash
      return res.status(200).json({ results: [], message: "No data matches criteria" });
    }
  } catch (err: any) {
    // Look closely at this log in your terminal for the exact MySQL error message!
    console.error("❌ Database error in /api/getPPtnxdata:", err.message, err.sqlMessage);
    return res.status(500).json({ error: "Failed to retrieve pp_tnx data", details: err.sqlMessage });
  } finally {
    if (connection) connection.release();
  }
});





// --- DB Connection Test ---
async function testDbConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log("✅ Database connection successful!");
    return true;
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

// --- Start Server ---
async function startServer() {
  const isDbConnected = await testDbConnection();
  if (!isDbConnected) {
    console.error("Startup aborted due to DB connection failure.");
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`🚀 Backend listening on http://localhost:${port}`);
  });
}

startServer();

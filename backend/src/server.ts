// backend/src/server.ts

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import fetch from "node-fetch";
import { RowDataPacket, OkPacket } from "mysql2";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

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
interface MergedRow extends RowDataPacket {
  FullName: string;
}

app.post("/api/getFullName", async (req, res) => {
  const { callsign } = req.body;
  if (!callsign) {
    return res.status(400).json({ error: "Callsign is required" });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute<MergedRow[]>(
      "SELECT FullName FROM merged WHERE callsign = ? LIMIT 1",
      [callsign]
    );

    if (rows.length > 0) {
      res.status(200).json({ result: { FullName: rows[0].FullName } });
    } else {
      res.status(200).json({ result: null });
    }
  } catch (error) {
    console.error("Database error in /api/getFullName:", error);
    res.status(500).json({ error: "Failed to retrieve FullName" });
  } finally {
    if (connection) connection.release();
  }
});



// --- API Route 2: Submit Dues Data ---
interface DuesFormData {
  years: number;
  newmember: boolean;
  callsigns: string;
  ncallsigns: number;
  callsign: string;
  fullname?: string;
  primary: number;
  family: number;
  repeater: number;
  digipeater: number;
  subtotal: number;
  pay_paypal: number;
  paypalfee: number;
  clubreceives: number;
  total: number;
  pp_total: number;
  date: string;
  transaction_status: string;
}

app.post("/api/submitDues", async (req, res) => {
  const formData = req.body as Partial<DuesFormData>;

  // Basic validation
  if (!formData.callsign || !formData.total) {
    return res.status(400).json({ error: "Missing required form data" });
  }

  const new_pp_id = `PP_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;

  let connection;
  try {
    connection = await pool.getConnection();

    const insertSql = `
      INSERT INTO pp_tnx (
        years, newmember, callsigns, ncallsigns, callsign, fullname,
        primary_dues, family_dues, repeater_donation, digipeater_donation,
        subtotal, pay_paypal, paypal_fee, club_receives, total_charges,
        pp_total_for_paypal, transaction_date, transaction_status, pp_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      formData.years ?? 0,
      formData.newmember ?? false,
      formData.callsigns ?? "",
      formData.ncallsigns ?? 0,
      formData.callsign,
      formData.fullname ?? "N/A",
      formData.primary ?? 0,
      formData.family ?? 0,
      formData.repeater ?? 0,
      formData.digipeater ?? 0,
      formData.subtotal ?? 0,
      formData.pay_paypal ?? 0,
      formData.paypalfee ?? 0,
      formData.clubreceives ?? 0,
      formData.total ?? 0,
      formData.pp_total ?? 0,
      formData.date ?? new Date().toISOString(),
      formData.transaction_status ?? "pending",
      new_pp_id,
    ];

    const [result] = await connection.execute<OkPacket>(
      insertSql,
      insertValues
    );

    res.status(200).json({
      message: "Data inserted successfully",
      new_pp_id,
      insertId: result.insertId,
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Database error in /api/submitDues:", error);
    res.status(500).json({ error: "Failed to insert data" });
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

// --- API Route 4: Getpp_tnx data ---
/*
We can either get all data, or filter by transaction_status
by providing a ?status=posted (or pending, etc) query param.
*/
app.get("/api/getPPtnxdata", async (req, res) => {
  const status = req.query.status as string | undefined;
  let query = "SELECT * FROM pp_tnx";
  const params: any[] = [];

  if (status) {
    query += " WHERE transaction_status = ?";
    params.push(status);
  }

  query += " ORDER BY pp_id DESC";

  try {
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    if (rows.length > 0) {
      res.status(200).json({ results: rows });
    } else {
      res.status(404).json({ error: "No data found" });
    }
  } catch (err) {
    console.error("Database error in /api/getPPtnxdata:", err);
    res.status(500).json({ error: "Failed to retrieve pp_tnx data" });
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

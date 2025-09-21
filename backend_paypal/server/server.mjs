// backend_paypal/server/server.mjs
import express from "express";
import https from "https";
import fs from "fs";
import mysql from "mysql2/promise"; // Use mysql2/promise for async/await
import fetch from "node-fetch"; // Make sure node-fetch is installed if on Node < 18 or not using fetch globally
import "dotenv/config";
import path from "path";
// import bodyParser from 'body-parser'; // No longer needed if using express.json()
import cors from 'cors'; // Import cors
// some new imports for the updated server
import { fileURLToPath } from 'url';
import {dirname} from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure this path is correct relative to where server.js is executed
const certOptions = {
    key: fs.readFileSync(process.env.KEY_PATH),
    cert: fs.readFileSync(process.env.CERT_PATH)
};

const {
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
    ENVIRONMENT,
    PORT = 5556,
    MY_SQL_SERVER,
    MY_SQL_USER,
    MY_SQL_PWD,
    MY_SQL_DB,
    MY_SQL_PORT = 3306,
    SUCCESS_URL = process.env.SUCCESS_URL || 'http://localhost:3000/paypal-success', // Adjust for production
    CANCEL_URL  = process.env.CANCEL_URL  || 'http://localhost:3000/paypal-cancel',  // Adjust for production
    // These are used in the make_payment page
} = process.env;

const environment = ENVIRONMENT || 'sandbox';
const base = environment === 'sandbox' ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
const app = express();

// --- Middleware ---
// Enable CORS for frontend requests (adjust origin for production)
app.use(cors({
    origin: ['http://localhost:3000', 'https://coastsidearc.org'], // Allow your Next.js frontend
    methods: ['GET', 'POST'],
    credentials: true // If you're sending cookies/auth headers
}));

// Parse JSON request bodies (replaces body-parser.json())
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'client' directory (if 'checkout.html' is here)
app.use(express.static(path.join(__dirname, '../client'))); // Use path.join for robustness

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
app.set('views', './views'); // This path should be relative to server.js if 'index.html' is in './views'
app.set('view engine', 'sjf.html');

// --- MySQL Connection Pool (using mysql2/promise) ---
const pool = mysql.createPool({
    connectionLimit: 10,
    host: MY_SQL_SERVER,
    user: MY_SQL_USER,
    port: parseInt(MY_SQL_PORT, 10), // Ensure port is a number
    password: MY_SQL_PWD,
    database: MY_SQL_DB
});

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
            years, newmember, callsigns, ncallsigns, callsign, fullname,
            primary, family, repeater, APRS, subtotal, pay_paypal,
            paypalfee, clubreceives, total, pp_total, date, transaction_status, pp_id
        } = formData;

        const [result] = await pool.execute(
            `INSERT INTO pp_tnx (
                years, newmember, callsigns, ncallsigns, callsign, fullname,
                primary_dues, family_dues, repeater_donation, digipeater_donation,
                subtotal, pay_paypal, paypal_fee, club_receives, total_charges,
                pp_total_for_paypal, transaction_date, transaction_status, pp_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                years, newmember, callsigns, ncallsigns, callsign, fullname || 'N/A', // Default if fullname is null
                primary, family, repeater, APRS, subtotal, pay_paypal,
                paypalfee, clubreceives, total, pp_total, date, transaction_status, pp_id
            ]
        );
        res.status(200).json({ message: 'Data inserted successfully', new_pp_id });
    } catch (error) {
        console.error("Error in /api/submitDues:", error);
        res.status(500).json({ error: 'Failed to insert data into pp_tnx' });
    }
});


// --- PayPal API Routes (as they were) ---
app.post("/api/orders", async (req, res) => {
    try {
        console.log("Request to /api/orders received. Cart:", req.body.cart);
        const { cart } = req.body;

        // Ensure pp_id exists in the cart item
        if (!cart || !cart[0] || !cart[0].pp_id) {
            console.error("Missing pp_id in cart for /api/orders");
            return res.status(400).json({ error: "Missing PayPal ID in request." });
        }

        const result = await SelectPaypalTnx(cart[0].pp_id);
        if (result.length > 0 && result[0].transaction_status !== 'pending') {
            // has been dealt with. Cannot pay again... handles back button in browser
            console.warn(`Attempted to create order for already processed pp_id: ${cart[0].pp_id} (Status: ${result[0].transaction_status})`);
            return res.status(409).json({ error: "Order already processed or not pending." }); // 409 Conflict
        }

        const { jsonResponse, httpStatusCode } = await createOrder(cart);
        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error("Failed to create PayPal order:", error);
        res.status(500).json({ error: "Failed to create PayPal order." });
    }
});

app.post("/api/orders/:orderID/capture", async (req, res) => {
    try {
        console.log("Request to /api/orders/:orderID/capture received. Order ID:", req.params.orderID);
        const { orderID } = req.params;
        const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

        // Safely access custom_id
        const pp_id = jsonResponse?.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id;
        if (!pp_id) {
            console.error("PayPal capture response missing custom_id:", JSON.stringify(jsonResponse, null, 2));
            throw new Error("PayPal response did not contain expected custom_id.");
        }

        // Update your database based on PayPal's response
        await UpdatePaypalTnx(pp_id, orderID, jsonResponse);
        console.log(`Updated pp_tnx for pp_id: ${pp_id} with PayPal Order ID: ${orderID}`);

        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error("Failed to capture PayPal order:", error);
        res.status(500).json({ error: "Failed to capture PayPal order." });
    }
});

// --- Routes for Payment Flow from Frontend ---
app.get('/make_payment/:pp_id_arg', async (req, res) => {
    const { pp_id_arg } = req.params;
    try {
        const result = await SelectPaypalTnx(pp_id_arg);

        if (result.length === 0) {
            console.warn(`pp_id ${pp_id_arg} does not exist in db.`);
            return res.status(404).send("Payment record not found.");
        }

        const {
            callsigns,
            primary_dues: primary, // Ensure these match your DB column names
            family_dues: family,
            repeater_donation: repeater,
            digipeater_donation: APRS, // Assuming 'digipeater' in DB maps to 'APRS'
            paypal_fee: paypalfee,
            pp_total_for_paypal: pp_total,
            transaction_status
        } = result[0];

        if (transaction_status === 'pending') {
            res.render('index', { // Assuming 'index.sjf.html' is your template file
                'pp_id': pp_id_arg,
                'P1': primary,
                'P2': family,
                'P3': repeater,
                'P4': APRS,
                'P5': paypalfee,
                'P6': callsigns,
                'P7': pp_total,
                'succ_url': SUCCESS_URL,
                'canc_url': CANCEL_URL,
                'client_id': PAYPAL_CLIENT_ID,
                'title': 'CARC Dues Payment', // Add a title for the template
                'message': 'Please complete your PayPal payment below.', // Add a message
            });
        } else {
            console.warn(`Payment for pp_id ${pp_id_arg} is not pending (status: ${transaction_status}).`);
            res.status(409).send("This payment has already been processed or is not pending.");
        }
    } catch (e) {
        console.error("Error in /make_payment route:", e);
        res.status(500).send("An error occurred while preparing payment.");
    }
});

// Removed app.get('/paypal') as it serves 'checkout.html' which might be old/redundant.
// If you need it, uncomment and ensure pathing is correct.
// app.get('/paypal', async (req, res) => {
//   res.sendFile(path.resolve("./client/checkout.html"));
// });

// Removed /api/success as its logic is now within the capture route.
// If you still need a separate success page endpoint for display, consider
// redirecting the frontend after capture, or making this an informational page.
// app.post('/api/success/:pp_id_arg', async (req, res, next) => {
//   const { pp_id_arg } = req.params;
//   res.status(200).json({ to_do: `change record for ${pp_id_arg} to posted` })
// });


// --- Start Server ---
// Using HTTPS for secure communication, especially with payment data
https.createServer(certOptions, app).listen(PORT, () => {
    console.log(`HTTPS Server listening on port ${PORT}`);
    console.log(`PayPal Base URL: ${base}`);
});

// You can keep an HTTP server for testing or non-sensitive routes if needed,
// but for payment flows, HTTPS is mandatory.
// app.listen(PORT, () => {
//   console.log(`Example app listening on port ${PORT}`)
// });

// end of file
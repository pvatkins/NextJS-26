// frontend/src/app/test-get-last-entries/page.js
"use client";

import { useState, useEffect } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://coastsidearc.org");

export default function TestGetLastEntries() {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/getPPtnxdata?status=posted`,
          { method: "GET" }
        );
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Error fetching PPtnxdata:", err);
        setResults([]);
      } finally {
        setRunning(false);
      }
    };

    fetchData();
  }, []);

  if (!running && results.length === 0) {
    return (
      <main className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Recent Paypal Transactions</h1>
        <p className="text-gray-500">No recent transactions found.</p>
      </main>
    );
  }

function fmtAmt(amt) {
    return "$ " + (amt ? parseFloat(amt).toFixed(2) : "0.00");
}

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Recent Paypal Transactions</h1>

      <p className="text-gray-700">
        This page provides the most recent Paypal transactions recorded in the
        <code> pp_tnx </code> table. Future versions may support paging through
        older records.
      </p>

      {running && <p className="italic text-gray-500">Loading…</p>}

      {!running && results.length > 0 && (
        <>
          {/* First table */}
          <div>
            <p>Details record for the last {results.length} rows of the <code>pp_tnx</code> table</p>
            <table className="w-full border-collapse border border-gray-400 mt-6">
              <thead>
                <tr className="bg-gray-100">
                    <th className="border px-2 py-1">indx</th>
                    <th className="border px-2 py-1">date</th>
                    <th className="border px-2 py-1">callsign</th>
                    <th className="border px-2 py-1">name</th>
                    <th className="border px-2 py-1">years</th>
                    <th className="border px-2 py-1">primary</th>
                    <th className="border px-2 py-1">family</th>
                    <th className="border px-2 py-1">repeater</th>
                    <th className="border px-2 py-1">digipeater</th>
                    <th className="border px-2 py-1">subtotal</th>
                    <th className="border px-2 py-1">PayPalFee</th>
                    <th className="border px-2 py-1">club</th>
                    <th className="border px-2 py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{r.myindex}</td>
                    <td className="border px-2 py-1">{r.mydate}</td>
                    <td className="border px-2 py-1">{r.callsigns}</td>
                    <td className="border px-2 py-1">{r.FullName}</td>
                    <td className="border px-2 py-1">{r.years}</td>
                    <td className="border px-2 py-1">{r.primary}</td>
                    <td className="border px-2 py-1">{r.family}</td>
                    <td className="border px-2 py-1">{r.repeater}</td>
                    <td className="border px-2 py-1">{r.digipeater}</td>
                    <td className="border px-2 py-1">{r.subtotal}</td>
                    <td className="border px-2 py-1">{r.paypalfee}</td>
                    <td className="border px-2 py-1">{r.clubreceives}</td>
                    <td className="border px-2 py-1">{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Second table */}
          <div>
            <p>Tracking record for the last {results.length} rows of the <code>pp_tnx</code> table</p>
            <table className="w-full border-collapse border border-gray-400 mt-6">
              <thead>
                <tr className="bg-gray-100">
                    <th className="border px-2 py-1">indx</th>
                    <th className="border px-2 py-1">pp_id</th>
                    <th className="border px-2 py-1">pp_orderID</th>
                    <th className="border px-2 py-1">status</th>
                    <th className="border px-2 py-1">pp_total</th>
                    <th className="border px-2 py-1">paypal_fee</th>
                    <th className="border px-2 py-1">club_receives</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{r.myindex}</td>
                    <td className="border px-2 py-1">{r.pp_id}</td>
                    <td className="border px-2 py-1">{r.pp_orderID}</td>
                    <td className="border px-2 py-1">{r.transaction_status}</td>
                    <td className="border px-2 py-1">{fmtAmt(r.pp_total)}</td>
                    <td className="border px-2 py-1">{r.paypalfee}</td>
                    <td className="border px-2 py-1">{r.clubreceives}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

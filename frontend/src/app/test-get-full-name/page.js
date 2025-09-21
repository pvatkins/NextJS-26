// frontend/src/app/test-get-full-name/page.js

"use client";

import { useState, useEffect } from "react";

// Test data
const testCases = [
  { call: "KN6PIV", expected: "Jillian Aldersen" },
  { call: "KM6HYK", expected: "William J. Anderson" },
  { call: "KM6UYM", expected: "Fernel Andong" },
  { call: "AI6BB",  expected: "Paul Atkins" },
  { call: "KN6ORM", expected: "Steve Austin" },
  { call: "W2OKB",  expected: "Bharat Bailur" },
  { call: "W6LOG",  expected: "Robert Barbitta" },
  { call: "KI6HIG", expected: "Gary Barnes" },
  { call: "KJ6FHQ", expected: "Anna Bernstine" },
  { call: "N6ZEN",  expected: "Dan Bernstein" },
  { call: "KK6FOI", expected: "Emily Bernstein" },
  { call: "AA6XL",  expected: "Michael G. Bevington" },
  { call: "WB6JKV", expected: "Michael S. Herbert" },
  { call: "N6FG",   expected: "Frank Erbacher" },
  { call: "N6SJF",  expected: "Jonathan Lancelle" },
  { call: "KJ6OGL", expected: "Tom Oliver" },
  { call: "W1AW",   expected: "(default)" },
  { call: "WA6TOW", expected: "(default)" },
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!BACKEND_URL) {
  console.warn("⚠️ NEXT_PUBLIC_BACKEND_URL is not defined!");
}
console.log("🔗 Using backend:", BACKEND_URL || "(none)");

export default function TestGetFullName() {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      const newResults = [];

      for (const test of testCases) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/getFullName`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callsign: test.call }),
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const data = await res.json();
          console.log("API response for", test.call, ":", data);

          const retrieved = data?.result?.FullName ?? null;
          const pass =
            retrieved &&
            retrieved.trim().toLowerCase() === test.expected.trim().toLowerCase();

          newResults.push({ call: test.call, expected: test.expected, retrieved, pass });
        } catch (err) {
          newResults.push({
            call: test.call,
            expected: test.expected,
            retrieved: `Error: ${err.message}`,
            pass: false,
          });
        }
      }

      setResults(newResults);
      setRunning(false);
    };

    runTests();
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Automated Full Name Tests</h1>
      <p className="text-gray-700">
        This page automatically tests <code>/api/getFullName</code> against expected results.
        For this test, only 4 fails should occur. 2 of them due to mis-spellings (KJ6FHQ, N6FG)
        and 2 for non-members (W1AW, WA6TOW).
      </p>

      {running && <p className="italic text-gray-500">Running tests...</p>}

      {results.length > 0 && (
        <table className="w-full border-collapse border border-gray-400 mt-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-2 py-1">Callsign</th>
              <th className="border border-gray-400 px-2 py-1">Expected</th>
              <th className="border border-gray-400 px-2 py-1">Retrieved</th>
              <th className="border border-gray-400 px-2 py-1">Result</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td className="border border-gray-400 px-2 py-1">{r.call}</td>
                <td className="border border-gray-400 px-2 py-1">{r.expected}</td>
                <td className="border border-gray-400 px-2 py-1">
                  {r.retrieved ?? "(none)"}
                </td>
                <td
                  className={`border border-gray-400 px-2 py-1 font-bold ${
                    r.pass ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {r.pass ? "PASS" : "FAIL"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

// frontend/src/app/net-control-roster/page.js

'use client'; // This component will use client-side logic for dynamic dates

import React, { useState, useEffect, useMemo } from 'react';


// --- Data for Net Control Assignments (replace with actual data for your year) ---
// This structure groups entries by month, matching the two-column display
const netControlRosterData = {
  2025: [
    {
      month1: 'JAN', days1: [' 1', ' 8', '15', '22', '29'], controls1: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH', 'Tom, KJ6OGL'],
      month2: 'JUL', days2: [' 2', ' 9', '16', '23', '30'], controls2: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH', 'Tom, KJ6OGL'],
    },
    {
      month1: 'FEB', days1: [' 5', '12', '19', '26'], controls1: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH'],
      month2: 'AUG', days2: [' 6', '13', '20', '27'], controls2: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH'],
    },
    {
      month1: 'MAR', days1: [' 5', '12', '19', '26'], controls1: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH'],
      month2: 'SEP', days2: [' 3', '10', '17', '24'], controls2: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH'],
    },
    {
      month1: 'APR', days1: [' 2', ' 9', '16', '23', '30'], controls1: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH', 'Tom, KJ6OGL'],
      month2: 'OCT', days2: [' 1', ' 8', '15', '22', '29'], controls2: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH', 'Tom, KJ6OGL'],
    },
    {
      month1: 'MAY', days1: [' 7', '14', '21', '28'], controls1: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH'],
      month2: 'NOV', days2: [' 5', '12', '19', '26'], controls2: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH'],
    },
    {
      month1: 'JUN', days1: [' 2', ' 9', '16', '23', '30'], controls1: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH', 'Tom, KJ6OGL'],
      month2: 'DEC', days2: [' 3', '10', '17', '24', '31'], controls2: ['Steve, KN6ORM', '-- Meeting --', 'Tom, KJ6OGL', 'Ralph, KC6YDH', 'Tom, KJ6OGL'],
    },
  ],
  // Add other years here if you have separate data for them
  // 2024: [ ... ],
};

// --- Utility Functions for Dates (moved from old script) ---
// These functions are client-side only because they use `Date` object heavily
const getListOfWednesdays = (year, monthIndex) => { // monthIndex is 0-11
  const monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const firstWedOffset = [4, 3, 2, 1, 7, 6, 5]; // Day of first Wednesday based on day of first of month (0=Sun, 6=Sat)
  const daysInMoArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let currentDaysInMonth = daysInMoArr[monthIndex];
  // Adjust for leap year
  if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
    if (monthIndex === 1) currentDaysInMonth = 29; // February
  }

  const refDate = new Date(`${monthsArr[monthIndex]} 1, ${year}`);
  const firstWednesdayDay = firstWedOffset[refDate.getUTCDay()];

  const wedList = [];
  for (let i = 0; i < 5; i++) {
    let putativeDate = i * 7 + firstWednesdayDay;
    let isHoliday = false;

    // Check for holidays that skip net control
    if (putativeDate === 1 && monthIndex === 0) { // January 1st (New Year's Day)
      isHoliday = true;
    }
    if (putativeDate === 25 && monthIndex === 11) { // December 25th (Christmas)
      isHoliday = true;
    }

    if (putativeDate <= currentDaysInMonth && !isHoliday) {
      wedList.push((" " + putativeDate).slice(-2));
    } else if (putativeDate <= currentDaysInMonth && isHoliday) {
      // If it's a holiday, we might still list it with a special note or skip,
      // based on original logic 'condition = false'.
      // For now, mirroring original behavior, if condition is false, it's skipped.
      // If you want to explicitly show "-- Holiday --", you'd add it here.
    }
  }
  return wedList;
};

// This function combines the `getListOfWednesdays` with the net control assignments
const getNetControlRosterForYear = (year) => {
  const currentYearData = netControlRosterData[year];
  if (!currentYearData) return []; // No data for this year

  // You could dynamically merge calculated Wednesday dates with assigned net control data here
  // For simplicity, sticking to the pre-defined `netControlRosterData` for assignments
  // as the old script only calculated dates, not actual assignments.
  // The 'analyzeTheYear' function was for logging, not generating the roster display.
  // So we directly use the static `netControlRosterData` for display.
  return currentYearData;
};

export default function CARCNetControlRoster() {
  const currentYear = new Date().getFullYear();
  const roster = useMemo(() => getNetControlRosterForYear(currentYear), [currentYear]);

  if (!roster || roster.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center text-gray-600">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-6">
          CARC Net Control Roster {currentYear}
        </h1>
        <p>No roster data available for {currentYear} at this time.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Page Header / Banner Section */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-4">
          CARC Net Control Roster {currentYear}
        </h1>
        {/* Removing the banner image as per ToDo list
        <img
          className="mx-auto rounded-lg shadow-md"
          src="/images/NetControlRoster_bnr.png"
          alt="Net Control Roster Banner"
          width={600} // Adjust as needed
          height={60} // Adjust as needed
        />

      */}
      </div>
      {/* Roster Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-2 text-center font-semibold text-base sm:text-lg border-b border-gray-200 w-2/19">Month</th>
              <th className="py-3 px-2 text-center font-semibold text-base sm:text-lg border-b border-gray-200 w-2/19">Day</th>
              <th className="py-3 px-4 text-left font-semibold text-base sm:text-lg border-b border-gray-200 w-5/19">Net Control</th>
              <th className="w-1/19 border-b border-gray-200"></th> 
              {/* Empty separator column above */}
              <th className="py-3 px-2 text-center font-semibold text-base sm:text-lg border-b border-gray-200 w-2/19">Month</th>
              <th className="py-3 px-2 text-center font-semibold text-base sm:text-lg border-b border-gray-200 w-2/19">Day</th>
              <th className="py-3 px-4 text-left font-semibold text-base sm:text-lg border-b border-gray-200 w-5/19">Net Control</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((monthPair, pairIndex) => {
              const maxRows = Math.max(monthPair.days1.length, monthPair.days2.length);
              const rows = [];

              for (let i = 0; i < maxRows; i++) {
                rows.push(
                  <tr key={`${monthPair.month1}-${pairIndex}-${i}`} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
                    {/* Left Column (Month 1) */}
                    {i === 0 && ( // Apply rowspan only for the first row of the pair
                      <td rowSpan={maxRows} className="py-2 px-2 text-center align-top text-gray-800 font-bold text-lg border-r border-gray-300">
                        {monthPair.month1}
                      </td>
                    )}
                    <td className="py-2 px-2 text-center text-gray-800 whitespace-nowrap">{monthPair.days1[i] || '--'}</td>
                    <td className="py-2 px-4 text-left text-gray-700">{monthPair.controls1[i] || ''}</td>
                    
                    <td className="w-1 border-r border-l border-gray-300"></td> {/* Separator column */}

                    {/* Right Column (Month 2) */}
                    {i === 0 && ( // Apply rowspan only for the first row of the pair
                      <td rowSpan={maxRows} className="py-2 px-2 text-center align-top text-gray-800 font-bold text-lg border-r border-gray-300">
                        {monthPair.month2}
                      </td>
                    )}
                    <td className="py-2 px-2 text-center text-gray-800 whitespace-nowrap">{monthPair.days2[i] || '--'}</td>
                    <td className="py-2 px-4 text-left text-gray-700">{monthPair.controls2[i] || ''}</td>
                  </tr>
                );
              }
              return rows;
            })}
          </tbody>
        </table>
      </div>

      {/* Optional: Notes Section */}
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Notes:</h2>
        <p className="text-gray-700 leading-relaxed text-sm italic">
          The CARC Wednesday Night Net is held weekly at 7:30 PM on the WA6TOW 146.925 MHz repeater (PL 114.8 Hz).
          This roster is for informational purposes and subject to change.
          Please check the <a href="/CARC_Coming_Events" className="text-blue-600 hover:underline">Coming Events</a> page for specific meeting dates or changes.
        </p>
      </div>
    </div>
  );
}
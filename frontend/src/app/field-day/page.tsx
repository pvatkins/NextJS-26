// frontend/src/app/field-day/page.tsx

// No need to import React explicitly in Next.js 13+ App Router
// if you are only using JSX and hooks like useState/useEffect (which are imported directly).
// import React from "react";

export const metadata = {
  title: "CARC Field Day",
  description: "A general description of Field Day activities and participation, including location and operations.",
};

export default function CARCFieldDayPage() {
  // Here is the array of text for the Field Day writeup
  // Removed backslashes for multi-line strings as they are generally not needed
  // and can sometimes cause issues with leading/trailing spaces if not careful.
  const fieldDayWriteup = [
    "CQ CQ CQ this is WA6TOW Calling CQ for Field Day...",

    "Field Day is one of the biggest events in North American amateur radio. It runs " +
    "around the clock from start to finish on the fourth weekend of June every year. " +
    "More than 35,000 radio amateurs gather with their clubs, groups and friends to " +
    "operate from remote locations.",

    "The usual High Frequency (HF) amateur bands are 160, 80, 40, 20, 15, and 10 meters. " +
    "Amateur operations also occur in the VHF and UHF bands. Per the ARRL, the objective " +
    "of Field Day is: “To work as many stations as possible on any and all amateur bands " +
    "(excluding the 60, 30, 17, and 12-meter bands) and to learn to operate in abnormal " +
    "situations in less than optimal conditions. Field Day is open to all amateurs in the " +
    "areas covered by the ARRL/RAC Field Organizations and countries within IARU Region 2. " +
    "DX stations residing in other regions may be contacted for credit, but are not " +
    "eligible to submit entries.",

    "The CARC will set up its Field Day operation on Sweeney Ridge near the Portola " +
    "Discovery Site (where the Gaspar de Portola expedition made the first European " +
    "discovery of SF Bay in 1769). The site has outstanding views of both the Pacific " +
    "Ocean and San Francisco Bay.",

    "Setup will commence at 8:00 AM at the Sneath Lane entrance to the park on " +
    "Saturday Morning, where hams from our club will trek up the hill to the " +
    "site. Setup consists of setting up the stations, especially the 15M and 20M beam " +
    "antennas.",

    "On-air operations will occur during " +
    "the 24-hour period between 11 AM on Saturday and 11 AM on Sunday. Following the " +
    "close of operations on Sunday, the stations will be disassembled and the site " +
    "cleared to its original pristine condition.",

    "You don't need to have HF privileges, or even be a ham, to make contacts at " +
    "our Field Day site. We will have personnel on hand to act as control operators. " +
    "So come on up and get involved in ham radio!"
  ];

  return (
    // Main container for the page content, centered and with consistent padding
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">

      {/* Page Title */}
      <h1 className="text-4xl font-extrabold text-blue-800 mb-6 text-center">
        Field Day
      </h1>

      {/* Dynamic Content - Field Day Writeup */}
      {/* Use .map() correctly to iterate and return JSX elements */}
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-4">
        {fieldDayWriteup.map((paragraph, index) => (
          // Use a unique key for each paragraph, index is okay here as order is fixed
          <p key={index} className="text-gray-700 leading-relaxed text-lg">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Directions to the Field Day Site */}
      {/* Wrapped in a new styled div for consistency */}
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-3">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-3">
          Directions to the Field Day Site
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg font-sans">
          {/* External Link 1 */}
          <a
            href="http://goo.gl/3Hn8g"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium block mb-2"
          >
            Directions to Skyline College Parking Lot P from Pacifica (link to Google Maps)
          </a>

          {/* External Link 2 */}
          <a
            href="http://goo.gl/tnccH"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium block"
          >
            Directions to Skyline College Parking Lot P from SFO (link to Google Maps)
          </a>
        </p>
      </div>
    </div>
  );
}
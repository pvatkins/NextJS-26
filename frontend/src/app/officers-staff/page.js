// frontend/src/app/CARC_Officers/page.js

// No need to import React explicitly in Next.js 13+ App Router
// import React from "react";

export const metadata = {
  title: "CARC Officers & Staff",
  description: "Meet the current officers and staff of the Coastside Amateur Radio Club (CARC).",
};

// Centralize the officers and staff data
const officers = [
  { office: "President", name: "Ralph Kugler", callsign: "KC6YDH" },
  { office: "Vice President", name: "Paul Atkins", callsign: "AI6BB" },
  { office: "Secretary", name: "Tom Oliver", callsign: "KJ6OGL" },
  { office: "Treasurer", name: "Steve Austin", callsign: "KN6ORM" },
];

const staff = [
  { position: "Control Operator", name: "Steve Austin", callsign: "KN6ORM" },
  { position: "Emergency Services", name: "TBD", callsign: "" },
  { position: "Field Day", name: "Jon Lancelle", callsign: "N6SJF" },
  { position: "Membership", name: "Jon Lancelle", callsign: "N6SJF" },
  { position: "Newsletter Editor", name: "Tom Oliver", callsign: "KJ6OGL" },
  { position: "Newsletter Publisher", name: "Paul Atkins", callsign: "AI6BB" },
  { position: "Station Technician", name: "Michael Herbert", callsign: "WB6JKV" },
  { position: "Trustee of Club Call", name: "Steve Austin", callsign: "KN6ORM" },
  { position: "Website", name: "Paul Atkins", callsign: "AI6BB" },
];

export default function CARCOfficersPage() {
  const currentYear = new Date().getFullYear(); // Get current year dynamically

  return (
    // Main container for *this page's content*, centered and with consistent padding.
    // The global layout (e.g., app/layout.js) will provide the sidebar.
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <h1 className="text-4xl font-extrabold text-blue-800 mb-6 text-center">
        CARC Leadership
      </h1>

      {/* Officers Table */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 border-b pb-3 mb-4 text-center">
          {currentYear} CARC Officers
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="py-3 px-4 text-center font-semibold text-lg border-b border-gray-200">OFFICE</th>
                <th className="py-3 px-4 text-left font-semibold text-lg border-b border-gray-200">NAME</th>
                <th className="py-3 px-4 text-center font-semibold text-lg border-b border-gray-200">CALL</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((officer, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="py-2 px-4 text-center text-gray-800 font-medium whitespace-nowrap">{officer.office}</td>
                  <td className="py-2 px-4 text-left text-gray-700">{officer.name}</td>
                  <td className="py-2 px-4 text-center text-gray-700">{officer.callsign}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Staff Table */}
      <section className="space-y-4 pt-4"> {/* Added padding top for separation */}
        <h2 className="text-3xl font-bold text-gray-900 border-b pb-3 mb-4 text-center">
          {currentYear} CARC Staff
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="py-3 px-4 text-center font-semibold text-lg border-b border-gray-200">POSITION</th>
                <th className="py-3 px-4 text-left font-semibold text-lg border-b border-gray-200">NAME</th>
                <th className="py-3 px-4 text-center font-semibold text-lg border-b border-gray-200">CALL</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="py-2 px-4 text-center text-gray-800 font-medium whitespace-nowrap">{member.position}</td>
                  <td className="py-2 px-4 text-left text-gray-700">{member.name}</td>
                  <td className="py-2 px-4 text-center text-gray-700">{member.callsign}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
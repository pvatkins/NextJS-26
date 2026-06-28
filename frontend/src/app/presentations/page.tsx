// frontend/src/app/presentations/page.tsx

// You can safely remove 'import React from "react";' if not directly using React features like React.Fragment
// import React from "react";

export const metadata = {
  title: "CARC Presentations",
  description: "A compendium of technical presentations provided at club meetings.",
};

const presentations = [
  {
    Date: "2020-11-11",
    Presenter: "Ralph Kugler",
    "Call Sign": "KC6YDH",
    Topic: "DMR Radios",
    // Add a 'file' property if you have a PDF/slides for this presentation
    // file: "DMR_Radios_KC6YDH.pdf"
  },
  {
    Date: "2021-01-13",
    Presenter: "Paul Atkins",
    "Call Sign": "AI6BB",
    Topic: "Arduino DDS VFO",
  },
  {
    Date: "2021-02-10",
    Presenter: "Jon Lancelle",
    "Call Sign": "N6SJF",
    Topic: "The 4 Basses",
  },
  {
    Date: "2021-02-10",
    Presenter: "Dave Conroy",
    "Call Sign": "KM6CPF",
    Topic: "Israel Photos",
  },
  {
    Date: "2021-05-12",
    Presenter: "Paul Atkins",
    "Call Sign": "AI6BB",
    Topic: "Measure Capacitance with Arduino",
  },
  {
    Date: "2025-05-12",
    Presenter: "Steve Austin",
    "Call Sign": "KN6ORM",
    Topic: "WA6TOW Repeater Plans, Feb 2025",
  },
];

export default function CARCPresentations() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Page Title */}
      <h1 className="text-4xl font-extrabold text-blue-800 mb-6 text-center">
        CARC Presentations
      </h1>
      {/* Introduction */}
      <p className="text-gray-700 leading-relaxed mb-4">
        This page provides copies of speaker's slides or other media presented at our CARC meetings.
        These presentations are provided for educational purposes and to help promote the understanding
        of various aspects of amateur radio.
      </p>

      {/* Dynamic Presentations Table */}
      // Corrected structure, removing all potential whitespace sources between table elements
<div className="overflow-x-auto bg-white shadow-lg rounded-xl">
  <table className="min-w-full text-left border-collapse">
    <thead>
      <tr className="bg-blue-600 text-white">
        <th className="py-3 px-4 text-center font-semibold text-lg border-b border-gray-200">Date</th>
        <th className="py-3 px-4 text-left font-semibold text-lg border-b border-gray-200">Presenter</th>
        <th className="py-3 px-4 text-center font-semibold text-lg border-b border-gray-200">Call Sign</th>
        <th className="py-3 px-4 text-left font-semibold text-lg border-b border-gray-200">Topic</th>
      </tr>
    </thead>
    <tbody>
      {presentations.map((presentation, index) => (
        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
          <td className="py-2 px-4 text-center text-gray-800 font-medium whitespace-nowrap">{presentation.Date}</td>
          <td className="py-2 px-4 text-left text-gray-700">{presentation.Presenter}</td>
          <td className="py-2 px-4 text-center text-gray-700">{presentation["Call Sign"]}</td>
          <td className="py-2 px-4 text-left text-gray-700">{presentation.Topic}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      <p className="text-gray-700 leading-relaxed mt-6">
        If you have a presentation that you would like to share, please contact the CARC board.
      </p>
    </div>
  );
}
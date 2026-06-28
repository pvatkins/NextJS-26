// frontend/src/app/wants-and-swaps/page.tsx

// No need to import React explicitly in Next.js 13+ with the new app directory
// import Link from "next/link"; // Only needed if you add internal links

export const metadata = {
  title: "CARC Wants & Swaps",
  description: "A page for members of the Coastside Amateur Radio Club (CARC) to post amateur radio related items they want to buy, sell, or trade.",
};

export default function CARCWantsAndSwaps() {
  return (
    // Main content container, centered with consistent padding and max-width.
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8"> {/* Increased space-y for major sections */}
      <h1 className="text-4xl font-extrabold text-blue-800 mb-6 text-center">
        CARC Wants & Swaps
      </h1>

      {/* Introductory Section */}
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-4 text-gray-700 leading-relaxed text-lg">
        <p>
          Welcome to the Coastside Amateur Radio Club's "Wants & Swaps" page! This is a dedicated space
          for CARC members to post advertisements for amateur radio related equipment they wish to sell,
          trade, or acquire.
        </p>
        <p> {/* This is the second paragraph */}
          To submit an item for this page, please send an email to our webmaster with a clear
          description of your item (including price, condition, and contact information).
          Posts will typically remain active for 30 days unless renewed.
        </p>
        {/*
          If you wanted *more* space only between these two specific paragraphs,
          you could add a margin-bottom class to the first one:
          <p className="mb-6"> ... first paragraph ... </p>
          But `space-y-4` on the parent `div` is usually sufficient and cleaner for consistent spacing.
        */}
      </div>

      {/* Wants Section */}
      <section className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 border-b pb-2 mb-4">
          Items Wanted
        </h2>
        {/* Placeholder for actual "Wanted" listings */}
        <p className="text-gray-600 italic">
          No items currently listed in the "Wants" section.
        </p>
        {/* Example of a real item if you had data:
        <div className="border border-gray-200 rounded-md p-3">
          <h3 className="font-semibold text-xl text-gray-800">Wanted: Yaesu FT-857D</h3>
          <p className="text-gray-700">Looking for a Yaesu FT-857D in good working condition. Prefer local pickup.</p>
          <p className="text-sm text-gray-500">Contact: John Doe (AB1CD) - john.doe@email.com</p>
        </div>
        */}
      </section>

      {/* Swaps/For Sale Section */}
      <section className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 border-b pb-2 mb-4">
          Items For Sale/Trade
        </h2>
        {/* Placeholder for actual "For Sale/Trade" listings */}
        <p className="text-gray-600 italic">
          No items currently listed in the "For Sale/Trade" section.
        </p>
        {/* Example of a real item if you had data:
        <div className="border border-gray-200 rounded-md p-3">
          <h3 className="font-semibold text-xl text-gray-800">For Sale: Kenwood TS-440S/AT</h3>
          <p className="text-gray-700">Excellent condition, with auto-tuner. Includes original manual and power cable.</p>
          <p className="text-sm text-gray-500">Price: $450 OBO. Contact: Jane Smith (XY2WZ) - jane.smith@email.com</p>
        </div>
        */}
      </section>

      {/* Contact Information */}
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 text-center text-gray-700 leading-relaxed text-lg">
        <p>
          To submit an item or for any inquiries regarding this page, please email:
          <br />
          <a href="mailto:webmaster@coastsidearc.org" className="text-blue-600 hover:underline font-medium">webmaster@coastsidearc.org</a>
        </p>
      </div>
    </div>
  );
}
// frontend/src/app/repeater_calendar/page.js

// No need to import React explicitly in Next.js 13+ with the new app directory
// Link is not explicitly used in this rewritten version,
// but keep it if you plan to add internal links later.
// import Link from "next/link";


export const metadata = {
  title: "CARC Repeater Calendar",
  description: "Shows the schedule of Repeater Nets and other events for the Coastside Amateur Radio Club (CARC).",
};

export default function CARCRepeaterCalendar() {
  return (
    // Main content container, centered with consistent padding and max-width.
    // This allows the content to fit within your global layout (e.g., alongside the SideMenu).
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <h1 className="text-4xl font-extrabold text-blue-800 mb-6 text-center">
        CARC Repeater & Events Calendar
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-4 text-gray-700 leading-relaxed text-lg">
        <p>
          Stay up-to-date with the Coastside Amateur Radio Club's repeater net schedule and other important events!
          Our Google Calendar below provides the latest information.
        </p>
        <p>
          You can also add this calendar to your own Google Calendar by clicking the "+Google Calendar" button at the bottom right of the calendar interface.
        </p>
      </div>

      {/* Responsive iframe container */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '75%' }}> {/* 4:3 Aspect Ratio (3/4 = 0.75) */}
        <iframe
          src="https://calendar.google.com/calendar/embed?src=coastsidearc%40gmail.com&ctz=America/Los_Angeles"
          style={{ border: 0 }}
          className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
          frameBorder="0"
          scrolling="no"
          title="CARC Google Calendar" // Add a title for accessibility
        ></iframe>
      </div>
    </div>
  );
}
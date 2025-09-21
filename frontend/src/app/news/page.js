// frontend/src/app/news/page.js


// import Link from "next/link"; 
// import SideMenu from "@/components/SideMenu";

export const metadata = {
  title: "CARC News",
  description: "Latest news and updates from the Coastside Amateur Radio Club (CARC).",
};

export default function CARCNews() {
  return (
    <div className="p-6 space-y-6">
      {/* Background removed — old code was:
          <div bg-url="/images/carc_background.jpg" > 
      */}

      {/* Page header */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">
          Coastside ARC News
        </h2>
      </div>

      {/* News items */}
      <div className="space-y-4">
        {/* News item 0: Upcoming Ham Radio Flea Market in Pacifica */}
        <div className="p-4 bg-gray-50 rounded-md shadow-sm hover:bg-gray-100 transition duration-150">
          <h3 className="text-lg font-semibold mb-2">
            Upcoming Ham Radio Flea Market in Pacifica
          </h3>
          <p className="text-gray-700 mb-2">
            Join us for the upcoming Amateur Radio & Electronics Garage Sale in
            Pacifica on Saturday, August 9 from 9AM until 4 PM presented by
            K6BV & K6KLY! A great opportunity to buy, sell, and trade radio
            equipment!
          </p>
        </div>
      </div>
    </div>
  );
}

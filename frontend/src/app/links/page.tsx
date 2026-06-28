/// frontend/src/app/links/page.js

// No need to import React explicitly in Next.js 13+ App Router
// import React from "react";

export const metadata = {
  title: "CARC Amateur Radio Links",
  description: "A set of resources for members of our club and the general amateur radio community.",
};

// Consolidate all link data into a single array of objects
const linkCategories = [
  {
    title: "Local Radio Clubs",
    links: [
      { name: 'Bay Area Educational Amateur Radio Society (BAEARS)', url: 'http://www.baears.com/' },
      { name: 'Half Moon Bay Amateur Radio Club', url: 'http://www.hmbarc.org/' },
      { name: 'Mount Diablo Radio Club -- W6CX', url: 'http://www.mdarc.org/' },
      { name: 'Palo Alto Amateur Radio Association -- W6CF', url: 'http://www.paara.org/' },
      { name: 'QCWA Chapter 11 Organization', url: 'http://www.qsl.net/qcwa-11/' },
      { name: 'San Bruno Amateur Radio Club', url: 'http://sbamradio.org/' },
      { name: 'San Francisco Amateur Radio Club -- W6PW', url: 'http://www.sfarc.org/' },
      { name: 'San Leandro Radio Club -- W6ZB', url: 'https://www.facebook.com/p/San-Leandro-Radio-Club-W6ZB-100069412630008/' },
      { name: 'San Mateo Radio Club -- W6UQ', url: 'https://sites.google.com/site/w6uqhamradioclub/' },
      { name: 'Sons In Retirement Amateur Radio Club', url: 'http://www.qsl.net/w6zzt/' },
      { name: 'Valley of the Moon A.R.C. -- W6AJF', url: 'http://www.vomarc.org/' },
      { name: 'Young Ladies Radio League', url: 'https://facebook.com/groups/560760197456757' },
    ]
  },
  {
    title: "Emergency Services",
    links: [
      { name: 'Half Moon Bay ARES', url: 'http://hmbarc.org/ares/' },
      { name: 'National Oceanic and Atmospheric Administration', url: 'http://www.noaa.gov/' },
      { name: 'Northern Amateur Relay Council of California Inc.', url: 'http://www.narcc.org/' },
      { name: 'Pacifica CERT', url: 'https://www.cityofpacifica.org/departments/police/natural-disasters/cert' },
      { name: 'San Mateo County Sheriffs Office of Emergency Services ~ 2019 Plan', 
        url: 'https://smso-scu.org/download/smso-ham-2019-final.pdf' },
      { name: 'San Mateo County Sheriffs Office of Emergency Services ~ 2017 Plan', 
        url: 'https://k6mpn.org/training/resources/SMSO-Ham-Band-Plan_2017_r18-FINAL.pdf' },
      { name: 'San Mateo County ACS Radio Plan', url: 'http://www.blackberryreact.org/sm-co-freqs.html' },
      { name: 'South County Amateur Radio Emergency Services (SCARES)', url: 'K6MPN.ORG' },
      { name: 'USGS - National Earthquake Information Center', url: 'https://earthquake.usgs.gov/earthquakes/' },
    ]
  },
  {
    title: "Ham Radio Conventions",
    links: [
      { name: 'Pacificon ~ (October 10-12, 2025)', url: 'https://pacificon.org/' },
      { name: 'Santa Maria DXers & Contesters Convention ~ (April 10 - 12, 2026)', url: 'https://socalcontestclub.org/SantaMaria2026/' },
      { name: 'Dayton Hamvention (May 15 - 17, 2026)', url: 'https://Hamvention.org' },
      { name: 'WRTC 2026 (July  8 - 13, 2026)', url: 'https://wrtc2026.org/' },
    ]
  },
  {
    title: "References",
    links: [
      { name: 'QRZ', url: 'http://www.qrz.com/' },
      { name: 'Amateur Radio and DX Reference Guide', url: 'http://www.qsl.net/w6zzt/' },
      { name: 'Ham Radio Secrets', url: 'http://www.hamradiosecrets.com/' },
      { name: 'Contesting Online', url: 'http://contesting.com/' },
      { name: 'Morse Code History', url: 'https://www.emissary.ai/telegraph-morse-code-text/' },
      { name: 'DX Holiday', url: 'https://www.dx-world.net/dx-holiday/' },
      { name: 'eham', url: 'http://eham.net/' },
      { name: 'The Elmer Hamlet', url: 'https://www.qsl.net/lu1awf/antena/32.htm' },
      { name: 'Ham Gallery', url: 'http://www.hamgallery.com/' },
      { name: 'HamRad--Amateur Radio Resource', url: 'http://www.qsl.net/hamrad/' },
      { name: 'Bay Area Educational Amateur Radio Society (BAEARS)', url: 'http://www.baears.com/' }, // Duplicate, consider removing if intended to be unique
      { name: 'Half Moon Bay Amateur Radio Club', url: 'http://www.hmbarc.org/' }, // Duplicate, consider removing if intended to be unique
      { name: 'Homing In -- All About RDF', url: 'http://www.homingin.com/' },

    ]
  },
  {
    title: "Repeaters",
    links: [
      { name: 'ARRL', url: 'https://www.arrl.org/search/repeaters/page:1' },
    ]
  },
  {
    title: "Equipment Manufacturers/Distributors",
    links: [
      { name: 'Cushcraft Communications Antennas', url: 'http://www.cushcraftamateur.com/' },
      { name: 'DX Engineering (Butternut Antennas)', url: 'https://www.dxengineering.com/' },
      { name: 'Ham Radio Outlet', url: 'http://www.hamradio.com/' },
      { name: 'Hy Power Antenna Company', url: 'http://www.hypowerantenna.com/' },
      { name: 'Vibroplex Products', url: 'http://www.vibroplex.com/' },
      { name: 'WaveNode WN-1', url: 'http://www.wavenodedevelop.com/' },
      { name: 'Amateur Radio Clip Art', url: 'https://www.shutterstock.com/search/amateur-radio-clip-art' },
    ]
  },
  {
    title: "APRS",
    links: [
      { name: 'APRS.org', url: 'http://www.aprs.org/' },
      { name: 'APRS-Pacifica', url: 'https://aprs.fi/#!addr=pacifica%2C%20CA' },
      { name: 'APRS.fi', url: 'https://aprs.fi/' },
      { name: 'APRS Messenger Download', url: 'http://aprs-messenger.software.informer.com/' },
      { name: 'APRS Software', url: 'http://www.aprs.org/aprssw.html' },
      { name: 'Cross Country Wireless', url: 'https://crosscountrywireless.net/' },
      { name: 'APRS TNCs', url: 'http://www.aprs.org/aprstnc.html' },
      { name: 'APRSearch.net', url: 'https://www.qsl.net/n2ixd/aprs/index.htm/' },
      { name: 'FindU.com', url: 'http://www.findu.com/' },
    ]
  },
  {
    title: "T-Hunting",
    links: [
      { name: 'T-Hunting in the SF Bay Area', url: 'http://www.rdf-sf.org/' },
    ]
  },
  {
    title: "VEC's and Exams",
    links: [
      { name: 'Silicon Valley VEC', url: 'http://svve.org/' },
      { name: 'Amateur Radio.org', url: 'http://www.amateur-radio.org/' },
    ]
  },
];


export default function CARCLinksPage() {
  return (
    // Main container for the page content, centered and with consistent padding
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8"> {/* Increased space-y for category separation */}
      <h1 className="text-4xl font-extrabold text-blue-800 mb-6 text-center">
        Amateur Radio References
      </h1>

      {/* Map over the consolidated linkCategories data */}
      {linkCategories.map((category, categoryIndex) => (
        <section key={categoryIndex} className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-4">
          {/* Title for each group of references */}
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
            {category.title}
          </h2>

          {/* List of links for the current category */}
          <ul className="list-disc pl-5 space-y-2"> {/* Added left padding for disc bullet */}
            {category.links.map((link, linkIndex) => (
              <li key={`${category.title}-${linkIndex}`}> {/* More unique key for list items */}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium text-lg"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Footer message for additional links/corrections */}
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 text-center text-gray-700 leading-relaxed text-lg mt-8">
        <p>
          If there are additional links you would like to see on this page, or any
          corrections that you think should be made, please send an e-mail to:
          <br />
          <a href="mailto:info@CoastsideARC.org" className="text-blue-600 hover:underline font-medium">info@CoastsideARC.org</a>
        </p>
      </div>
    </div>
  );
}
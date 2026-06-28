// frontend/src/app/privacy-policy/page.tsx

import React from "react";
import Link from "next/link"; // Ensure Link is imported if you use it

export const metadata = {
  title: "CARC Privacy Policy",
  description: "The official Privacy Policy for the Coastside Amateur Radio Club (CARC), outlining data collection, sharing, and protection practices.",
};

export default function CARCPrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">


      {/* --- Privacy Policy Content --- */}
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Privacy Policy</h1>

        {/* Section: Introduction */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-3">Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Many organizations are required to publish their privacy policy on their websites to comply with various
            state, federal, and international regulations. As the Coastside Amateur Radio Club (CARC) is a non-commercial,
            interest-based club, our data collection and handling practices are designed to be straightforward and respect your privacy.
          </p>
        </div>

        {/* Section 1: What Personal Information Do We Collect? */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-3">1. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed">
            CARC collects personal information necessary for membership administration and club activities. This typically includes:
          </p>
          <ul className="list-disc list-inside text-gray-700 pl-4 space-y-2">
            <li>Your Full Name and Mailing Address</li>
            <li>Your Callsign (if licensed)</li>
            <li>Home Landline and Cell Phone Contact Numbers</li>
            <li>Your Amateur Radio License Class and Date Licensed</li>
            <li>Your membership status in related amateur radio organizations (e.g., ARRL, ARES, RACES, CERT)</li>
            <li>Your Email Address</li>
            <li>Your Packet Address (if applicable)</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Please note that if you renew your membership through PayPal, PayPal will collect your payment information
            separately. For details regarding their data practices, please refer to <a href="https://www.paypal.com/us/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PayPal's Privacy Statement</a>.
          </p>
        </div>

        {/* Section 2: Is Your Personal Information Shared With Others? */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-3">2. Information Sharing</h2>
          <p className="text-gray-700 leading-relaxed">
            We are committed to protecting your privacy. CARC does not share your personal membership information with any
            other organization, third party, or commercial entity.
          </p>
        </div>

        {/* Section 3: How Do We Protect Personal Information? */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-3">3. Data Security and Confidentiality</h2>
          <p className="text-gray-700 leading-relaxed">
            Your personal information is maintained with care by the CARC Board of Directors, who are responsible for
            its confidentiality, security, and integrity. Access to this information is restricted to authorized club officers
            for official club purposes only.
          </p>
        </div>

        {/* Section 4: Changes to CARC Privacy Statement */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-3">4. Updates to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            The CARC Board of Directors may update this Privacy Policy at any time to reflect changes in our practices
            or to comply with evolving regulations. Any revisions will be posted on this page.
          </p>
        </div>

        {/* Section 5: Membership Fee Disputes */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-3">5. Membership Fee Disputes</h2>
          <p className="text-gray-700 leading-relaxed">
            In the event of a dispute concerning membership dues collection, whether via PayPal or other methods,
            please contact a club officer directly for resolution. You can reach us at:
            <br />
            <a href="mailto:info@coastsideARC.org" className="text-blue-600 hover:underline font-medium">info@coastsideARC.org</a>.
          </p>
        </div>

        {/* Section 6: Questions or Suggestions */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-3">6. Questions or Suggestions</h2>
          <p className="text-gray-700 leading-relaxed">
            We welcome your questions and suggestions regarding this Privacy Policy or any other club matters.
            Please feel free to contact us at:
            <br />
            <a href="mailto:info@coastsideARC.org" className="text-blue-600 hover:underline font-medium">info@coastsideARC.org</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
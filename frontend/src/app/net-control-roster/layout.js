/* frontend/src/app/net-control-roster/layout.js */

//  This is a Server Component by default, so metadata can 
//  be defined here.
export const metadata = {
    title: "CARC Net Control Roster",
    description: "Monthly roster for CARC Wednesday Night Net control operators.",
};

export default function NetControlRosterLayout({ children }) {
  return (
    <>
      {children} {/* This renders the page.js content */}
    </>
  );
}

// frontend/src/app/exams/page.tsx

export const metadata = {
  title: "CARC Exams",
  description: "Listing of where exams may be given for CARC members.",
};

export default function CARCExamsPage() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Amateur Radio License Exams</h2>
      <p className="text-gray-700 mb-4">
        Currently, CARC does not administer Amateur Radio licese exams.
      </p>
      <p className="text-gray-700 mb-4">
        This page is intended to provide information about where CARC members
        can take their FCC Amateur Radio License Examinations, as there are
        several locations nearby that do offer these exams.
      </p>

      <ul className="list-disc pl-4 list-inside text-gray-800 space-y-2">
        <li>
          <b>San Bruno Amateur Radio Club (SBARC) :</b> Hosts exam sessions at
          the San Bruno Library. Check their website for the latest schedule.
        </li>

        <li>
          <b>Bay Area Amateur Radio Club (BAARC):</b> Holds exams at the Bay
          Area Community Center. They have a monthly schedule, so check their
          website for details.
        </li>

        <li>
          <b>San Mateo County Amateur Radio Association (SMCARA):</b> Offers
          exams at the San Mateo Public Library. They have a regular schedule,
          so check their website for details.
        </li>

        <li>
          <b>Millbrae Amateur Radio Club: </b>Hosts exam sessions at the
          Millbrae Library Meeting Room A. Note that these sessions require
          registration or calling ahead, as walk-ins are not permitted.
        </li>

        <li>
          <b>Palo Alto Amateur Radio Association</b> Offers online exams for all
          license levels. You need to register on their website or email the
          team for an appointment.
        </li>

        <li>
          <b>Silicon Valley VE Group:</b> Offers online exams for all license
          levels. You need to register on their website or email the team for an
          appointment.
        </li>

        <li>
          <b>Half Moon Bay Amateur Radio Club (HMBARC):</b>Holds meetings and
          discussions on the third Wednesday of every month at the Coastside
          Fire Protection District Station 40. While primarily focused on
          meetings, they are a good resource for information on getting a
          license and training. Check their website for upcoming dates and
          registration details.
        </li>

        <li>
          <b>San Francisco Amateur Radio Club (SFARC):</b>Located in San
          Francisco, they offer exams and training resources. They have a
          dedicated page for exam schedules.
        </li>

        <li>
          <b>Marin Amateur Radio Society:</b>Located in Mill Valley, they offer
          exams and training resources. They note a high pass rate for
          Technician Class exams, especially for those who attend their 
          &quot;HAM-CRAM&quot; sessions.
        </li>

        <li>
          <b>Mount Diablo Amateur Radio Club (MDARC):</b>Located in Walnut
          Creek, they offer exams and training resources. Check their website
          for more information on upcoming exam sessions.
        </li>
      </ul>
    </div>
  );
}

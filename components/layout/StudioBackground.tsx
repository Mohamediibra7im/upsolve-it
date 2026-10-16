/** Approved edge pattern. Static, low contrast, and kept behind page content. */
export default function StudioBackground() {
  return (
    <div className="studio-background" aria-hidden="true">
      <svg viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMin slice">
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M970 -60V82Q970 130 1018 130H1190Q1240 130 1240 180V330Q1240 380 1290 380H1490" />
          <path d="M1040 -60V46Q1040 88 1082 88H1240Q1294 88 1294 142V280Q1294 328 1342 328H1490" />
          <path d="M1110 -60V8Q1110 44 1146 44H1290Q1348 44 1348 102V232Q1348 276 1392 276H1490" />
          <path d="M-50 535H96Q145 535 145 584V730Q145 778 193 778H376Q424 778 424 826V1050" />
          <path d="M-50 588H48Q92 588 92 632V780Q92 830 142 830H325Q372 830 372 877V1050" />
          <path d="M-50 641H0Q40 641 40 681V832Q40 881 89 881H272Q320 881 320 929V1080" />
        </g>
        <g fill="hsl(var(--background))" stroke="currentColor">
          <circle cx="1240" cy="220" r="4" />
          <circle cx="1348" cy="160" r="4" />
          <circle cx="145" cy="655" r="4" />
          <circle cx="300" cy="830" r="4" />
        </g>
      </svg>
    </div>
  );
}

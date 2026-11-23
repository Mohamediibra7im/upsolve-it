"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0b0c0a",
          color: "#f2f4ec",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100dvh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <section
            role="alert"
            style={{ width: "100%", maxWidth: 440, textAlign: "left" }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
            >
              <rect width="40" height="40" rx="12" fill="#c8f52a" />
              <path
                d="M10 12v12a7 7 0 0 0 14 0V10m-6 6 6-6 6 6"
                stroke="#0b0c0a"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1
              style={{
                marginTop: 28,
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
              }}
            >
              Let’s try that again.
            </h1>
            <p
              style={{
                color: "#aab19d",
                fontSize: 15,
                lineHeight: 1.8,
                marginBottom: 28,
              }}
            >
              Upsolve It couldn’t load this time. Your practice will be here
              when you’re back.
            </p>
            <button
              onClick={reset}
              style={{
                border: 0,
                borderRadius: 8,
                background: "#c8f52a",
                color: "#0b0c0a",
                padding: "14px 24px",
                font: "inherit",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}

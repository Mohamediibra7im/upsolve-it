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
          background: "#101214",
          color: "#f1f3ee",
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
            style={{ width: "100%", maxWidth: 440, textAlign: "center" }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
            >
              <rect width="40" height="40" rx="12" fill="#b5e3c4" />
              <path
                d="M10 12v12a7 7 0 0 0 14 0V10m-6 6 6-6 6 6"
                stroke="#183123"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1
              style={{
                marginTop: 28,
                fontSize: 32,
                fontWeight: 500,
                letterSpacing: "-0.04em",
                lineHeight: 1.2,
              }}
            >
              Let’s try that again.
            </h1>
            <p
              style={{
                color: "#a0a8a4",
                fontSize: 15,
                lineHeight: 1.8,
                marginBottom: 28,
              }}
            >
              Upsolve.it couldn’t load this time. Your practice will be here
              when you’re back.
            </p>
            <button
              onClick={reset}
              style={{
                border: 0,
                borderRadius: 12,
                background: "#b5e3c4",
                color: "#183123",
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

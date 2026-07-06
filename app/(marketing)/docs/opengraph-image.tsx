import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "Upsolve.it - Platform Documentation and Guides";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  const montserratBold = readFileSync(
    join(process.cwd(), "app/fonts/Montserrat-Bold.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          position: "relative",
        }}
      >
        {/* Background Radial Glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle at 50% 50%, #007F5F12 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Corner Telemetry: Top Left */}
        <div style={{ position: "absolute", top: "40px", left: "40px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ color: "#007F5F", fontSize: "10px", fontWeight: 900, letterSpacing: "0.2em" }}>PLATFORM</span>
          <span style={{ color: "white", fontSize: "12px", fontWeight: 700 }}>UPSOLVE.IT // MANUAL</span>
        </div>

        {/* Corner Telemetry: Top Right */}
        <div style={{ position: "absolute", top: "40px", right: "40px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <span style={{ color: "#007F5F", fontSize: "10px", fontWeight: 900, letterSpacing: "0.2em" }}>SECTOR</span>
          <span style={{ color: "white", fontSize: "12px", fontWeight: 700 }}>CORE DOCUMENTATION</span>
        </div>

        {/* Corner Telemetry: Bottom Left */}
        <div style={{ position: "absolute", bottom: "40px", left: "40px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ color: "#007F5F", fontSize: "10px", fontWeight: 900, letterSpacing: "0.2em" }}>INTELLIGENCE</span>
          <span style={{ color: "white", fontSize: "12px", fontWeight: 700 }}>PRACTICE REDEFINED</span>
        </div>

        {/* Corner Telemetry: Bottom Right */}
        <div style={{ position: "absolute", bottom: "40px", right: "40px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <span style={{ color: "#007F5F", fontSize: "10px", fontWeight: 900, letterSpacing: "0.2em" }}>COMMUNITY</span>
          <span style={{ color: "white", fontSize: "12px", fontWeight: 700 }}>HNU - ICPC // 2026</span>
        </div>

        {/* Side Level Bars */}
        <div style={{ position: "absolute", left: "40px", top: "150px", bottom: "150px", width: '2px', backgroundColor: '#007F5F20', display: 'flex' }}>
          <div style={{ height: '85%', width: '100%', backgroundColor: '#007F5F', display: 'flex' }} />
        </div>
        <div style={{ position: "absolute", right: "40px", top: "150px", bottom: "150px", width: '2px', backgroundColor: '#007F5F20', display: 'flex' }}>
          <div style={{ height: '60%', width: '100%', backgroundColor: '#007F5F', display: 'flex' }} />
        </div>

        {/* Center Branding & Info Area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "25px",
            fontFamily: "Montserrat",
          }}
        >
          {/* Top Row: Brackets + Brand Name */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "50px", color: "#007F5F", fontWeight: 200, display: "flex", lineHeight: 1 }}>[</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
              <span style={{ fontSize: "36px", color: "white", letterSpacing: "0.02em" }}>UPSOLVE</span>
              <span style={{ fontSize: "36px", color: "#007F5F", letterSpacing: "0.02em", marginLeft: "4px" }}>.it</span>
            </div>
            <div style={{ fontSize: "50px", color: "#007F5F", fontWeight: 200, display: "flex", lineHeight: 1 }}>]</div>
          </div>

          {/* Main Title */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1 }}>
            <span style={{ fontSize: "85px", color: "white", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              DOCUMENTATION
            </span>
          </div>

          {/* Sub-badge: Protocol Badge */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#007F5F10",
              padding: "10px 40px",
              border: "1px solid #007F5F30",
              borderRadius: "4px",
            }}
          >
            <span style={{ fontSize: "16px", fontWeight: 900, color: "#007F5F", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              USER MANUAL & PROTOCOLS
            </span>
          </div>
        </div>

        {/* System Dashboard Bar */}
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            display: "flex",
            alignItems: "center",
            gap: "30px",
            backgroundColor: "#080808",
            padding: "8px 30px",
            borderRadius: "100px",
            border: "1px solid #ffffff05",
          }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#007F5F", display: "flex" }} />
            <span style={{ color: "#888", fontSize: "9px", fontWeight: 900, letterSpacing: "0.1em" }}>MANUAL: SECURE</span>
          </div>
          <div style={{ width: "1px", height: "10px", backgroundColor: "#333", display: "flex" }} />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ color: "#888", fontSize: "9px", fontWeight: 900, letterSpacing: "0.1em" }}>INDEX: SYNCD</span>
          </div>
          <div style={{ width: "1px", height: "10px", backgroundColor: "#333", display: "flex" }} />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ color: "#007F5F", fontSize: "9px", fontWeight: 900, letterSpacing: "0.1em" }}>STATUS: ACCESSIBLE</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Montserrat",
          data: montserratBold,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}

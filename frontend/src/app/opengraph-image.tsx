import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "MediBook — AI-Powered Hospital Booking"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blurred circles */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(59,130,246,0.15)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            right: "-60px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "rgba(16,185,129,0.12)",
            filter: "blur(60px)",
          }}
        />

        {/* Cross / medical icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "96px",
            height: "96px",
            borderRadius: "24px",
            background: "rgba(59,130,246,0.25)",
            border: "2px solid rgba(59,130,246,0.4)",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", position: "relative", width: "48px", height: "48px" }}>
            {/* Vertical bar */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "0",
                width: "10px",
                height: "48px",
                marginLeft: "-5px",
                background: "#60a5fa",
                borderRadius: "4px",
              }}
            />
            {/* Horizontal bar */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                height: "10px",
                width: "48px",
                marginTop: "-5px",
                background: "#60a5fa",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>

        {/* Brand */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "#f8fafc",
            letterSpacing: "-2px",
            marginBottom: "16px",
          }}
        >
          MediBook
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "26px",
            fontWeight: 400,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.4,
            marginBottom: "40px",
          }}
        >
          AI-Powered Hospital Appointment & Disease Prediction
        </div>

        {/* Pill tags */}
        <div style={{ display: "flex", gap: "16px" }}>
          {["AI Triage", "Right Specialist", "Instant Booking"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "10px 24px",
                borderRadius: "9999px",
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "#93c5fd",
                fontSize: "18px",
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}

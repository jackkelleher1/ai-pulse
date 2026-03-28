import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Indigo glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: 80,
            width: 700,
            height: 500,
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, transparent 65%)",
            display: "flex",
          }}
        />
        {/* Green glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: 160,
            width: 400,
            height: 300,
            background:
              "radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            display: "flex",
          }}
        />

        {/* Bottom fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: "linear-gradient(to top, #0a0a0a, transparent)",
            display: "flex",
          }}
        />

        {/* Corner brackets */}
        <div style={{ position: "absolute", top: 48, left: 28, width: 22, height: 22, borderLeft: "2px solid rgba(99,102,241,0.35)", borderTop: "2px solid rgba(99,102,241,0.35)", display: "flex" }} />
        <div style={{ position: "absolute", top: 48, right: 28, width: 22, height: 22, borderRight: "2px solid rgba(99,102,241,0.35)", borderTop: "2px solid rgba(99,102,241,0.35)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 28, left: 28, width: 22, height: 22, borderLeft: "2px solid rgba(99,102,241,0.35)", borderBottom: "2px solid rgba(99,102,241,0.35)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 28, right: 28, width: 22, height: 22, borderRight: "2px solid rgba(99,102,241,0.35)", borderBottom: "2px solid rgba(99,102,241,0.35)", display: "flex" }} />

        {/* Status strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 44px",
            height: 38,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(255,255,255,0.015)",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: 4, background: "#22c55e" }} />
            <span style={{ color: "#22c55e", fontSize: 11, letterSpacing: "0.18em" }}>SYS ONLINE</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, letterSpacing: "0.15em" }}>14 FEEDS ACTIVE</span>
          <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, letterSpacing: "0.15em" }}>MONITORING 24/7</span>
          <div style={{ flex: 1, display: "flex" }} />
          <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 10, letterSpacing: "0.25em" }}>UNCLASSIFIED</span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "44px 80px 56px",
          }}
        >
          {/* Op label */}
          <div
            style={{
              color: "rgba(255,255,255,0.18)",
              fontSize: 12,
              letterSpacing: "0.3em",
              marginBottom: 22,
              display: "flex",
            }}
          >
            OPERATION: AI-PULSE // INTEL AGGREGATION SYSTEM
          </div>

          {/* Title */}
          <div style={{ display: "flex", marginBottom: 6 }}>
            <span style={{ fontSize: 90, fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>The Situ</span>
            <span style={{ fontSize: 90, fontWeight: 800, color: "#6366f1", lineHeight: 1 }}>AI</span>
            <span style={{ fontSize: 90, fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>tion</span>
          </div>
          <div style={{ display: "flex", marginBottom: 28 }}>
            <span style={{ fontSize: 90, fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>Room.</span>
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.38)",
              lineHeight: 1.5,
              maxWidth: 700,
              marginBottom: 52,
              display: "flex",
            }}
          >
            Every AI signal that matters — research labs, news, arXiv, podcasts, markets — aggregated and ranked in real time.
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, alignSelf: "flex-start" }}>
            {[
              { label: "SOURCES", value: "14+" },
              { label: "CATEGORIES", value: "5" },
              { label: "TEMPO", value: "24/7" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 28px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  marginLeft: i > 0 ? -1 : 0,
                  background: "rgba(255,255,255,0.025)",
                  borderRadius:
                    i === 0 ? "8px 0 0 8px" : i === 2 ? "0 8px 8px 0" : "0",
                }}
              >
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: "0.22em", marginBottom: 5 }}>
                  {stat.label}
                </span>
                <span style={{ fontSize: 32, fontWeight: 700, color: "#ffffff" }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

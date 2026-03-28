"use client";

import Link from "next/link";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scales = {
    sm: { text: "text-sm",   icon: 28, stroke: 1.5 },
    md: { text: "text-base", icon: 36, stroke: 1.5 },
    lg: { text: "text-2xl",  icon: 52, stroke: 1.2 },
  };
  const s = scales[size];

  return (
    <Link href="/" className="flex items-center gap-2.5 group select-none">
      <div className="relative shrink-0" style={{ width: s.icon, height: s.icon }}>
        <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" width={s.icon} height={s.icon}>
          <circle cx="26" cy="26" r="22" fill="#6366f1" fillOpacity="0.08" />
          <circle cx="26" cy="26" r="22" stroke="#6366f1" strokeOpacity="0.15" strokeWidth="1" />
          <polyline
            points="4,26 12,26 16,14 20,38 24,18 28,34 32,26 48,26"
            stroke="#6366f1"
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ filter: "drop-shadow(0 0 4px #6366f188)", animation: "waveform 2s ease-in-out infinite" }}
          />
        </svg>
        <span className="absolute inset-0 rounded-full border border-accent/20 animate-pulse-ring" />
      </div>
      <div className={`font-semibold tracking-tight ${s.text}`}>
        <span className="text-white">AI</span>
        <span className="text-accent ml-1">PULSE</span>
      </div>
    </Link>
  );
}

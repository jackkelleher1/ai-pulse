import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#111111",
        "surface-2": "#1a1a1a",
        border: "#1e1e1e",
        accent: "#6366f1",
        "accent-hover": "#4f46e5",
      },
      animation: {
        "fade-up":    "fade-up 0.5s ease forwards",
        "fade-in":    "fade-in 0.4s ease forwards",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "scan":       "scan 8s linear infinite",
        "shimmer":    "shimmer 2.5s linear infinite",
        "waveform":   "waveform 2s ease-in-out infinite",
        "float":      "float 6s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(1)",   opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "scan": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "waveform": {
          "0%, 100%": { d: "path('M0,12 L8,12 L12,4 L16,20 L20,8 L24,16 L28,12 L40,12')" },
          "50%":      { d: "path('M0,12 L8,12 L12,2 L16,22 L20,6 L24,18 L28,12 L40,12')" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

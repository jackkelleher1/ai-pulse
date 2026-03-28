import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "AI Pulse — Situation Room for AI",
  description: "Monitor the AI landscape in real time. Signals from Reddit, arXiv, Hacker News, podcasts, and top creators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-white min-h-screen">
        <TopNav />
        <main>{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";

const SITE_URL = "https://ai-pulse-rho-three.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AI Pulse — The SituAItion Room",
  description:
    "Every AI signal that matters — research labs, news, arXiv, podcasts, and markets — aggregated and ranked in real time.",
  openGraph: {
    title: "The SituAItion Room",
    description:
      "Every AI signal that matters — research labs, news, arXiv, podcasts, and markets — aggregated and ranked in real time.",
    url: SITE_URL,
    siteName: "AI Pulse",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AI Pulse — The SituAItion Room",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The SituAItion Room",
    description:
      "Every AI signal that matters — aggregated and ranked in real time.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-white min-h-screen">
        <TopNav />
        <main className="pb-20 md:pb-0">{children}</main>
      </body>
    </html>
  );
}

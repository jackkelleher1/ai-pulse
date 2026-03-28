"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/",           label: "Situation Room" },
  { href: "/reddit",     label: "Reddit" },
  { href: "/creators",   label: "Creators" },
  { href: "/podcasts",   label: "Podcasts" },
  { href: "/discover",   label: "Discover" },
  { href: "/investing",  label: "Investing" },
];

export default function TopNav() {
  const pathname = usePathname();
  const [signalCount, setSignalCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/content?limit=1")
      .then(r => r.json())
      .then(d => setSignalCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? "border-border bg-[#0a0a0a]/95 backdrop-blur-md" : "border-transparent bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
        <Logo size="sm" />

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pathname === href
                  ? "text-white bg-white/8"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          {signalCount > 0 && (
            <span className="hidden sm:block text-xs font-mono text-gray-600">
              {signalCount.toLocaleString()} signals
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center justify-center w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold tracking-widest uppercase">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}

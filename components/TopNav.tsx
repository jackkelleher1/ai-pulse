"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Radio, TrendingUp, BookOpen, Rocket, Mic2,
  Compass, Users, Search, Briefcase,
} from "lucide-react";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/",          label: "Situation Room", short: "Intel",     Icon: Radio },
  { href: "/investing", label: "Investing",       short: "Invest",    Icon: TrendingUp },
  { href: "/learn",     label: "Learn",           short: "Learn",     Icon: BookOpen },
  { href: "/startups",  label: "Startups",        short: "Startups",  Icon: Rocket },
  { href: "/podcasts",  label: "Podcasts",        short: "Podcasts",  Icon: Mic2 },
  { href: "/discover",  label: "Discover",        short: "Discover",  Icon: Compass },
  { href: "/creators",  label: "Creators",        short: "Creators",  Icon: Users },
  { href: "/services",  label: "Services",        short: "Services",  Icon: Briefcase },
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

  const bg = scrolled
    ? "border-border bg-[#0a0a0a]/95 backdrop-blur-md"
    : "border-transparent bg-transparent";

  return (
    <>
      <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${bg}`}>
        {/* ── Main row ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Logo size="sm" />

          {/* Desktop nav */}
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
            {/* Search icon — navigates to home where SearchBar lives */}
            <Link
              href="/?search=1"
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </Link>
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

      {/* ── Mobile bottom nav bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/[0.08] safe-area-pb">
        <div className="flex items-center justify-around px-1 h-14">
          {NAV.map(({ href, short, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full transition-all ${
                  active ? "text-white" : "text-gray-600 active:text-gray-300"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-accent" : ""}`} />
                <span className={`text-[9px] font-medium leading-none truncate ${active ? "text-accent" : ""}`}>
                  {short}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

    </>
  );
}

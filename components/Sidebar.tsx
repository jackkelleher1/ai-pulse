"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Home, MessageSquare, Users, Radio, Telescope } from "lucide-react";

const NAV = [
  { href: "/",          label: "Situation Room", icon: Home },
  { href: "/reddit",    label: "Reddit",         icon: MessageSquare },
  { href: "/creators",  label: "Creators",       icon: Users },
  { href: "/podcasts",  label: "Podcasts",       icon: Radio },
  { href: "/discover",  label: "Discover",       icon: Telescope },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0 flex flex-col border-r border-border h-screen sticky top-0 bg-[#0a0a0a]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
        <div className="relative w-6 h-6 rounded-md bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
          <Zap className="w-3.5 h-3.5 text-white fill-white" />
        </div>
        <span className="font-semibold text-white text-sm tracking-tight">AI Pulse</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 ${
                active
                  ? "bg-accent/10 text-accent font-semibold"
                  : "text-gray-600 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="px-4 py-4 border-t border-border space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono text-gray-600">LIVE</span>
        </div>
        <p className="text-xs text-gray-700 font-mono">5 sources monitored</p>
        <p className="text-xs text-gray-700 font-mono">Refresh @ 08:00 UTC</p>
      </div>
    </aside>
  );
}

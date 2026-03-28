"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Home, MessageSquare, Users, Radio, Telescope, RefreshCw } from "lucide-react";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/reddit", label: "Reddit", icon: MessageSquare },
  { href: "/creators", label: "Creators", icon: Users },
  { href: "/podcasts", label: "Podcasts", icon: Radio },
  { href: "/discover", label: "Discover", icon: Telescope },
];

export default function Sidebar() {
  const pathname = usePathname();

  async function handleRefresh() {
    await fetch("/api/refresh");
    window.location.reload();
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-border bg-surface h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="font-bold text-white tracking-tight">AI Pulse</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-accent/15 text-accent"
                  : "text-gray-400 hover:text-gray-200 hover:bg-surface-2"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Refresh button */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleRefresh}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-surface-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh feed
        </button>
      </div>
    </aside>
  );
}

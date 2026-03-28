"use client";

import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import type { ContentItem } from "@/types/database";

const SOURCE_DOT: Record<string, string> = {
  reddit:            "bg-orange-400",
  hackernews:        "bg-yellow-400",
  arxiv:             "bg-pink-400",
  x:                 "bg-sky-400",
  podcast_allin:     "bg-purple-400",
  podcast_moonshots: "bg-emerald-400",
};

const SOURCE_LABEL: Record<string, string> = {
  reddit:            "Reddit",
  hackernews:        "HN",
  arxiv:             "arXiv",
  x:                 "X",
  podcast_allin:     "All-In",
  podcast_moonshots: "Moonshots",
};

export default function ScrollingTicker({ items }: { items: ContentItem[] }) {
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  if (items.length === 0) return null;

  const duration = items.length * 4; // ~4s per item

  return (
    <div
      className="relative h-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      {/* Scrolling container */}
      <div
        ref={containerRef}
        className="flex flex-col gap-2"
        style={{
          animation: `ticker-scroll ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {doubled.map((item, i) => (
          <TickerItem key={`${item.id}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function TickerItem({ item }: { item: ContentItem }) {
  const dot = SOURCE_DOT[item.source] ?? "bg-gray-400";
  const label = SOURCE_LABEL[item.source] ?? item.source;
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-surface/60 hover:bg-surface border border-border hover:border-accent/20 rounded-xl p-3.5 transition-all duration-200 backdrop-blur-sm shrink-0"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
        <span className="text-xs font-mono text-gray-600 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-mono text-gray-700 ml-auto">{timeAgo}</span>
      </div>
      <p className="text-xs text-gray-300 group-hover:text-white leading-snug line-clamp-2 transition-colors">
        {item.title}
      </p>
    </a>
  );
}

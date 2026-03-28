"use client";

import { TrendingUp } from "lucide-react";

interface TrendingTopic {
  topic: string;
  mention_count: number;
  sources: string[];
}

export default function TrendingBar({ topics }: { topics: TrendingTopic[] }) {
  if (!topics.length) return null;

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
      <div className="flex items-center gap-1.5 shrink-0 text-accent">
        <TrendingUp className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Trending</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto">
        {topics.map((t) => (
          <button
            key={t.topic}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border hover:border-accent/50 hover:bg-accent/10 text-xs text-gray-300 hover:text-accent transition-all"
          >
            <span>{t.topic}</span>
            <span className="text-gray-600 font-mono">{t.mention_count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

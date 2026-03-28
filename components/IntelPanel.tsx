"use client";

import { Radio } from "lucide-react";
import XPost from "@/components/XPost";
import type { ContentItem } from "@/types/database";

interface TrendingTopic {
  topic: string;
  mention_count: number;
  sources: string[];
}

interface IntelPanelProps {
  tweets: ContentItem[];
  trending: TrendingTopic[];
}

// Deterministic pseudo-random sparkline from topic name seed
function sparklinePath(seed: string, width = 56, height = 16, points = 8): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  const rand = (n: number) => {
    h = (Math.imul(1664525, h) + 1013904223) | 0;
    return ((h >>> 0) % n);
  };

  const ys = Array.from({ length: points }, () => rand(100));
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;

  const coords = ys.map((y, i) => {
    const x = (i / (points - 1)) * width;
    const ny = height - ((y - min) / range) * (height - 2) - 1;
    return `${x.toFixed(1)},${ny.toFixed(1)}`;
  });

  return `M${coords.join(" L")}`;
}

function Sparkline({ seed, trending }: { seed: string; trending: boolean }) {
  const path = sparklinePath(seed);
  const color = trending ? "#6366f1" : "#374151";
  return (
    <svg width="56" height="16" viewBox="0 0 56 16" fill="none" className="shrink-0 opacity-70">
      <path d={path} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function IntelPanel({ tweets, trending }: IntelPanelProps) {
  return (
    <div className="space-y-6">

      {/* Field intercept */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3.5 bg-sky-400 rounded-sm" />
            <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-[0.2em]">
              FIELD INTERCEPT
            </span>
            <span className="text-[9px] font-mono text-gray-800">// @chamath</span>
          </div>
          <a
            href="https://x.com/chamath"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-gray-800 hover:text-sky-400 transition-colors uppercase tracking-widest"
          >
            follow ↗
          </a>
        </div>

        {tweets.length === 0 ? (
          <p className="text-[10px] font-mono text-gray-800 px-1 uppercase tracking-widest">NO INTERCEPTS</p>
        ) : (
          <div className="rounded-xl border border-[#2f3336] bg-[#000000] overflow-hidden backdrop-blur-sm">
            {tweets.map((tweet) => (
              <XPost key={tweet.id} item={tweet} />
            ))}
          </div>
        )}
      </div>

      {/* Watch list */}
      {trending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-3.5 bg-accent rounded-sm" />
            <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-[0.2em]">
              ACTIVE WATCH LIST
            </span>
            <Radio className="w-3 h-3 text-gray-800 ml-auto" />
          </div>
          <div className="space-y-0.5 rounded-xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-sm overflow-hidden p-1">
            {trending.slice(0, 8).map((t, i) => (
              <div
                key={t.topic}
                className="flex items-center gap-2.5 px-2 py-2 rounded hover:bg-white/[0.04] transition-colors group cursor-default"
              >
                <span className="text-[10px] font-mono text-gray-800 w-4 text-right tabular-nums shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div className={`w-0.5 h-3.5 rounded-full shrink-0 ${i < 3 ? "bg-accent/60" : "bg-white/10"}`} />
                <span className="flex-1 text-sm text-gray-400 group-hover:text-white transition-colors truncate">{t.topic}</span>
                <Sparkline seed={t.topic} trending={i < 3} />
                <div className="flex items-center gap-1.5 shrink-0">
                  {t.sources.length > 1 && (
                    <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">
                      {t.sources.length}src
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-gray-700 tabular-nums">{t.mention_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

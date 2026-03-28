"use client";

import { TrendingUp } from "lucide-react";
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

export default function IntelPanel({ tweets, trending }: IntelPanelProps) {
  return (
    <div className="space-y-6">
      {/* Chamath on X */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
              Chamath on X
            </span>
          </div>
          <a
            href="https://x.com/chamath"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-700 hover:text-sky-400 transition-colors font-mono"
          >
            follow ↗
          </a>
        </div>

        {tweets.length === 0 ? (
          <p className="text-xs text-gray-700 px-1 font-mono">No recent posts.</p>
        ) : (
          <div className="rounded-xl border border-[#2f3336] bg-[#000000] overflow-hidden">
            {tweets.map((tweet) => (
              <XPost key={tweet.id} item={tweet} />
            ))}
          </div>
        )}
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
              Trending Signals
            </span>
          </div>
          <div className="space-y-0.5">
            {trending.slice(0, 8).map((t, i) => (
              <div
                key={t.topic}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface transition-colors group cursor-default"
              >
                <span className="text-xs font-mono text-gray-700 w-4 text-right tabular-nums">{i + 1}</span>
                <span className="flex-1 text-sm text-gray-300 group-hover:text-white transition-colors">{t.topic}</span>
                <div className="flex items-center gap-1.5">
                  {t.sources.length > 1 && (
                    <span className="text-xs text-accent font-mono bg-accent/10 px-1.5 py-0.5 rounded">
                      {t.sources.length} src
                    </span>
                  )}
                  <span className="text-xs font-mono text-gray-700 tabular-nums">{t.mention_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

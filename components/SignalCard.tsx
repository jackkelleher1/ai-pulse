"use client";

import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Flame, Zap, Circle } from "lucide-react";
import { detectCategory, getUrgency, CATEGORY_CONFIG } from "@/lib/utils/categories";
import type { ContentItem } from "@/types/database";

const SOURCE_LABELS: Record<string, string> = {
  reddit:            "Reddit",
  hackernews:        "HN",
  arxiv:             "arXiv",
  podcast_allin:     "All-In",
  podcast_moonshots: "Moonshots",
  x:                 "X",
  linkedin:          "LinkedIn",
};

export default function SignalCard({ item, featured = false }: { item: ContentItem; featured?: boolean }) {
  const category = detectCategory(item.title, item.summary);
  const urgency  = getUrgency(item.published_at, item.score, item.source);
  const cat      = CATEGORY_CONFIG[category];

  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";

  if (featured) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col gap-3 p-4 rounded-xl bg-surface border border-border hover:border-accent/30 transition-all duration-200 overflow-hidden"
      >
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${cat.color.replace("text-", "bg-")}`} />
        <div className="flex items-center gap-2 flex-wrap">
          {urgency === "breaking" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 uppercase tracking-wider">
              <Circle className="w-1.5 h-1.5 fill-red-400 animate-pulse" /> Breaking
            </span>
          )}
          {urgency === "hot" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20">
              <Flame className="w-3 h-3" /> Hot
            </span>
          )}
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cat.bg} ${cat.color}`}>
            {cat.label}
          </span>
          <span className="ml-auto text-xs font-mono text-gray-600">{timeAgo}</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-100 group-hover:text-white leading-snug transition-colors line-clamp-2">
          {item.title}
        </h3>
        {item.summary && (
          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{item.summary}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-700 uppercase">{SOURCE_LABELS[item.source] ?? item.source}</span>
            {item.score > 0 && (
              <><span className="text-gray-800">·</span><span className="text-xs font-mono text-gray-700">{item.score.toLocaleString()} pts</span></>
            )}
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-700 group-hover:text-accent transition-colors" />
        </div>
      </a>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-surface border border-transparent hover:border-border transition-all duration-150"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {urgency === "breaking" && (
            <span className="flex items-center gap-0.5 text-xs font-bold text-red-400 uppercase tracking-wider">
              <Circle className="w-1.5 h-1.5 fill-red-400 animate-pulse" /> Breaking
            </span>
          )}
          {urgency === "hot"  && <Flame className="w-3 h-3 text-orange-400 shrink-0" />}
          {urgency === "new"  && <Zap   className="w-3 h-3 text-accent shrink-0" />}
          <span className={`text-xs font-medium ${cat.color}`}>{cat.label}</span>
          <span className="text-gray-700 text-xs">·</span>
          <span className="text-xs font-mono text-gray-700 uppercase">{SOURCE_LABELS[item.source] ?? item.source}</span>
          <span className="text-xs font-mono text-gray-700 ml-auto shrink-0">{timeAgo}</span>
        </div>
        <h3 className="text-sm text-gray-300 group-hover:text-white leading-snug line-clamp-2 transition-colors">
          {item.title}
        </h3>
        {item.score > 0 && <p className="text-xs font-mono text-gray-700 mt-1">{item.score.toLocaleString()} pts</p>}
      </div>
      <ExternalLink className="w-3 h-3 text-gray-800 group-hover:text-gray-500 shrink-0 mt-1 transition-colors" />
    </a>
  );
}

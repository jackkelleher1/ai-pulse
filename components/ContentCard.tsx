"use client";

import { formatDistanceToNow } from "date-fns";
import { ExternalLink, TrendingUp } from "lucide-react";
import type { ContentItem, Source } from "@/types/database";

const SOURCE_CONFIG: Record<Source, { label: string; dot: string }> = {
  reddit:            { label: "Reddit",    dot: "bg-orange-400" },
  x:                 { label: "X",         dot: "bg-sky-400" },
  linkedin:          { label: "LinkedIn",  dot: "bg-blue-400" },
  podcast_allin:     { label: "All-In",    dot: "bg-purple-400" },
  podcast_moonshots: { label: "Moonshots", dot: "bg-emerald-400" },
  hackernews:        { label: "HN",        dot: "bg-yellow-400" },
  arxiv:             { label: "arXiv",     dot: "bg-pink-400" },
};

export default function ContentCard({ item }: { item: ContentItem }) {
  const config  = SOURCE_CONFIG[item.source] ?? { label: item.source, dot: "bg-gray-400" };
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 p-3.5 rounded-xl hover:bg-surface border border-transparent hover:border-border transition-all duration-150"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
          <span className="text-xs text-gray-600">{config.label}</span>
          {item.author && <span className="text-xs text-gray-700 truncate">{item.author}</span>}
          <span className="text-xs text-gray-700 ml-auto shrink-0">{timeAgo}</span>
        </div>
        <h3 className="text-sm font-medium text-gray-200 group-hover:text-white leading-snug line-clamp-2 transition-colors">
          {item.title}
        </h3>
        {item.summary && (
          <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">{item.summary}</p>
        )}
        {item.score > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp className="w-3 h-3 text-gray-700" />
            <span className="text-xs text-gray-700">{item.score.toLocaleString()}</span>
          </div>
        )}
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 shrink-0 mt-0.5 transition-colors" />
    </a>
  );
}

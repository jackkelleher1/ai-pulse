"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  MessageSquare,
  TrendingUp,
  Radio,
  FlaskConical,
  Flame,
  User,
} from "lucide-react";
import type { ContentItem, Source } from "@/types/database";

const SOURCE_CONFIG: Record<
  Source,
  { label: string; color: string; icon: React.ReactNode }
> = {
  reddit: {
    label: "Reddit",
    color: "text-orange-400 bg-orange-400/10",
    icon: <Flame className="w-3 h-3" />,
  },
  x: {
    label: "X",
    color: "text-sky-400 bg-sky-400/10",
    icon: <User className="w-3 h-3" />,
  },
  linkedin: {
    label: "LinkedIn",
    color: "text-blue-400 bg-blue-400/10",
    icon: <User className="w-3 h-3" />,
  },
  podcast_allin: {
    label: "All-In",
    color: "text-purple-400 bg-purple-400/10",
    icon: <Radio className="w-3 h-3" />,
  },
  podcast_moonshots: {
    label: "Moonshots",
    color: "text-emerald-400 bg-emerald-400/10",
    icon: <Radio className="w-3 h-3" />,
  },
  hackernews: {
    label: "HN",
    color: "text-yellow-400 bg-yellow-400/10",
    icon: <TrendingUp className="w-3 h-3" />,
  },
  arxiv: {
    label: "arXiv",
    color: "text-pink-400 bg-pink-400/10",
    icon: <FlaskConical className="w-3 h-3" />,
  },
};

export default function ContentCard({ item }: { item: ContentItem }) {
  const config = SOURCE_CONFIG[item.source] ?? {
    label: item.source,
    color: "text-gray-400 bg-gray-400/10",
    icon: <MessageSquare className="w-3 h-3" />,
  };

  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "Unknown time";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-surface hover:bg-surface-2 border border-border hover:border-accent/40 rounded-xl p-4 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}
            >
              {config.icon}
              {config.label}
            </span>
            {item.author && (
              <span className="text-xs text-gray-500">{item.author}</span>
            )}
            <span className="text-xs text-gray-600 ml-auto">{timeAgo}</span>
          </div>

          <h3 className="text-sm font-medium text-gray-100 group-hover:text-white leading-snug line-clamp-2 mb-1">
            {item.title}
          </h3>

          {item.summary && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>
          )}

          {item.score > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-accent" />
              <span className="text-xs text-gray-500">
                {item.score.toLocaleString()} points
              </span>
            </div>
          )}
        </div>

        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-accent shrink-0 mt-0.5 transition-colors" />
      </div>
    </a>
  );
}

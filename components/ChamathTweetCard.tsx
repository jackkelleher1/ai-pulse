"use client";

import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import type { ContentItem } from "@/types/database";

export default function ChamathTweetCard({ item }: { item: ContentItem }) {
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 p-3 rounded-xl hover:bg-surface-2 border border-transparent hover:border-sky-400/20 transition-all duration-200"
    >
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
        C
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-sky-400">@chamath</span>
          <span className="text-xs text-gray-600">{timeAgo}</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-4 group-hover:text-gray-200 transition-colors">
          {item.summary ?? item.title}
        </p>
      </div>

      <ExternalLink className="w-3.5 h-3.5 text-gray-700 group-hover:text-sky-400 shrink-0 mt-0.5 transition-colors" />
    </a>
  );
}

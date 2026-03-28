"use client";

import { formatDistanceToNow } from "date-fns";
import { Radio, Play, ExternalLink } from "lucide-react";
import type { ContentItem } from "@/types/database";

export default function PodcastCard({ item }: { item: ContentItem }) {
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";

  const podcastLabel =
    item.source === "podcast_allin" ? "All-In Podcast" : "Moonshots Podcast";
  const podcastColor =
    item.source === "podcast_allin"
      ? "text-purple-400 bg-purple-400/10 border-purple-400/20"
      : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";

  return (
    <div className={`rounded-xl border bg-surface p-4 ${podcastColor.includes("purple") ? "border-purple-400/10" : "border-emerald-400/10"}`}>
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${podcastColor}`}
        >
          <Radio className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-xs font-medium ${podcastColor.split(" ")[0]}`}>
              {podcastLabel}
            </span>
            <span className="text-xs text-gray-600">{timeAgo}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-100 leading-snug mb-1">
            {item.title}
          </h3>
          {item.summary && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {item.summary}
            </p>
          )}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            <Play className="w-3 h-3" />
            Listen to episode
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

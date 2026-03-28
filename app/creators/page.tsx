import { supabase } from "@/lib/supabase";
import { Users, ExternalLink, Heart, Repeat2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ContentItem } from "@/types/database";

export const revalidate = 1800;

const CREATOR_ORDER = ["chamath", "sama", "karpathy", "elonmusk"];

export default async function CreatorsPage() {
  const { data } = await supabase
    .from("content_items")
    .select("*")
    .eq("source", "x")
    .order("published_at", { ascending: false })
    .limit(60);

  const items = (data ?? []) as ContentItem[];

  // Group by author handle
  const grouped: Record<string, ContentItem[]> = {};
  for (const item of items) {
    const handle = (item.tags as string[]).find((t) => t !== "x" && t !== "twitter") ?? "unknown";
    if (!grouped[handle]) grouped[handle] = [];
    grouped[handle].push(item);
  }

  const handles = CREATOR_ORDER.filter((h) => grouped[h]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-sky-500/15 flex items-center justify-center">
          <Users className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Creators</h1>
          <p className="text-xs text-gray-500">Latest posts from AI thought leaders</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-gray-500">
          No posts yet — trigger a refresh to load X posts.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {handles.map((handle) => (
            <section key={handle}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-sky-400">𝕏</span>
                </div>
                <h2 className="text-sm font-semibold text-white">
                  @{handle}
                </h2>
                <a
                  href={`https://x.com/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-600 hover:text-sky-400 transition-colors" />
                </a>
              </div>
              <div className="space-y-2">
                {grouped[handle].slice(0, 8).map((item) => (
                  <XPostCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function XPostCard({ item }: { item: ContentItem }) {
  const metrics = item.raw_data as { like_count?: number; retweet_count?: number } | null;
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-surface hover:bg-surface-2 border border-border hover:border-sky-400/30 rounded-xl p-3 transition-all"
    >
      <p className="text-sm text-gray-200 leading-relaxed mb-2 line-clamp-4">
        {item.summary}
      </p>
      <div className="flex items-center gap-3 text-xs text-gray-600">
        <span>{timeAgo}</span>
        {metrics?.like_count != null && (
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {metrics.like_count.toLocaleString()}
          </span>
        )}
        {metrics?.retweet_count != null && (
          <span className="flex items-center gap-1">
            <Repeat2 className="w-3 h-3" />
            {metrics.retweet_count.toLocaleString()}
          </span>
        )}
      </div>
    </a>
  );
}

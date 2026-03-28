import { supabase } from "@/lib/supabase";
import ContentCard from "@/components/ContentCard";
import TrendingBar from "@/components/TrendingBar";
import type { ContentItem } from "@/types/database";

async function getTrending() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/trending`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.trending ?? [];
  } catch {
    return [];
  }
}

async function getLatestContent() {
  const { data } = await supabase
    .from("content_items")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(40);
  return (data ?? []) as ContentItem[];
}

async function getStats() {
  const { data } = await supabase
    .from("content_items")
    .select("source")
    .limit(1000) as unknown as { data: { source: string }[] | null };

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.source] = (counts[row.source] ?? 0) + 1;
  }
  return counts;
}

export default async function HomePage() {
  const [trending, items, stats] = await Promise.all([
    getTrending(),
    getLatestContent(),
    getStats(),
  ]);

  const totalItems = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">AI Pulse</h1>
        <p className="text-sm text-gray-500">
          {totalItems.toLocaleString()} stories aggregated from across the AI
          universe
        </p>
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-surface border border-border">
          <TrendingBar topics={trending} />
        </div>
      )}

      {/* Stats bar */}
      {totalItems > 0 && (
        <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-1">
          {Object.entries(stats).map(([source, count]) => (
            <div key={source} className="shrink-0 text-center">
              <div className="text-lg font-bold text-white">{count}</div>
              <div className="text-xs text-gray-500 capitalize">
                {source.replace("podcast_", "")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feed */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">No content yet.</p>
          <p className="text-sm text-gray-600">
            Trigger a refresh to pull in the latest AI content.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Latest
          </h2>
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

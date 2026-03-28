import { supabase } from "@/lib/supabase";
import ContentCard from "@/components/ContentCard";
import { Telescope, FlaskConical, TrendingUp } from "lucide-react";
import type { ContentItem } from "@/types/database";

export const revalidate = 3600;

export default async function DiscoverPage() {
  const [arxivRes, hnRes] = await Promise.all([
    supabase
      .from("content_items")
      .select("*")
      .eq("source", "arxiv")
      .order("published_at", { ascending: false })
      .limit(20),
    supabase
      .from("content_items")
      .select("*")
      .eq("source", "hackernews")
      .order("score", { ascending: false })
      .limit(20),
  ]);

  const arxivItems = (arxivRes.data ?? []) as ContentItem[];
  const hnItems = (hnRes.data ?? []) as ContentItem[];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-pink-500/15 flex items-center justify-center">
          <Telescope className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Discover</h1>
          <p className="text-xs text-gray-500">Research papers · Hacker News</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ArXiv */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-4 h-4 text-pink-400" />
            <h2 className="text-sm font-semibold text-pink-400 uppercase tracking-wider">
              Latest Papers
            </h2>
          </div>
          {arxivItems.length === 0 ? (
            <p className="text-sm text-gray-600">No papers yet.</p>
          ) : (
            <div className="space-y-3">
              {arxivItems.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Hacker News */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
              Hacker News AI
            </h2>
          </div>
          {hnItems.length === 0 ? (
            <p className="text-sm text-gray-600">No stories yet.</p>
          ) : (
            <div className="space-y-3">
              {hnItems.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

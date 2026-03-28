import { supabase } from "@/lib/supabase";
import PodcastCard from "@/components/PodcastCard";
import { Radio } from "lucide-react";
import type { ContentItem } from "@/types/database";

export const revalidate = 3600;

export default async function PodcastsPage() {
  const { data } = await supabase
    .from("content_items")
    .select("*")
    .in("source", ["podcast_allin", "podcast_moonshots"])
    .order("published_at", { ascending: false })
    .limit(40);

  const items = (data ?? []) as ContentItem[];
  const allIn = items.filter((i) => i.source === "podcast_allin");
  const moonshots = items.filter((i) => i.source === "podcast_moonshots");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
          <Radio className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Podcasts</h1>
          <p className="text-xs text-gray-500">All-In · Moonshots with Peter Diamandis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All-In */}
        <section>
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-3">
            All-In Podcast
          </h2>
          {allIn.length === 0 ? (
            <p className="text-sm text-gray-600">No episodes yet.</p>
          ) : (
            <div className="space-y-3">
              {allIn.map((item) => (
                <PodcastCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Moonshots */}
        <section>
          <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            Moonshots Podcast
          </h2>
          {moonshots.length === 0 ? (
            <p className="text-sm text-gray-600">No episodes yet.</p>
          ) : (
            <div className="space-y-3">
              {moonshots.map((item) => (
                <PodcastCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

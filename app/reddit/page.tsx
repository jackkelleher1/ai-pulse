import { supabase } from "@/lib/supabase";
import ContentCard from "@/components/ContentCard";
import { Flame } from "lucide-react";
import type { ContentItem } from "@/types/database";

export const revalidate = 1800;

export default async function RedditPage() {
  const { data } = await supabase
    .from("content_items")
    .select("*")
    .eq("source", "reddit")
    .order("score", { ascending: false })
    .limit(50);

  const items = (data ?? []) as ContentItem[];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Reddit AI Feed</h1>
          <p className="text-xs text-gray-500">
            r/artificial · r/MachineLearning · r/LocalLLaMA · r/singularity
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No Reddit posts yet — trigger a refresh to load content.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

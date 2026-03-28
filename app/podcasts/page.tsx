import { supabase } from "@/lib/supabase";
import { Radio, ExternalLink, Clock, Sparkles, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ContentItem } from "@/types/database";

export const revalidate = 3600;

const PODCAST_META: Record<string, { name: string; color: string; accent: string; accentHex: string; gradient: string; host: string; initials: string; description: string; artwork: string }> = {
  podcast_allin: {
    name: "All-In Podcast",
    host: "Chamath · Sacks · Friedberg · Calacanis",
    description: "Four friends debate the biggest news in tech, politics, and business.",
    color: "border-purple-400/30",
    accent: "text-purple-400",
    accentHex: "#a855f8",
    gradient: "from-purple-600 to-indigo-700",
    initials: "AI",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts124/v4/c7/d2/92/c7d292ea-44b3-47ff-2f5e-74fa5b23db6c/mza_7005270671777648882.png/1200x1200bb.jpg",
  },
  podcast_moonshots: {
    name: "Moonshots with Peter Diamandis",
    host: "Peter Diamandis",
    description: "Exponential tech, longevity, space, and the entrepreneurs making it happen.",
    color: "border-emerald-400/30",
    accent: "text-emerald-400",
    accentHex: "#34d399",
    gradient: "from-emerald-600 to-teal-700",
    initials: "MS",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/db/93/ed/db93ed1e-0cc1-8c0d-0788-b987040bf98d/mza_12828457162931711615.jpg/1200x1200bb.jpg",
  },
};

function SpotlightCard({ item }: { item: ContentItem }) {
  const meta = PODCAST_META[item.source] ?? PODCAST_META.podcast_allin;
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative rounded-xl overflow-hidden flex flex-col border border-white/10 hover:border-white/20 transition-all"
    >
      {/* Artwork hero — image + dark gradient overlay */}
      <div className="relative h-52 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.artwork}
          alt={meta.name}
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700"
        />
        {/* Gradient overlays for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />

        {/* Content on top of image */}
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">
              {meta.name}
            </span>
            <span className="text-xs font-mono text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
              Latest Episode
            </span>
          </div>
          <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-white/90 transition-colors">
            {item.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="bg-[#0d0d0d] px-5 py-4 flex-1 flex flex-col gap-3">
        {item.summary && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {item.summary}
          </p>
        )}
        <div className="flex items-center gap-3 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
          <span className="text-gray-800">·</span>
          <span className="text-xs text-gray-600 truncate">{meta.host}</span>
          <div className={`ml-auto flex items-center gap-1.5 text-xs font-medium ${meta.accent} opacity-0 group-hover:opacity-100 transition-opacity shrink-0`}>
            <Play className="w-3 h-3" /> Listen
          </div>
        </div>
      </div>
    </a>
  );
}

function EpisodeRow({ item }: { item: ContentItem }) {
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";
  const meta = PODCAST_META[item.source] ?? PODCAST_META.podcast_allin;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 px-5 py-3.5 border-b border-[#1e2124] last:border-0 hover:bg-white/[0.025] transition-colors"
    >
      <div className={`w-8 h-8 rounded-lg shrink-0 bg-gradient-to-br ${meta.gradient} flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity`}>
        <span className="text-xs font-bold text-white/90">{meta.initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm text-gray-300 group-hover:text-white leading-snug line-clamp-1 transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-700">
          <span className={`${meta.accent} opacity-60 text-xs`}>{meta.name.split(" ")[0]}</span>
          <span className="text-gray-800">·</span>
          <span>{timeAgo}</span>
        </div>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-800 group-hover:text-gray-500 shrink-0 transition-colors" />
    </a>
  );
}

export default async function PodcastsPage() {
  const { data } = await supabase
    .from("content_items")
    .select("*")
    .in("source", ["podcast_allin", "podcast_moonshots"])
    .order("published_at", { ascending: false })
    .limit(40);

  const items    = (data ?? []) as ContentItem[];
  const allIn    = items.filter(i => i.source === "podcast_allin");
  const moonshots = items.filter(i => i.source === "podcast_moonshots");

  // Latest episode from each show for spotlight
  const spotlights = [
    allIn[0],
    moonshots[0],
  ].filter(Boolean);

  // All remaining episodes (skip the spotlighted ones)
  const spotlightIds = new Set(spotlights.map(s => s.id));
  const remaining = items.filter(i => !spotlightIds.has(i.id));

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
          <Radio className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Podcasts</h1>
          <p className="text-xs text-gray-500">All-In · Moonshots with Peter Diamandis</p>
        </div>
      </div>

      {/* Spotlight */}
      {spotlights.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">Latest Episodes</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spotlights.map(item => <SpotlightCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {/* All episodes */}
      {remaining.length > 0 && (
        <div className="rounded-xl border border-[#2f3336] bg-[#0a0a0a] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#2f3336]">
            <Radio className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-sm font-semibold text-white">All Episodes</span>
            <span className="text-xs font-mono text-gray-700 ml-auto">{remaining.length}</span>
          </div>
          {remaining.map(item => <EpisodeRow key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}

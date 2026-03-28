import { supabase } from "@/lib/supabase";
import { Telescope, FlaskConical, TrendingUp, ExternalLink, ChevronUp, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ContentItem } from "@/types/database";

export const revalidate = 3600;

const CS_CATS: Record<string, { label: string; color: string; bg: string }> = {
  "cs.AI":   { label: "AI",       color: "text-pink-400",    bg: "bg-pink-400/10 border-pink-400/20" },
  "cs.LG":   { label: "ML",       color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/20" },
  "cs.CL":   { label: "NLP",      color: "text-sky-400",     bg: "bg-sky-400/10 border-sky-400/20" },
  "cs.CV":   { label: "Vision",   color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  "cs.RO":   { label: "Robotics", color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/20" },
  "cs.NE":   { label: "Neural",   color: "text-indigo-400",  bg: "bg-indigo-400/10 border-indigo-400/20" },
  "stat.ML": { label: "Stats/ML", color: "text-teal-400",    bg: "bg-teal-400/10 border-teal-400/20" },
};

function getCats(item: ContentItem) {
  const tags = item.tags as string[];
  return tags.filter(t => t in CS_CATS).slice(0, 3);
}

// ── Spotlight Cards ──────────────────────────────────────────────────────────

function ArxivSpotlight({ item }: { item: ContentItem }) {
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";
  const cats = getCats(item);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl border border-pink-400/20 bg-[#0a0a0a] overflow-hidden flex flex-col hover:border-pink-400/40 transition-colors"
    >
      {/* Header band */}
      <div className="bg-gradient-to-br from-pink-600/20 to-purple-700/20 border-b border-pink-400/20 px-5 py-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs font-mono text-pink-400 uppercase tracking-widest font-semibold">Must-Read Paper</span>
          </div>
          <span className="text-xs text-gray-600">{timeAgo}</span>
        </div>
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cats.map(c => {
              const meta = CS_CATS[c];
              return (
                <span key={c} className={`text-xs font-mono px-1.5 py-0.5 rounded border ${meta.bg} ${meta.color}`}>
                  {meta.label}
                </span>
              );
            })}
          </div>
        )}
        <h3 className="text-base font-bold text-white leading-snug line-clamp-3 group-hover:text-white/90 transition-colors">
          {item.title}
        </h3>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex-1 flex flex-col gap-3">
        {item.summary && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">
            {item.summary}
          </p>
        )}
        <div className="flex items-center gap-2 mt-auto">
          {item.author && (
            <span className="text-xs text-gray-700 truncate">{item.author}</span>
          )}
          <ExternalLink className="w-3.5 h-3.5 text-gray-700 group-hover:text-pink-400 ml-auto shrink-0 transition-colors" />
        </div>
      </div>
    </a>
  );
}

function HNSpotlight({ item }: { item: ContentItem }) {
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";
  const score = item.score ?? 0;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl border border-yellow-400/20 bg-[#0a0a0a] overflow-hidden flex flex-col hover:border-yellow-400/40 transition-colors"
    >
      {/* Header band */}
      <div className="bg-gradient-to-br from-yellow-600/15 to-orange-700/15 border-b border-yellow-400/20 px-5 py-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-mono text-yellow-400 uppercase tracking-widest font-semibold">Top Story</span>
          </div>
          <span className="text-xs text-gray-600">{timeAgo}</span>
        </div>
        <h3 className="text-base font-bold text-white leading-snug line-clamp-3 group-hover:text-white/90 transition-colors">
          {item.title}
        </h3>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex-1 flex flex-col gap-3">
        {/* Score */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
            <ChevronUp className="w-4 h-4 text-yellow-400" />
            <span className="text-lg font-black font-mono text-yellow-400 leading-none">
              {score > 999 ? `${(score / 1000).toFixed(1)}k` : score}
            </span>
            <span className="text-xs text-yellow-400/60 ml-1">points</span>
          </div>
          <span className="text-xs text-gray-600">on Hacker News</span>
        </div>
        <div className="flex items-center mt-auto">
          <span className="text-xs font-mono text-orange-400/50">HN</span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-700 group-hover:text-yellow-400 ml-auto shrink-0 transition-colors" />
        </div>
      </div>
    </a>
  );
}

// ── List Cards ───────────────────────────────────────────────────────────────

function ArxivCard({ item, idx }: { item: ContentItem; idx: number }) {
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";
  const cats = getCats(item);
  const tags = item.tags as string[];
  const unknownCats = tags.filter(t => t.startsWith("cs.") && !(t in CS_CATS)).slice(0, 1);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 px-5 py-4 border-b border-[#1e2124] last:border-0 hover:bg-white/[0.025] transition-colors"
    >
      <span className="text-xs font-mono text-gray-800 w-5 shrink-0 mt-0.5 text-right">{idx + 1}</span>
      <div className="flex-1 min-w-0">
        {(cats.length > 0 || unknownCats.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {cats.map(c => {
              const meta = CS_CATS[c];
              return (
                <span key={c} className={`text-xs font-mono px-1.5 py-0.5 rounded border ${meta.bg} ${meta.color}`}>
                  {meta.label}
                </span>
              );
            })}
            {unknownCats.map(c => (
              <span key={c} className="text-xs font-mono px-1.5 py-0.5 rounded border bg-gray-400/10 border-gray-400/20 text-gray-500">
                {c}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-sm font-medium text-gray-200 group-hover:text-white leading-snug line-clamp-2 transition-colors mb-1.5">
          {item.title}
        </h3>
        {item.summary && (
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">
            {item.summary}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-700">
          {item.author && (
            <>
              <span className="truncate max-w-[180px]">{item.author}</span>
              <span className="text-gray-800">·</span>
            </>
          )}
          <span>{timeAgo}</span>
          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
        </div>
      </div>
    </a>
  );
}

function HNCard({ item, idx }: { item: ContentItem; idx: number }) {
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";
  const score = item.score ?? 0;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 px-5 py-4 border-b border-[#1e2124] last:border-0 hover:bg-white/[0.025] transition-colors"
    >
      <span className="text-xs font-mono text-gray-800 w-5 shrink-0 mt-0.5 text-right">{idx + 1}</span>
      <div className="flex flex-col items-center gap-0.5 shrink-0 w-10">
        <ChevronUp className="w-3.5 h-3.5 text-yellow-500/60 group-hover:text-yellow-400 transition-colors" />
        <span className="text-xs font-mono font-bold text-yellow-500/80 group-hover:text-yellow-400 transition-colors leading-none">
          {score > 999 ? `${(score / 1000).toFixed(1)}k` : score}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-200 group-hover:text-white leading-snug line-clamp-2 transition-colors mb-1.5">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <span className="font-mono text-orange-400/50 text-xs">HN</span>
          <span className="text-gray-800">·</span>
          <span>{timeAgo}</span>
          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
        </div>
      </div>
    </a>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DiscoverPage() {
  const [arxivRes, hnRes] = await Promise.all([
    supabase
      .from("content_items")
      .select("*")
      .eq("source", "arxiv")
      .order("published_at", { ascending: false })
      .limit(25),
    supabase
      .from("content_items")
      .select("*")
      .eq("source", "hackernews")
      .order("score", { ascending: false })
      .limit(25),
  ]);

  const arxivItems = (arxivRes.data ?? []) as ContentItem[];
  const hnItems    = (hnRes.data ?? []) as ContentItem[];

  // Spotlights: freshest arxiv paper + top HN story
  const arxivSpotlight = arxivItems[0];
  const hnSpotlight    = hnItems[0];

  const arxivRest = arxivItems.slice(1);
  const hnRest    = hnItems.slice(1);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-pink-500/15 flex items-center justify-center">
          <Telescope className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Discover</h1>
          <p className="text-xs text-gray-500">Latest research papers and top Hacker News stories</p>
        </div>
      </div>

      {/* Spotlight row */}
      {(arxivSpotlight || hnSpotlight) && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">Spotlight</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {arxivSpotlight && <ArxivSpotlight item={arxivSpotlight} />}
            {hnSpotlight    && <HNSpotlight    item={hnSpotlight} />}
          </div>
        </div>
      )}

      {/* Main lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[#2f3336] bg-[#0a0a0a] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#2f3336]">
            <FlaskConical className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-semibold text-white">Latest Papers</span>
            <span className="text-xs font-mono text-gray-700 ml-auto">{arxivRest.length}</span>
          </div>
          {arxivRest.length === 0
            ? <p className="px-5 py-8 text-sm text-gray-600">No papers yet.</p>
            : arxivRest.map((item, i) => <ArxivCard key={item.id} item={item} idx={i} />)
          }
        </div>

        <div className="rounded-xl border border-[#2f3336] bg-[#0a0a0a] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#2f3336]">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">Hacker News AI</span>
            <span className="text-xs font-mono text-gray-700 ml-auto">{hnRest.length}</span>
          </div>
          {hnRest.length === 0
            ? <p className="px-5 py-8 text-sm text-gray-600">No stories yet.</p>
            : hnRest.map((item, i) => <HNCard key={item.id} item={item} idx={i} />)
          }
        </div>
      </div>
    </div>
  );
}

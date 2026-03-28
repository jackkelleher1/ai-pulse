"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, TrendingUp, ShieldAlert, Activity } from "lucide-react";
import SignalCard from "@/components/SignalCard";
import IntelPanel from "@/components/IntelPanel";
import SearchBar from "@/components/SearchBar";
import ScrollingTicker from "@/components/ScrollingTicker";
import { detectCategory, CATEGORY_CONFIG } from "@/lib/utils/categories";
import type { ContentItem } from "@/types/database";
import type { Category } from "@/lib/utils/categories";

// ── Priority Intel scoring ──────────────────────────────────────────────────
// Credibility-weighted ranking:
//   • Official lab sources (Anthropic, OpenAI) have a high floor so they
//     always surface even with 0 community engagement.
//   • Community sources (Reddit, HN) are capped at 150 so viral-but-shallow
//     posts can't crowd out real news.
//   • At most 1 community source is allowed in the top 3 slots.

const COMMUNITY_SOURCES = new Set(["reddit", "hackernews"]);

const SOURCE_WEIGHT: Record<string, number> = {
  // Official lab announcements — highest priority
  anthropic:       500,
  openai:          500,
  deepmind:        480,
  microsoft_ai:    400,
  // Tier-1 tech journalism
  wsj:             220,
  nytimes:         160,
  theverge:        160,
  techcrunch:      140,
  wired:           130,
  ars_technica:    120,
  huggingface:     130,
  mit_tech_review: 110,
  the_decoder:     100,
  marketwatch:      90,
  venturebeat:      85,
  arxiv:           100,
  tldr_ai:          70,
  // Community — use raw score but capped
  hackernews:        1,
  reddit:            1,
};

const CAT_MULT: Record<string, number> = {
  models:   1.5,
  safety:   1.3,
  funding:  1.25,
  research: 1.15,
  products: 1.1,
  general:  1.0,
};

function priorityScore(item: ContentItem): number {
  const ageMs  = Date.now() - new Date(item.published_at ?? Date.now()).getTime();
  const ageH   = ageMs / 3_600_000;
  // Cap community scores so a 1000-upvote Reddit post can't beat an Anthropic announcement
  const rawScore = COMMUNITY_SOURCES.has(item.source) ? Math.min(item.score, 150) : item.score;
  const base     = Math.max(rawScore, SOURCE_WEIGHT[item.source] ?? 10);
  const cat      = detectCategory(item.title, item.summary);
  const catMult  = CAT_MULT[cat] ?? 1.0;
  const freshMult = ageH < 3 ? 1.3 : ageH < 6 ? 1.15 : 1.0;
  return base * catMult * freshMult;
}

type TrendingTopic = { topic: string; mention_count: number; sources: string[] };

const CATEGORY_FILTERS: { value: Category | "all"; label: string }[] = [
  { value: "all",      label: "ALL" },
  { value: "models",   label: "MODELS" },
  { value: "research", label: "RESEARCH" },
  { value: "products", label: "PRODUCTS" },
  { value: "funding",  label: "FUNDING" },
  { value: "safety",   label: "SAFETY" },
];

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const raf = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function TacticalBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.9) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Fade edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
      {/* Corner reticle brackets */}
      <div className="absolute top-4 left-4 w-7 h-7 border-l-2 border-t-2 border-accent/30" />
      <div className="absolute top-4 right-4 w-7 h-7 border-r-2 border-t-2 border-accent/30" />
      <div className="absolute bottom-4 left-4 w-7 h-7 border-l-2 border-b-2 border-accent/30" />
      <div className="absolute bottom-4 right-4 w-7 h-7 border-r-2 border-b-2 border-accent/30" />
      {/* Center glow */}
      <div
        className="absolute top-0 left-1/4 w-96 h-64 rounded-full opacity-[0.13] blur-3xl"
        style={{ background: "radial-gradient(ellipse, #6366f1, transparent)", animation: "pulse 8s ease-in-out infinite" }}
      />
      <div
        className="absolute top-10 right-1/3 w-64 h-40 rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "radial-gradient(ellipse, #22c55e, transparent)", animation: "float 10s ease-in-out infinite 3s" }}
      />
    </div>
  );
}

function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-25"
        style={{
          background: "linear-gradient(90deg, transparent, #22c55e 30%, #6366f1 50%, #22c55e 70%, transparent)",
          animation: "scan 7s linear infinite",
        }}
      />
    </div>
  );
}

export default function HomePage() {
  const [items, setItems]             = useState<ContentItem[]>([]);
  const [tweets, setTweets]           = useState<ContentItem[]>([]);
  const [trending, setTrending]       = useState<TrendingTopic[]>([]);
  const [loading, setLoading]         = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter]           = useState<Category | "all">("all");
  const [searchActive, setSearchActive] = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [visible, setVisible]         = useState(false);

  async function loadData() {
    const [a, b, c] = await Promise.all([
      fetch("/api/content?limit=100&sort=published_at").then(r => r.json()),
      fetch("/api/content?source=x&limit=10").then(r => r.json()),
      fetch("/api/trending").then(r => r.json()),
    ]);
    setItems((a.items ?? []).filter((i: ContentItem) => i.source !== "x"));
    setTweets(b.items ?? []);
    setTrending(c.trending ?? []);
    setLastUpdated(new Date());
    setLoading(false);
    setTimeout(() => setVisible(true), 50);
  }

  useEffect(() => { loadData(); }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetch("/api/refresh", { headers: { Authorization: "Bearer aipulse123" } });
    await loadData();
    setRefreshing(false);
  }

  const filtered = filter === "all"
    ? items
    : items.filter(i => detectCategory(i.title, i.summary) === filter);

  // Priority Intel: composite score with source-diversity cap
  // At most 1 community source (Reddit/HN) in the top 3.
  const cutoff24h = new Date(Date.now() - 86_400_000);
  const recent = items.filter(i => i.published_at && new Date(i.published_at) > cutoff24h);
  const pool = recent.length >= 3 ? recent : items;
  const ranked = pool
    .map(i => ({ item: i, ps: priorityScore(i) }))
    .sort((a, b) => b.ps - a.ps);

  const priority: ContentItem[] = [];
  let communitySlots = 0;
  for (const { item } of ranked) {
    if (priority.length >= 4) break;
    const isCommunity = COMMUNITY_SOURCES.has(item.source);
    if (isCommunity && communitySlots >= 1) continue; // max 1 community item
    priority.push(item);
    if (isCommunity) communitySlots++;
  }

  const totalCount  = useCountUp(items.length + tweets.length);
  const sourceCount = useCountUp(5);

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden" style={{ minHeight: 340 }}>
        <TacticalBackground />
        <ScanLine />

        {/* Ops status strip */}
        <div className="relative z-10 border-b border-white/[0.05] bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 h-7 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-400" />
              </span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.2em]">SYS ONLINE</span>
            </div>
            <span className="text-white/10 text-xs">|</span>
            <span className="text-[10px] font-mono text-gray-700 uppercase tracking-[0.15em]">FEEDS ACTIVE</span>
            <span className="text-white/10 text-xs">|</span>
            <span className="text-[10px] font-mono text-gray-700 uppercase tracking-[0.15em]">MONITORING 24/7</span>
            <span className="ml-auto text-[10px] font-mono text-gray-800 uppercase tracking-widest">UNCLASSIFIED</span>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* Left */}
            <div>
              <p
                className="text-[10px] font-mono text-gray-700 uppercase tracking-[0.3em] mb-3"
                style={{ animation: "fade-in 0.3s ease forwards" }}
              >
                OPERATION: AI-PULSE // INTEL AGGREGATION SYSTEM
              </p>

              <h1
                className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight"
                style={{ animation: "fade-up 0.5s ease 0.05s both" }}
              >
                The Situ<span className="text-accent">AI</span>tion<br />
                Room.
              </h1>

              <p
                className="text-gray-500 mb-7 text-sm leading-relaxed"
                style={{ animation: "fade-up 0.5s ease 0.15s both" }}
              >
                Every AI signal that matters — research labs, news, Reddit, arXiv,
                podcasts, markets — aggregated and ranked in real time.
              </p>

              {/* Terminal readout stats */}
              <div
                className="inline-flex border border-white/[0.08] rounded-lg overflow-hidden mb-7 font-mono"
                style={{ animation: "fade-up 0.5s ease 0.25s both" }}
              >
                <div className="px-4 py-2.5 border-r border-white/[0.08] bg-white/[0.02]">
                  <div className="text-[9px] text-gray-700 uppercase tracking-widest mb-1">SIGNALS</div>
                  <div className="text-2xl font-bold text-white tabular-nums">{totalCount.toLocaleString()}</div>
                </div>
                <div className="px-4 py-2.5 border-r border-white/[0.08] bg-white/[0.02]">
                  <div className="text-[9px] text-gray-700 uppercase tracking-widest mb-1">SOURCES</div>
                  <div className="text-2xl font-bold text-white tabular-nums">{sourceCount}</div>
                </div>
                <div className="px-4 py-2.5 border-r border-white/[0.08] bg-white/[0.02]">
                  <div className="text-[9px] text-gray-700 uppercase tracking-widest mb-1">TEMPO</div>
                  <div className="text-2xl font-bold text-white">24/7</div>
                </div>
                {lastUpdated && (
                  <div className="px-4 py-2.5 bg-white/[0.02]">
                    <div className="text-[9px] text-gray-700 uppercase tracking-widest mb-1">LAST SYNC</div>
                    <div className="text-sm text-emerald-400">{formatDistanceToNow(lastUpdated, { addSuffix: true })}</div>
                  </div>
                )}
              </div>

              <div style={{ animation: "fade-up 0.5s ease 0.3s both" }}>
                <SearchBar onActiveChange={setSearchActive} />
              </div>
            </div>

            {/* Right: live feed ticker */}
            <div
              className="hidden lg:block"
              style={{ height: 280, animation: "fade-in 0.6s ease 0.35s both" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em]">LIVE FEED</span>
                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              </div>
              <ScrollingTicker items={items.slice(0, 20)} />
            </div>

          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!searchActive && (
          <>
            {/* Priority Intel */}
            {priority.length > 0 && (
              <section
                className="mb-10"
                style={{ animation: visible ? "fade-up 0.5s ease 0.1s both" : "none", opacity: visible ? undefined : 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-widest shrink-0">
                    Priority Intel
                  </span>
                  <span className="text-xs font-mono text-gray-700 border border-white/[0.06] px-1.5 py-0.5 rounded shrink-0">
                    last 24h
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 text-xs font-mono text-gray-700 hover:text-gray-300 transition-colors disabled:opacity-30 shrink-0"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "syncing..." : "sync"}
                  </button>
                </div>
                {/* Hero left (2/3 width) + 3 compact stacked right (1/3) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:items-stretch">
                  {priority[0] && (
                    <div
                      key={priority[0].id}
                      className="md:col-span-2 h-full"
                      style={{ animation: visible ? "fade-up 0.5s ease 0.1s both" : "none", opacity: visible ? undefined : 0 }}
                    >
                      <SignalCard item={priority[0]} featured hero />
                    </div>
                  )}
                  <div className="flex flex-col gap-2 h-full">
                    {priority.slice(1, 4).map((item, i) => (
                      <div
                        key={item.id}
                        className="flex-1"
                        style={{ animation: visible ? `fade-up 0.5s ease ${0.18 + i * 0.07}s both` : "none", opacity: visible ? undefined : 0 }}
                      >
                        <SignalCard item={item} featured compact />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Feed + Intel panel */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div
                className="xl:col-span-2"
                style={{ animation: visible ? "fade-up 0.5s ease 0.3s both" : "none", opacity: visible ? undefined : 0 }}
              >
                {/* Category filters */}
                <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                  {CATEGORY_FILTERS.map(f => {
                    const active  = filter === f.value;
                    const config  = f.value !== "all" ? CATEGORY_CONFIG[f.value as Category] : null;
                    const count   = f.value === "all"
                      ? items.length
                      : items.filter(i => detectCategory(i.title, i.summary) === f.value).length;
                    return (
                      <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`shrink-0 px-3 py-1.5 rounded text-[10px] font-mono font-semibold tracking-widest transition-all border ${
                          active
                            ? config ? `${config.bg} ${config.color}` : "bg-accent/10 text-accent border-accent/20"
                            : "text-gray-700 border-white/[0.06] hover:text-gray-300 hover:border-white/[0.12] bg-white/[0.02]"
                        }`}
                      >
                        {f.label}
                        {!loading && <span className="ml-1.5 opacity-40 tabular-nums">{count}</span>}
                      </button>
                    );
                  })}
                  <div className="ml-auto h-px self-center flex-1 max-w-16 bg-gradient-to-r from-border to-transparent" />
                </div>

                {/* Signal feed header */}
                <div className="flex items-center gap-2 mb-2 px-3">
                  <span className="text-[9px] font-mono text-gray-800 uppercase tracking-widest w-5 text-right">#</span>
                  <span className="text-[9px] font-mono text-gray-800 uppercase tracking-widest">SIGNAL</span>
                  <span className="ml-auto text-[9px] font-mono text-gray-800 uppercase tracking-widest">SOURCE</span>
                </div>

                {loading ? (
                  <div className="space-y-1.5">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="h-14 rounded-lg bg-surface/50 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {filtered.map((item, i) => (
                      <div
                        key={item.id}
                        style={{ animation: visible ? `fade-up 0.4s ease ${Math.min(i * 0.025, 0.5)}s both` : "none", opacity: visible ? undefined : 0 }}
                      >
                        <SignalCard item={item} rank={i + 1} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="xl:col-span-1"
                style={{ animation: visible ? "fade-up 0.5s ease 0.4s both" : "none", opacity: visible ? undefined : 0 }}
              >
                <div className="sticky top-20">
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-12 rounded-lg bg-surface/50 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                      ))}
                    </div>
                  ) : (
                    <IntelPanel tweets={tweets} trending={trending} />
                  )}
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

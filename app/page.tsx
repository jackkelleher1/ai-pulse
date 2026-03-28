"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Circle, TrendingUp } from "lucide-react";
import SignalCard from "@/components/SignalCard";
import IntelPanel from "@/components/IntelPanel";
import EducationLinks from "@/components/EducationLinks";
import SearchBar from "@/components/SearchBar";
import ScrollingTicker from "@/components/ScrollingTicker";
import { detectCategory, CATEGORY_CONFIG } from "@/lib/utils/categories";
import type { ContentItem } from "@/types/database";
import type { Category } from "@/lib/utils/categories";

type TrendingTopic = { topic: string; mention_count: number; sources: string[] };

const CATEGORY_FILTERS: { value: Category | "all"; label: string }[] = [
  { value: "all",      label: "All" },
  { value: "models",   label: "Models" },
  { value: "research", label: "Research" },
  { value: "products", label: "Products" },
  { value: "funding",  label: "Funding" },
  { value: "safety",   label: "Safety" },
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

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
      <div
        className="absolute top-0 left-1/4 w-96 h-64 rounded-full opacity-20 blur-3xl animate-pulse"
        style={{ background: "radial-gradient(ellipse, #6366f1, transparent)" }}
      />
      <div
        className="absolute top-10 right-1/4 w-64 h-48 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(ellipse, #06b6d4, transparent)", animation: "float 8s ease-in-out infinite 2s" }}
      />
    </div>
  );
}

function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-30"
        style={{ background: "linear-gradient(90deg, transparent, #6366f1, transparent)", animation: "scan 6s linear infinite" }}
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
      fetch("/api/content?limit=60&sort=published_at").then(r => r.json()),
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

  const cutoff   = new Date(Date.now() - 86400000);
  const priority = items
    .filter(i => i.published_at && new Date(i.published_at) > cutoff && i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const totalCount = useCountUp(items.length + tweets.length);
  const sourceCount = useCountUp(5);

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden" style={{ minHeight: 320 }}>
        <GridBackground />
        <ScanLine />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* Left */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-xs font-mono text-accent mb-5"
                style={{ animation: "fade-in 0.4s ease forwards" }}
              >
                <Circle className="w-1.5 h-1.5 fill-accent animate-pulse" />
                Situation Room for AI
              </div>

              <h1
                className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight"
                style={{ animation: "fade-up 0.5s ease 0.1s both" }}
              >
                Monitor the AI<br />
                <span className="text-accent">landscape.</span>
              </h1>

              <p
                className="text-gray-500 mb-7 text-sm"
                style={{ animation: "fade-up 0.5s ease 0.2s both" }}
              >
                Every signal that matters — Reddit, arXiv, Hacker News, podcasts, Chamath — in one place.
              </p>

              <div
                className="flex items-center gap-5 mb-7 flex-wrap"
                style={{ animation: "fade-up 0.5s ease 0.3s both" }}
              >
                <div>
                  <div className="text-2xl font-bold text-white font-mono tabular-nums">{totalCount.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 font-mono uppercase tracking-wider">Signals</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-white font-mono tabular-nums">{sourceCount}</div>
                  <div className="text-xs text-gray-600 font-mono uppercase tracking-wider">Sources</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-white font-mono">24/7</div>
                  <div className="text-xs text-gray-600 font-mono uppercase tracking-wider">Monitoring</div>
                </div>
                {lastUpdated && (
                  <>
                    <div className="w-px h-8 bg-border" />
                    <div>
                      <div className="text-sm font-mono text-emerald-400">{formatDistanceToNow(lastUpdated, { addSuffix: true })}</div>
                      <div className="text-xs text-gray-600 font-mono uppercase tracking-wider">Last refresh</div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ animation: "fade-up 0.5s ease 0.35s both" }}>
                <SearchBar onActiveChange={setSearchActive} />
              </div>
            </div>

            {/* Right: ticker */}
            <div
              className="hidden lg:block"
              style={{ height: 280, animation: "fade-in 0.6s ease 0.4s both" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">Live feed</span>
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
            {/* Priority signals */}
            {priority.length > 0 && (
              <section
                className="mb-10"
                style={{ animation: visible ? "fade-up 0.5s ease 0.1s both" : "none", opacity: visible ? undefined : 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">Priority Signals</span>
                    <span className="text-xs font-mono text-gray-700">— last 24h</span>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 text-xs font-mono text-gray-700 hover:text-gray-300 transition-colors disabled:opacity-30"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "refreshing..." : "refresh"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {priority.map((item, i) => (
                    <div
                      key={item.id}
                      style={{ animation: visible ? `fade-up 0.5s ease ${0.1 + i * 0.08}s both` : "none", opacity: visible ? undefined : 0 }}
                    >
                      <SignalCard item={item} featured />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Two-col */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div
                className="xl:col-span-2"
                style={{ animation: visible ? "fade-up 0.5s ease 0.3s both" : "none", opacity: visible ? undefined : 0 }}
              >
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
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                          active
                            ? config ? `${config.bg} ${config.color}` : "bg-accent/10 text-accent border-accent/20"
                            : "text-gray-600 border-border hover:text-gray-300 hover:border-gray-700"
                        }`}
                      >
                        {f.label}
                        {!loading && <span className="ml-1.5 opacity-40 tabular-nums">{count}</span>}
                      </button>
                    );
                  })}
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
                        <SignalCard item={item} />
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

            <div
              className="mt-12 pt-8 border-t border-border"
              style={{ animation: visible ? "fade-in 0.6s ease 0.5s both" : "none", opacity: visible ? undefined : 0 }}
            >
              <EducationLinks />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

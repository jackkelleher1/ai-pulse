"use client";

import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Flame, Zap, Circle } from "lucide-react";
import { detectCategory, getUrgency, CATEGORY_CONFIG } from "@/lib/utils/categories";
import type { ContentItem } from "@/types/database";

const SOURCE_LABELS: Record<string, string> = {
  reddit:            "REDDIT",
  hackernews:        "HN",
  arxiv:             "ARXIV",
  podcast_allin:     "ALL-IN",
  podcast_moonshots: "MOONSHOTS",
  x:                 "X",
  linkedin:          "LINKEDIN",
  anthropic:         "ANTHROPIC",
  openai:            "OPENAI",
  huggingface:       "HF",
  tldr_ai:           "TLDR",
  venturebeat:       "VBEAT",
  mit_tech_review:   "MIT",
  deepmind:          "DEEPMIND",
  microsoft_ai:      "MSFT AI",
  theverge:          "THE VERGE",
  techcrunch:        "TECHCRUNCH",
  wired:             "WIRED",
  ars_technica:      "ARS",
  the_decoder:       "DECODER",
  nytimes:           "NYT",
  wsj:               "WSJ",
  marketwatch:       "MKTWATCH",
};

// Category → gradient background for featured cards
const CAT_GRADIENT: Record<string, string> = {
  models:   "from-violet-950 via-[#0b0715] to-black",
  safety:   "from-amber-950 via-[#160c00] to-black",
  research: "from-pink-950 via-[#150410] to-black",
  funding:  "from-emerald-950 via-[#011510] to-black",
  products: "from-sky-950 via-[#020e18] to-black",
  general:  "from-slate-900 via-[#0d0d12] to-black",
};

// Source → radial glow color overlay
const SOURCE_GLOW: Record<string, string> = {
  anthropic:    "rgba(251,146,60,0.18)",
  openai:       "rgba(52,211,153,0.15)",
  arxiv:        "rgba(244,114,182,0.14)",
  huggingface:  "rgba(250,204,21,0.13)",
  hackernews:   "rgba(251,146,60,0.13)",
  reddit:       "rgba(249,115,22,0.12)",
  mit_tech_review: "rgba(248,113,113,0.13)",
  venturebeat:  "rgba(167,139,250,0.13)",
  tldr_ai:      "rgba(56,189,248,0.12)",
};

// text-{x}-400 → bg-{x}-400
const COLOR_TO_BG: Record<string, string> = {
  "text-violet-400":  "bg-violet-400",
  "text-amber-400":   "bg-amber-400",
  "text-pink-400":    "bg-pink-400",
  "text-emerald-400": "bg-emerald-400",
  "text-sky-400":     "bg-sky-400",
  "text-gray-400":    "bg-gray-600",
};

// Tier-1 sources that get a credibility badge treatment
const TIER1_SOURCES = new Set([
  "anthropic", "openai", "deepmind", "microsoft_ai",
  "wsj", "nytimes", "mit_tech_review",
]);

// Source → domain for Clearbit logo fallback
const SOURCE_DOMAIN: Record<string, string> = {
  anthropic:       "anthropic.com",
  openai:          "openai.com",
  deepmind:        "deepmind.google",
  microsoft_ai:    "microsoft.com",
  huggingface:     "huggingface.co",
  arxiv:           "arxiv.org",
  hackernews:      "ycombinator.com",
  reddit:          "reddit.com",
  theverge:        "theverge.com",
  techcrunch:      "techcrunch.com",
  wired:           "wired.com",
  ars_technica:    "arstechnica.com",
  the_decoder:     "the-decoder.com",
  nytimes:         "nytimes.com",
  wsj:             "wsj.com",
  marketwatch:     "marketwatch.com",
  venturebeat:     "venturebeat.com",
  mit_tech_review: "technologyreview.com",
  tldr_ai:         "tldr.tech",
  podcast_allin:   "allinpodcast.co",
};

function isBreaking(publishedAt: string | null): boolean {
  if (!publishedAt) return false;
  return Date.now() - new Date(publishedAt).getTime() < 30 * 60 * 1000; // < 30 min
}

// GitHub org avatars — guaranteed to render, look great as logo art
const GITHUB_AVATAR: Record<string, string> = {
  anthropic:    "https://github.com/anthropics.png?size=600",
  openai:       "https://github.com/openai.png?size=600",
  deepmind:     "https://github.com/google-deepmind.png?size=600",
  microsoft_ai: "https://github.com/microsoft.png?size=600",
  huggingface:  "https://github.com/huggingface.png?size=600",
  arxiv:        "https://github.com/arXiv.png?size=600",
};

// ── Hero card — mirrors SpotlightCard structure exactly ──────────────────────
function HeroCard({
  item, gradient, glow, stripe, cat, isTier1, isNew, urgency, timeAgo,
}: {
  item: ContentItem;
  gradient: string;
  glow: string;
  stripe: string;
  cat: { label: string; color: string };
  isTier1: boolean;
  isNew: boolean;
  urgency: "breaking" | "hot" | "new" | null;
  timeAgo: string;
}) {
  const sourceName  = SOURCE_LABELS[item.source] ?? item.source;
  const githubAvatar = GITHUB_AVATAR[item.source] ?? null;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex flex-col rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all h-full ${isNew ? "heartbeat" : ""}`}
    >
      {/* ── Image area (always renders something) ── */}
      <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${gradient} shrink-0`}>

        {/* Layer 1: GitHub avatar or large masthead text — always visible */}
        {githubAvatar ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={githubAvatar}
              alt={sourceName}
              className="w-32 h-32 rounded-2xl object-cover opacity-80 scale-105 group-hover:scale-100 transition-transform duration-700"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <span className="text-[5rem] font-black text-white/[0.07] tracking-tighter select-none uppercase leading-none">
              {sourceName}
            </span>
          </div>
        )}

        {/* Layer 2: RSS article photo on top — hides background if it loads */}
        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* Gradient overlays — same as SpotlightCard */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />

        {/* Source glow */}
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 20% 50%, ${glow}, transparent 65%)` }}
        />

        {/* Left stripe */}
        <div className={`absolute top-0 left-0 bottom-0 w-0.5 ${stripe}`} />

        {/* Badges — top of image */}
        <div className="absolute top-3 left-4 right-4 flex items-center gap-1.5 flex-wrap">
          {urgency === "breaking" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-red-400 bg-black/60 border border-red-400/40 uppercase tracking-wider backdrop-blur-sm">
              <Circle className="w-1.5 h-1.5 fill-red-400 animate-pulse" /> BREAK
            </span>
          )}
          {urgency === "hot" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-orange-400 bg-black/60 border border-orange-400/40 uppercase tracking-wider backdrop-blur-sm">
              <Flame className="w-3 h-3" /> HOT
            </span>
          )}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border uppercase tracking-wider backdrop-blur-sm bg-black/50 ${cat.color}`}
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            {cat.label}
          </span>
          {isTier1 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-400/25 uppercase tracking-wider backdrop-blur-sm">
              ★ VERIFIED
            </span>
          )}
          <span className="ml-auto text-[10px] font-mono text-white/40 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm shrink-0">
            {timeAgo}
          </span>
        </div>

        {/* Source label — bottom of image */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-2.5">
          <span className="text-xs font-mono font-bold text-white/50 uppercase tracking-widest">
            {sourceName}
          </span>
        </div>
      </div>

      {/* ── Body below image — same as SpotlightCard ── */}
      <div className="bg-[#0d0d0d] px-4 py-3.5 flex-1 flex flex-col gap-2 border-t border-white/[0.06]">
        <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-white/90 transition-colors">
          {item.title}
        </h3>
        {item.summary && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {item.summary}
          </p>
        )}
        <div className="flex items-center gap-2 mt-auto pt-1">
          {item.score > 0 && (
            <span className="text-[10px] font-mono text-gray-700">{item.score.toLocaleString()} pts</span>
          )}
          <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-gray-400 transition-colors ml-auto shrink-0" />
        </div>
      </div>
    </a>
  );
}

export default function SignalCard({
  item,
  featured = false,
  hero = false,
  compact = false,
  rank,
}: {
  item: ContentItem;
  featured?: boolean;
  hero?: boolean;
  compact?: boolean;
  rank?: number;
}) {
  const category  = detectCategory(item.title, item.summary);
  const urgency   = getUrgency(item.published_at, item.score, item.source);
  const cat       = CATEGORY_CONFIG[category];
  const stripe    = COLOR_TO_BG[cat.color] ?? "bg-gray-600";
  const isTier1   = TIER1_SOURCES.has(item.source);
  const isNew     = isBreaking(item.published_at);

  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";

  if (featured) {
    const gradient = CAT_GRADIENT[category] ?? CAT_GRADIENT.general;
    const glow     = SOURCE_GLOW[item.source] ?? "rgba(99,102,241,0.12)";

    // ── Compact variant (right-side stacked cards) ──────────────────────────
    if (compact) {
      return (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative flex flex-col h-full rounded-xl overflow-hidden border border-white/[0.07] hover:border-white/[0.16] transition-all duration-300 ${isNew ? "heartbeat" : ""}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className={`absolute top-0 left-0 bottom-0 w-0.5 ${stripe}`} />

          <div className="relative flex flex-col justify-between h-full px-3 py-2.5 gap-1">
            {/* Top: badges + time */}
            <div className="flex items-center gap-1.5">
              {urgency === "breaking" && (
                <Circle className="w-1.5 h-1.5 fill-red-400 animate-pulse shrink-0" />
              )}
              {urgency === "hot" && <Flame className="w-3 h-3 text-orange-400 shrink-0" />}
              <span className={`text-[9px] font-mono font-semibold uppercase tracking-wider ${cat.color}`}>
                {cat.label}
              </span>
              {isTier1 && (
                <span className="text-[9px] font-mono text-emerald-400/70">★</span>
              )}
              <span className="text-[9px] font-mono text-white/25 ml-auto shrink-0">{timeAgo}</span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-white/85 group-hover:text-white leading-snug line-clamp-2 transition-colors">
              {item.title}
            </h3>

            {/* Source */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/25 uppercase tracking-wider">
                [{SOURCE_LABELS[item.source] ?? item.source}]
              </span>
              <ExternalLink className="w-2.5 h-2.5 text-white/15 group-hover:text-white/50 transition-colors shrink-0" />
            </div>
          </div>
        </a>
      );
    }

    // ── Hero variant ─────────────────────────────────────────────────────────
    if (hero) {
      return (
        <HeroCard
          item={item}
          gradient={gradient}
          glow={glow}
          stripe={stripe}
          cat={cat}
          isTier1={isTier1}
          isNew={isNew}
          urgency={urgency}
          timeAgo={timeAgo}
        />
      );
    }

    // ── Standard featured card ───────────────────────────────────────────────
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative flex flex-col h-60 rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 ${isNew ? "heartbeat" : ""}`}
      >
        {/* Category gradient base */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

        {/* Tactical grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Source glow */}
        <div
          className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-125"
          style={{ background: `radial-gradient(ellipse at 20% 50%, ${glow}, transparent 65%)` }}
        />

        {/* Bottom text scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Left classification stripe */}
        <div className={`absolute top-0 left-0 bottom-0 w-0.5 ${stripe}`} />

        {/* Content — centered */}
        <div className="absolute inset-0 p-4 flex flex-col justify-center gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {urgency === "breaking" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-red-400 bg-black/50 border border-red-400/40 uppercase tracking-wider backdrop-blur-sm">
                <Circle className="w-1.5 h-1.5 fill-red-400 animate-pulse" /> BREAK
              </span>
            )}
            {urgency === "hot" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-orange-400 bg-black/50 border border-orange-400/40 uppercase tracking-wider backdrop-blur-sm">
                <Flame className="w-3 h-3" /> HOT
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border uppercase tracking-wider backdrop-blur-sm bg-black/40 ${cat.color}`}
              style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {cat.label}
            </span>
            {isTier1 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-400/25 uppercase tracking-wider backdrop-blur-sm">
                ★ VERIFIED
              </span>
            )}
            <span className="text-[10px] font-mono text-white/30 ml-auto shrink-0">{timeAgo}</span>
          </div>

          <h3 className="text-base font-bold text-white/90 group-hover:text-white leading-snug line-clamp-2 transition-colors">
            {item.title}
          </h3>

          {item.summary && (
            <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
              {item.summary}
            </p>
          )}

          <div className="flex items-center gap-2 pt-0.5 border-t border-white/[0.06]">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
              [{SOURCE_LABELS[item.source] ?? item.source}]
            </span>
            {item.score > 0 && (
              <>
                <span className="text-white/15">·</span>
                <span className="text-[10px] font-mono text-white/25">{item.score.toLocaleString()} pts</span>
              </>
            )}
            <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors ml-auto shrink-0" />
          </div>
        </div>
      </a>
    );
  }

  // ── Standard feed row ─────────────────────────────────────────────────────
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-start gap-3 px-3 py-2.5 rounded hover:bg-surface border transition-all duration-150 ${isNew ? "border-emerald-400/15 heartbeat" : "border-transparent hover:border-border"}`}
    >
      {rank !== undefined && (
        <span className="text-[10px] font-mono text-gray-800 w-5 text-right shrink-0 mt-0.5 tabular-nums">{rank}</span>
      )}

      <div className={`w-0.5 self-stretch rounded-full shrink-0 ${stripe} opacity-60`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          {urgency === "breaking" && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-400 uppercase tracking-wider">
              <Circle className="w-1.5 h-1.5 fill-red-400 animate-pulse" /> BREAK
            </span>
          )}
          {urgency === "hot"  && <Flame className="w-3 h-3 text-orange-400 shrink-0" />}
          {urgency === "new"  && <Zap   className="w-3 h-3 text-accent shrink-0" />}
          <span className={`text-[10px] font-mono font-semibold uppercase tracking-wide ${cat.color}`}>{cat.label}</span>
          <span className="text-gray-800 text-xs">·</span>
          <span className="text-[10px] font-mono text-gray-700">[{SOURCE_LABELS[item.source] ?? item.source}]</span>
          <span className="text-[10px] font-mono text-gray-700 ml-auto shrink-0">{timeAgo}</span>
        </div>
        <h3 className="text-sm text-gray-300 group-hover:text-white leading-snug line-clamp-2 transition-colors">
          {item.title}
        </h3>
        {item.score > 0 && <p className="text-[10px] font-mono text-gray-800 mt-0.5">{item.score.toLocaleString()} pts</p>}
      </div>

      <ExternalLink className="w-3 h-3 text-gray-800 group-hover:text-gray-500 shrink-0 mt-1 transition-colors" />
    </a>
  );
}

import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import type { ContentItemInsert, Source } from "@/types/database";

// AI keyword filter — only keep articles that are actually about AI
const AI_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "deep learning", "llm",
  "large language model", "gpt", "claude", "gemini", "openai", "anthropic",
  "neural", "model", "training", "inference", "transformer", "benchmark",
  "chatbot", "agent", "automation", "nvidia", "chips", "gpu", "datacenter",
  "robotics", "generative", "diffusion", "multimodal", "rlhf", "fine-tun",
  "semiconductor", "tech stock", "microsoft", "google deepmind", "meta ai",
  "amazon aws", "compute", "foundation model", "reasoning model",
];

function isAiRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return AI_KEYWORDS.some(k => lower.includes(k));
}

interface FeedConfig {
  source:  Source;
  url:     string;
  limit:   number;
  filter?: boolean;
}

const FEEDS: FeedConfig[] = [
  // ── AI Lab official blogs ─────────────────────────────────────────────────
  // Anthropic has no RSS — handled separately via sitemap scraper below
  { source: "openai",          url: "https://openai.com/news/rss.xml",                                    limit: 10 },
  { source: "deepmind",        url: "https://deepmind.google/blog/rss.xml",                               limit: 10 },
  { source: "microsoft_ai",    url: "https://blogs.microsoft.com/ai/feed/",                               limit: 10 },
  { source: "huggingface",     url: "https://huggingface.co/blog/feed.xml",                               limit: 10 },
  // ── Tier-1 journalism ────────────────────────────────────────────────────
  { source: "theverge",        url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",  limit: 20 },
  { source: "techcrunch",      url: "https://techcrunch.com/category/artificial-intelligence/feed/",      limit: 20 },
  { source: "wsj",             url: "https://feeds.a.dj.com/rss/RSSWSJD.xml",                            limit: 20, filter: true },
  { source: "marketwatch",     url: "https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines",  limit: 20, filter: true },
  { source: "nytimes",         url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",        limit: 15, filter: true },
  { source: "wired",           url: "https://www.wired.com/feed/tag/ai/latest/rss",                       limit: 15 },
  { source: "ars_technica",    url: "https://feeds.arstechnica.com/arstechnica/index",                     limit: 20, filter: true },
  { source: "the_decoder",     url: "https://the-decoder.com/feed/",                                      limit: 15 },
  { source: "tldr_ai",         url: "https://tldr.tech/api/rss/ai",                                       limit: 15 },
  { source: "venturebeat",     url: "https://venturebeat.com/feed/",                                      limit: 20, filter: true },
  { source: "mit_tech_review", url: "https://technologyreview.com/feed/",                                  limit: 15, filter: true },
];

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#\d+;/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function get(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return "";
  return decodeHtml(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim());
}

function getAttr(xml: string, tag: string, attr: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, "i"));
  return m?.[1] ?? "";
}

function parseDate(str: string): string | null {
  if (!str) return null;
  try { return new Date(str).toISOString(); } catch { return null; }
}

function parseRss(xml: string, cfg: FeedConfig): ContentItemInsert[] {
  const items: ContentItemInsert[] = [];
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    if (items.length >= cfg.limit) break;
    const block = match[1];

    const title   = get(block, "title");
    const summary = get(block, "description") || get(block, "summary") || get(block, "content:encoded") || "";
    const pubDate = parseDate(get(block, "pubDate") || get(block, "published") || get(block, "updated"));

    let url = get(block, "link");
    if (!url || !url.startsWith("http")) {
      url = getAttr(block, "link", "href") || get(block, "guid") || get(block, "id");
    }

    if (!title || !url || !url.startsWith("http")) continue;
    if (cfg.filter && !isAiRelated(title + " " + summary)) continue;

    let image_url: string | null = null;
    const mediaUrl = getAttr(block, "media:content", "url") || getAttr(block, "media:thumbnail", "url");
    if (mediaUrl && mediaUrl.startsWith("http")) {
      image_url = mediaUrl;
    } else {
      const encUrl  = getAttr(block, "enclosure", "url");
      const encType = getAttr(block, "enclosure", "type");
      if (encUrl && encType.startsWith("image/")) image_url = encUrl;
    }

    items.push({
      source:       cfg.source,
      title:        title.slice(0, 300),
      summary:      summary ? summary.slice(0, 600) : null,
      url,
      author:       get(block, "dc:creator") || get(block, "author") || null,
      image_url,
      score:        0,
      published_at: pubDate,
      tags:         [cfg.source, "news"],
      raw_data:     null,
    });
  }

  return items;
}

async function fetchFeed(cfg: FeedConfig): Promise<ContentItemInsert[]> {
  try {
    const res = await fetch(cfg.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AI-Pulse/1.0; +https://situaitionroom.com)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml, cfg);
  } catch {
    return [];
  }
}

// ── Anthropic sitemap scraper (no public RSS) ──────────────────────────────
async function fetchAnthropicNews(): Promise<ContentItemInsert[]> {
  try {
    const res = await fetch("https://www.anthropic.com/sitemap.xml", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AI-Pulse/1.0)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    // Extract /news/ URLs with lastmod
    const entries: { url: string; lastmod: string }[] = [];
    const urlRe = /<url>[\s\S]*?<loc>(https:\/\/www\.anthropic\.com\/news\/[^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g;
    let m;
    while ((m = urlRe.exec(xml)) !== null) {
      entries.push({ url: m[1], lastmod: m[2] });
    }

    // Sort newest first, take top 12
    entries.sort((a, b) => new Date(b.lastmod).getTime() - new Date(a.lastmod).getTime());
    const recent = entries.slice(0, 12);

    // Fetch each page in parallel to get OG metadata
    const results = await Promise.allSettled(
      recent.map(async ({ url, lastmod }) => {
        const r = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; AI-Pulse/1.0)" },
          signal: AbortSignal.timeout(6000),
        });
        if (!r.ok) return null;
        const html = await r.text();

        const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)?.[1]
          ?? html.match(/<title>([^<]+)<\/title>/i)?.[1]
          ?? url.split("/").pop()?.replace(/-/g, " ") ?? "";
        const ogDesc  = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i)?.[1]
          ?? html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)?.[1]
          ?? "";
        const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)?.[1] ?? null;

        if (!ogTitle) return null;

        return {
          source:       "anthropic" as Source,
          title:        ogTitle.replace(/\s*\|\s*Anthropic\s*$/, "").trim().slice(0, 300),
          summary:      ogDesc ? ogDesc.slice(0, 600) : null,
          url,
          author:       "Anthropic",
          image_url:    ogImage,
          score:        0,
          published_at: new Date(lastmod).toISOString(),
          tags:         ["anthropic", "news"],
          raw_data:     null,
        } as ContentItemInsert;
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<ContentItemInsert> => r.status === "fulfilled" && r.value !== null)
      .map(r => r.value);
  } catch {
    return [];
  }
}

export async function upsertRssFeeds(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  // Anthropic via sitemap scraper
  try {
    const items = await fetchAnthropicNews();
    if (items.length) {
      const { error } = await supabase
        .from("content_items")
        .upsert(items, { onConflict: "source,url", ignoreDuplicates: true });
      if (error) throw error;
    }
    counts.anthropic = items.length;
  } catch (e) {
    counts.anthropic = -1;
    console.error("Anthropic sitemap fetch failed:", e);
  }

  // All RSS feeds
  for (const cfg of FEEDS) {
    try {
      const items = await fetchFeed(cfg);
      if (!items.length) { counts[cfg.source] = 0; continue; }

      const { error } = await supabase
        .from("content_items")
        .upsert(items, { onConflict: "source,url", ignoreDuplicates: true });

      if (error) throw error;
      counts[cfg.source] = items.length;
    } catch (e) {
      counts[cfg.source] = -1;
      console.error(`RSS fetch failed for ${cfg.source}:`, e);
    }
  }

  return counts;
}

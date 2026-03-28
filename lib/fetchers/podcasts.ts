import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import type { ContentItemInsert, Source } from "@/types/database";

const FEEDS = [
  {
    source: "podcast_allin" as Source,
    url: "https://rss.libsyn.com/shows/254861/destinations/1928300.xml",
    name: "All-In Podcast",
  },
  {
    source: "podcast_moonshots" as Source,
    url: "https://feeds.megaphone.fm/DVVTS2890392624",
    name: "Moonshots Podcast",
  },
];

function extractText(val: unknown): string {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return extractText(val[0]);
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if ("_" in obj) return String(obj._);
    if ("#text" in obj) return String(obj["#text"]);
  }
  return "";
}

export async function fetchPodcastEpisodes(): Promise<ContentItemInsert[]> {
  const items: ContentItemInsert[] = [];

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, { next: { revalidate: 3600 } });
      if (!res.ok) continue;
      const xml = await res.text();

      // Simple XML parsing without xml2js dependency issues in edge
      const episodes = parseRSSFeed(xml);

      for (const ep of episodes.slice(0, 20)) {
        items.push({
          source: feed.source,
          title: ep.title,
          summary: ep.description,
          url: ep.link,
          author: feed.name,
          image_url: ep.image,
          score: 0,
          published_at: ep.pubDate ? new Date(ep.pubDate).toISOString() : null,
          tags: ["podcast", "ai", feed.source],
          raw_data: { duration: ep.duration, feed: feed.name },
        });
      }
    } catch (err) {
      console.error(`Failed to fetch feed ${feed.name}:`, err);
    }
  }

  return items;
}

interface ParsedEpisode {
  title: string;
  description: string | null;
  link: string;
  pubDate: string | null;
  image: string | null;
  duration: string | null;
}

function parseRSSFeed(xml: string): ParsedEpisode[] {
  const episodes: ParsedEpisode[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];

    const title = extractTagContent(item, "title");
    const link =
      extractTagContent(item, "enclosure url") ||
      extractAttr(item, "enclosure", "url") ||
      extractTagContent(item, "link") ||
      "";
    const description =
      extractTagContent(item, "description") ||
      extractTagContent(item, "content:encoded") ||
      null;
    const pubDate = extractTagContent(item, "pubDate") || null;
    const duration =
      extractTagContent(item, "itunes:duration") || null;
    const image =
      extractAttr(item, "itunes:image", "href") ||
      extractTagContent(item, "itunes:image") ||
      null;

    if (title) {
      episodes.push({
        title: decodeHTMLEntities(title),
        description: description
          ? decodeHTMLEntities(stripHTML(description)).slice(0, 600)
          : null,
        link,
        pubDate,
        image,
        duration,
      });
    }
  }

  return episodes;
}

function extractTagContent(xml: string, tag: string): string {
  const escapedTag = tag.replace(":", "\\:");
  const regex = new RegExp(
    `<${escapedTag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${escapedTag}>`,
    "s"
  );
  const m = xml.match(regex);
  return m ? m[1].trim() : "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const escapedTag = tag.replace(":", "\\:");
  const regex = new RegExp(`<${escapedTag}[^>]*${attr}="([^"]*)"`, "s");
  const m = xml.match(regex);
  return m ? m[1] : "";
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export { extractText };

export async function upsertPodcastEpisodes(): Promise<number> {
  const items = await fetchPodcastEpisodes();
  if (!items.length) return 0;

  const { error } = await supabase
    .from("content_items")
    .upsert(items, { onConflict: "source,url", ignoreDuplicates: true });

  if (error) throw error;
  return items.length;
}

import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import type { ContentItemInsert } from "@/types/database";

// Add more feeds here as you create them on rss.app
const FEEDS = [
  { username: "chamath", display: "Chamath Palihapitiya", url: "https://rss.app/feeds/BwoW1DxsaFzaiBW9.xml" },
  // { username: "sama", display: "Sam Altman", url: "https://rss.app/feeds/XXXXXXXX.xml" },
  // { username: "karpathy", display: "Andrej Karpathy", url: "https://rss.app/feeds/XXXXXXXX.xml" },
];

interface ParsedPost {
  title: string;
  link: string;
  pubDate: string | null;
  description: string | null;
}

function parseRSSFeed(xml: string): ParsedPost[] {
  const posts: ParsedPost[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = extractTag(item, "title");
    const link = extractTag(item, "link") || extractTag(item, "guid");
    const pubDate = extractTag(item, "pubDate");
    const description = extractTag(item, "description") || extractTag(item, "content:encoded");

    if (title && link) {
      posts.push({
        title: decodeEntities(stripHTML(title)),
        link,
        pubDate: pubDate || null,
        description: description ? decodeEntities(stripHTML(description)).slice(0, 600) : null,
      });
    }
  }

  return posts;
}

function extractTag(xml: string, tag: string): string {
  const escapedTag = tag.replace(":", "\\:");
  const regex = new RegExp(`<${escapedTag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${escapedTag}>`, "s");
  return xml.match(regex)?.[1]?.trim() ?? "";
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export async function fetchXPosts(): Promise<ContentItemInsert[]> {
  const items: ContentItemInsert[] = [];

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "AI-Pulse/1.0" },
        next: { revalidate: 1800 },
      });
      if (!res.ok) continue;

      const xml = await res.text();
      const posts = parseRSSFeed(xml);

      for (const post of posts.slice(0, 15)) {
        items.push({
          source: "x",
          title: post.title.slice(0, 140),
          summary: post.description ?? post.title,
          url: post.link,
          author: `@${feed.username} · ${feed.display}`,
          image_url: null,
          score: 0,
          published_at: post.pubDate ? new Date(post.pubDate).toISOString() : null,
          tags: ["x", "twitter", feed.username],
          raw_data: { username: feed.username },
        });
      }
    } catch (err) {
      console.error(`Failed to fetch X posts for @${feed.username}:`, err);
    }
  }

  return items;
}

export async function upsertXPosts(): Promise<number> {
  const items = await fetchXPosts();
  if (!items.length) return 0;

  const { error } = await supabase
    .from("content_items")
    .upsert(items, { onConflict: "source,url", ignoreDuplicates: true });

  if (error) throw error;
  return items.length;
}

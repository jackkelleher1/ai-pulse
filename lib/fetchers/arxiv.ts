import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import type { ContentItemInsert } from "@/types/database";

export async function fetchArxivPapers(): Promise<ContentItemInsert[]> {
  try {
    const res = await fetch(
      "https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=30",
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];
    const xml = await res.text();

    const entries = parseArxivFeed(xml);
    return entries;
  } catch (err) {
    console.error("Failed to fetch ArXiv papers:", err);
    return [];
  }
}

function parseArxivFeed(xml: string): ContentItemInsert[] {
  const items: ContentItemInsert[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];

    const title = extractTag(entry, "title")?.replace(/\s+/g, " ").trim();
    const summary = extractTag(entry, "summary")?.replace(/\s+/g, " ").trim();
    const published = extractTag(entry, "published");
    const id = extractTag(entry, "id");

    // Extract authors
    const authorMatches = [...entry.matchAll(/<name>(.*?)<\/name>/g)];
    const authors = authorMatches.map((m) => m[1]).slice(0, 3).join(", ");

    // Extract categories/tags
    const categoryMatches = [...entry.matchAll(/term="([^"]+)"/g)];
    const tags = categoryMatches
      .map((m) => m[1])
      .filter((t) => t.startsWith("cs."))
      .slice(0, 5);

    if (title && id) {
      const arxivId = id.split("/abs/").pop() || id;
      const url = `https://arxiv.org/abs/${arxivId}`;

      items.push({
        source: "arxiv",
        title,
        summary: summary ? summary.slice(0, 600) : null,
        url,
        author: authors || null,
        image_url: null,
        score: 0,
        published_at: published ? new Date(published).toISOString() : null,
        tags: ["arxiv", "research", ...tags],
        raw_data: { arxiv_id: arxivId },
      });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "s");
  const m = xml.match(regex);
  return m ? m[1].trim() : null;
}

export async function upsertArxivPapers(): Promise<number> {
  const items = await fetchArxivPapers();
  if (!items.length) return 0;

  const { error } = await supabase
    .from("content_items")
    .upsert(items, { onConflict: "source,url", ignoreDuplicates: true });

  if (error) throw error;
  return items.length;
}

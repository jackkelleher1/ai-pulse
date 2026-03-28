import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import type { ContentItemInsert } from "@/types/database";

const AI_KEYWORDS = [
  "ai", "llm", "gpt", "claude", "gemini", "openai", "anthropic",
  "machine learning", "deep learning", "neural", "transformer",
  "chatgpt", "language model", "artificial intelligence", "robot",
  "automation", "generative", "stable diffusion", "midjourney",
  "hugging face", "mistral", "llama", "rag", "vector", "embedding",
];

interface HNItem {
  id: number;
  title: string;
  url?: string;
  by: string;
  score: number;
  time: number;
  descendants?: number;
  text?: string;
}

function isAIRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return AI_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function fetchHackerNewsStories(): Promise<ContentItemInsert[]> {
  try {
    const res = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { next: { revalidate: 1800 } }
    );
    const ids: number[] = await res.json();
    const top100 = ids.slice(0, 100);

    const items = await Promise.allSettled(
      top100.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
          (r) => r.json() as Promise<HNItem>
        )
      )
    );

    const results: ContentItemInsert[] = [];

    for (const result of items) {
      if (result.status !== "fulfilled") continue;
      const item = result.value;
      if (!item?.title || !isAIRelated(item.title)) continue;

      results.push({
        source: "hackernews",
        title: item.title,
        summary: item.text ? item.text.replace(/<[^>]+>/g, "").slice(0, 500) : null,
        url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
        author: item.by,
        image_url: null,
        score: item.score,
        published_at: new Date(item.time * 1000).toISOString(),
        tags: ["hackernews", "ai"],
        raw_data: { hn_id: item.id, comments: item.descendants ?? 0 },
      });
    }

    return results;
  } catch (err) {
    console.error("Failed to fetch HN stories:", err);
    return [];
  }
}

export async function upsertHackerNewsStories(): Promise<number> {
  const items = await fetchHackerNewsStories();
  if (!items.length) return 0;

  const { error } = await supabase
    .from("content_items")
    .upsert(items, { onConflict: "source,url", ignoreDuplicates: true });

  if (error) throw error;
  return items.length;
}

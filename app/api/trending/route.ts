import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TRENDING_KEYWORDS = [
  "GPT-5", "GPT-4o", "Claude", "Gemini", "Llama", "Mistral",
  "OpenAI", "Anthropic", "Google DeepMind", "Meta AI",
  "AGI", "alignment", "reasoning", "multimodal", "agents",
  "RAG", "fine-tuning", "RLHF", "robotics", "Sora",
  "Stable Diffusion", "Midjourney", "o3", "o4",
  "AI safety", "regulation", "open source", "inference",
];

export async function GET() {
  // Fetch recent content from last 48 hours
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("content_items")
    .select("title, summary, source")
    .gte("published_at", since)
    .limit(500) as unknown as { data: { title: string; summary: string | null; source: string }[] | null; error: { message: string } | null };

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count keyword mentions
  const counts: Record<string, { count: number; sources: Set<string> }> = {};

  for (const item of data ?? []) {
    const text = `${item.title} ${item.summary ?? ""}`.toLowerCase();

    for (const kw of TRENDING_KEYWORDS) {
      if (text.includes(kw.toLowerCase())) {
        if (!counts[kw]) counts[kw] = { count: 0, sources: new Set() };
        counts[kw].count++;
        counts[kw].sources.add(item.source);
      }
    }
  }

  const trending = Object.entries(counts)
    .map(([topic, { count, sources }]) => ({
      topic,
      mention_count: count,
      sources: Array.from(sources),
    }))
    .sort((a, b) => b.mention_count - a.mention_count)
    .slice(0, 10);

  return NextResponse.json({ trending });
}

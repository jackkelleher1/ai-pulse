import { NextRequest, NextResponse } from "next/server";
import { upsertRedditPosts } from "@/lib/fetchers/reddit";
import { upsertHackerNewsStories } from "@/lib/fetchers/hackernews";
import { upsertPodcastEpisodes } from "@/lib/fetchers/podcasts";
import { upsertArxivPapers } from "@/lib/fetchers/arxiv";
import { upsertXPosts } from "@/lib/fetchers/x";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, number | string> = {};

  try {
    results.reddit = await upsertRedditPosts();
  } catch (e) {
    results.reddit = `error: ${e}`;
  }

  try {
    results.hackernews = await upsertHackerNewsStories();
  } catch (e) {
    results.hackernews = `error: ${e}`;
  }

  try {
    results.podcasts = await upsertPodcastEpisodes();
  } catch (e) {
    results.podcasts = `error: ${e}`;
  }

  try {
    results.arxiv = await upsertArxivPapers();
  } catch (e) {
    results.arxiv = `error: ${e}`;
  }

  try {
    results.x = await upsertXPosts();
  } catch (e) {
    results.x = `error: ${e}`;
  }

  return NextResponse.json({ success: true, results, timestamp: new Date().toISOString() });
}

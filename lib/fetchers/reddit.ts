import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import type { ContentItemInsert } from "@/types/database";

const SUBREDDITS = ["artificial", "MachineLearning", "LocalLLaMA", "singularity"];

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    url: string;
    author: string;
    score: number;
    thumbnail: string;
    created_utc: number;
    permalink: string;
    num_comments: number;
    subreddit: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

export async function fetchRedditPosts(): Promise<ContentItemInsert[]> {
  const items: ContentItemInsert[] = [];

  for (const subreddit of SUBREDDITS) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`,
        {
          headers: { "User-Agent": "AI-Pulse/1.0" },
          next: { revalidate: 1800 },
        }
      );

      if (!res.ok) continue;

      const json: RedditResponse = await res.json();

      for (const post of json.data.children) {
        const d = post.data;
        const thumbnail =
          d.thumbnail && d.thumbnail.startsWith("http") ? d.thumbnail : null;

        items.push({
          source: "reddit",
          title: d.title,
          summary: d.selftext ? d.selftext.slice(0, 500) : null,
          url: `https://reddit.com${d.permalink}`,
          author: `u/${d.author}`,
          image_url: thumbnail,
          score: d.score,
          published_at: new Date(d.created_utc * 1000).toISOString(),
          tags: [subreddit.toLowerCase(), "reddit"],
          raw_data: { num_comments: d.num_comments, subreddit: d.subreddit },
        });
      }
    } catch (err) {
      console.error(`Failed to fetch r/${subreddit}:`, err);
    }
  }

  return items;
}

export async function upsertRedditPosts(): Promise<number> {
  const items = await fetchRedditPosts();
  if (!items.length) return 0;

  const { error } = await supabase
    .from("content_items")
    .upsert(items, { onConflict: "source,url", ignoreDuplicates: true });

  if (error) throw error;
  return items.length;
}

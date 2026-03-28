export type Source =
  | "reddit"
  | "x"
  | "linkedin"
  | "podcast_allin"
  | "podcast_moonshots"
  | "hackernews"
  | "arxiv"
  | "anthropic"
  | "openai"
  | "huggingface"
  | "tldr_ai"
  | "venturebeat"
  | "mit_tech_review"
  | "deepmind"
  | "microsoft_ai"
  | "theverge"
  | "techcrunch"
  | "wired"
  | "ars_technica"
  | "the_decoder"
  | "nytimes"
  | "wsj"
  | "marketwatch";

export interface ContentItem {
  id: string;
  source: Source;
  title: string;
  summary: string | null;
  url: string;
  author: string | null;
  image_url: string | null;
  score: number;
  published_at: string | null;
  fetched_at: string;
  tags: string[];
  raw_data: Record<string, unknown> | null;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  mention_count: number;
  sources: string[];
  first_seen: string;
  last_seen: string;
}

export type ContentItemInsert = Omit<ContentItem, "id" | "fetched_at">;

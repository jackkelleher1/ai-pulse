import { createClient } from "@supabase/supabase-js";
import type { ContentItem, TrendingTopic } from "@/types/database";

export type Database = {
  public: {
    Tables: {
      content_items: {
        Row: ContentItem;
        Insert: Omit<ContentItem, "id" | "fetched_at">;
        Update: Partial<ContentItem>;
      };
      trending_topics: {
        Row: TrendingTopic;
        Insert: Omit<TrendingTopic, "id" | "first_seen" | "last_seen">;
        Update: Partial<TrendingTopic>;
      };
    };
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

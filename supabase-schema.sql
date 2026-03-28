-- Run this in your Supabase SQL Editor

-- Content items from all sources
CREATE TABLE IF NOT EXISTS content_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  author TEXT,
  image_url TEXT,
  score FLOAT DEFAULT 0,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[],
  raw_data JSONB,
  UNIQUE(source, url)
);

-- For tracking trending topics
CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  mention_count INT DEFAULT 1,
  sources TEXT[],
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_content_source ON content_items(source);
CREATE INDEX IF NOT EXISTS idx_content_published ON content_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_score ON content_items(score DESC);

-- Enable Row Level Security
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON content_items
  FOR SELECT USING (true);

CREATE POLICY "Allow public read" ON trending_topics
  FOR SELECT USING (true);

-- Allow service role full access (for cron/refresh)
CREATE POLICY "Allow service write" ON content_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service write" ON trending_topics
  FOR ALL USING (auth.role() = 'service_role');

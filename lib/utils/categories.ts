export type Category = "models" | "safety" | "research" | "funding" | "products" | "general";

export const CATEGORY_CONFIG: Record<Category, { label: string; color: string; bg: string }> = {
  models:   { label: "Models",   color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
  safety:   { label: "Safety",   color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/20" },
  research: { label: "Research", color: "text-pink-400",   bg: "bg-pink-400/10 border-pink-400/20" },
  funding:  { label: "Funding",  color: "text-emerald-400",bg: "bg-emerald-400/10 border-emerald-400/20" },
  products: { label: "Products", color: "text-sky-400",    bg: "bg-sky-400/10 border-sky-400/20" },
  general:  { label: "General",  color: "text-gray-400",   bg: "bg-gray-400/10 border-gray-400/20" },
};

const KEYWORDS: Record<Category, string[]> = {
  models: [
    "gpt", "claude", "gemini", "llama", "mistral", "language model", "llm",
    "weights", "parameters", "o1", "o3", "o4", "transformer", "inference",
    "token", "context window", "multimodal", "vision model", "foundation model",
    "deepseek", "grok", "qwen", "phi-", "falcon", "mixtral",
  ],
  safety: [
    "safety", "alignment", "risk", "regulation", "ban", "policy", "ethics",
    "harm", "dangerous", "concern", "superintelligence", "agi risk", "control",
    "bias", "misinformation", "deepfake", "legislation", "congress", "eu ai",
  ],
  research: [
    "paper", "arxiv", "study", "research", "breakthrough", "benchmark",
    "training", "dataset", "fine-tun", "rlhf", "published", "findings",
    "experiment", "novel", "propose", "outperforms", "state-of-the-art",
  ],
  funding: [
    "raised", "billion", "million", "investment", "valuation", "ipo",
    "acquisition", "funding", "revenue", "deal", "investor", "series",
    "venture", "backed", "partnership", "acqui-hire",
  ],
  products: [
    "launch", "release", "update", "new feature", "api", "app", "tool",
    "plugin", "integration", "available", "announced", "introducing",
    "open source", "open-source", "github", "demo", "beta",
  ],
  general: [],
};

export function detectCategory(title: string, summary?: string | null): Category {
  const text = `${title} ${summary ?? ""}`.toLowerCase();
  for (const [cat, kws] of Object.entries(KEYWORDS) as [Category, string[]][]) {
    if (cat === "general") continue;
    if (kws.some((kw) => text.includes(kw))) return cat;
  }
  return "general";
}

export function getUrgency(
  publishedAt: string | null,
  score: number,
  source: string
): "breaking" | "hot" | "new" | null {
  if (!publishedAt) return null;
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  const ageH = ageMs / 1000 / 3600;

  if (ageH < 2 && (source === "reddit" || source === "hackernews") && score > 50)
    return "breaking";
  if (score > 500 || (score > 100 && source === "hackernews"))
    return "hot";
  if (ageH < 6)
    return "new";
  return null;
}

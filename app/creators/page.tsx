import { supabase } from "@/lib/supabase";
import { Users, ExternalLink, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ContentItem } from "@/types/database";
import AvatarWithFallback from "@/components/AvatarWithFallback";

export const revalidate = 1800;

interface Creator {
  handle: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  followers: string;
  focus: string[];
  thesis: string;
  links: { label: string; url: string }[];
  searchTerms: string[];
  featured?: boolean;
}

const CREATORS: Creator[] = [
  {
    handle: "chamath",
    name: "Chamath Palihapitiya",
    role: "Founder & CEO, Social Capital",
    bio: "Early Facebook exec turned VC. Pioneer of the SPAC era. Outspoken on AI policy, energy infrastructure, and geopolitics. Founded 8090 to replace enterprise software with AI. His All-In takes move markets.",
    avatar: "https://pbs.twimg.com/profile_images/1883600182165848064/-9LbG3md_400x400.jpg",
    followers: "1.8M",
    focus: ["AI policy", "Energy", "Biotech", "Macro investing"],
    thesis: "AI + energy abundance = the biggest wealth creation event in human history.",
    links: [
      { label: "Social Capital", url: "https://www.socialcapital.com" },
      { label: "All-In Podcast", url: "https://www.allinpodcast.co" },
      { label: "8090.ai", url: "https://www.8090.ai" },
    ],
    searchTerms: ["chamath", "social capital", "8090"],
    featured: true,
  },
  {
    handle: "sama",
    name: "Sam Altman",
    role: "CEO, OpenAI",
    bio: "Leading the most consequential AI lab in the world through the GPT-4o and o3 era. Former YC president. Now navigating the transition from research lab to global infrastructure company.",
    avatar: "https://pbs.twimg.com/profile_images/804990434455887872/BG0Xh7Oa_400x400.jpg",
    followers: "3.5M",
    focus: ["AGI", "o3 / reasoning models", "AI policy", "Nuclear energy"],
    thesis: "Intelligence too cheap to meter will solve problems we've given up on solving.",
    links: [
      { label: "OpenAI", url: "https://openai.com" },
      { label: "Blog", url: "https://blog.samaltman.com" },
    ],
    searchTerms: ["openai", "sam altman", "chatgpt", "gpt", "o3"],
  },
  {
    handle: "karpathy",
    name: "Andrej Karpathy",
    role: "Founder, Eureka Labs · ex-OpenAI, Tesla",
    bio: "The internet's best AI teacher. Built Tesla Autopilot. Co-founded OpenAI. Now building Eureka Labs — an AI-native education platform. His YouTube videos are required viewing.",
    avatar: "https://pbs.twimg.com/profile_images/1296667294148382721/9Pr6XrPB_400x400.jpg",
    followers: "1M+",
    focus: ["LLMs", "Education", "Vibe coding", "Software 2.0"],
    thesis: "LLMs are a new computing paradigm. Most people haven't internalized this yet.",
    links: [
      { label: "Eureka Labs", url: "https://eurekalabs.ai" },
      { label: "YouTube", url: "https://youtube.com/@AndrejKarpathy" },
    ],
    searchTerms: ["karpathy", "eureka labs"],
  },
  {
    handle: "elonmusk",
    name: "Elon Musk",
    role: "CEO, xAI · Tesla · SpaceX · X",
    bio: "The most followed person on X. Running four category-defining companies simultaneously. xAI's Grok is now a real competitor in the frontier model race.",
    avatar: "https://pbs.twimg.com/profile_images/1845482317860454400/ykMVMYBN_400x400.jpg",
    followers: "220M+",
    focus: ["Grok 3", "Tesla Optimus", "Full Self-Driving", "DOGE"],
    thesis: "Open-source AI is the only counterweight to centralized AI power.",
    links: [
      { label: "xAI", url: "https://x.ai" },
      { label: "Tesla AI", url: "https://tesla.com/AI" },
    ],
    searchTerms: ["elon musk", "xai", "grok", "tesla"],
  },
  {
    handle: "dario",
    name: "Dario Amodei",
    role: "CEO, Anthropic",
    bio: "Ex-OpenAI research VP. Co-founded Anthropic to build AI that is safe and beneficial. His essay 'Machines of Loving Grace' is the most important long-form piece written on AI in 2024.",
    avatar: "https://pbs.twimg.com/profile_images/1595132826035085312/SqPKCVN9_400x400.jpg",
    followers: "500K+",
    focus: ["Claude 3.5/3.7", "Constitutional AI", "AI safety", "Biosecurity"],
    thesis: "Powerful AI can solve disease, poverty, and mental health — if built carefully.",
    links: [
      { label: "Anthropic", url: "https://anthropic.com" },
      { label: "Machines of Loving Grace", url: "https://darioamodei.com/machines-of-loving-grace" },
    ],
    searchTerms: ["anthropic", "dario amodei", "claude"],
  },
  {
    handle: "demishassabis",
    name: "Demis Hassabis",
    role: "CEO, Google DeepMind",
    bio: "Chess prodigy, neuroscientist, Nobel Prize winner (Chemistry 2024 for AlphaFold). Built the lab behind AlphaGo, AlphaFold, and Gemini. The most decorated scientist in AI history.",
    avatar: "https://pbs.twimg.com/profile_images/1697558049031340032/TbEkOF38_400x400.jpg",
    followers: "700K+",
    focus: ["Gemini 2.0", "AlphaFold 3", "Scientific AI", "AGI research"],
    thesis: "AI will be the most transformative tool in the history of science.",
    links: [
      { label: "Google DeepMind", url: "https://deepmind.google" },
    ],
    searchTerms: ["deepmind", "demis hassabis", "gemini", "alphafold"],
  },
];

function CheckBadge() {
  return (
    <svg viewBox="0 0 22 22" width="13" height="13" aria-label="Verified">
      <path fill="#1d9bf0" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
    </svg>
  );
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className="text-gray-600">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SlimPost({ item }: { item: ContentItem }) {
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block px-5 py-3.5 border-b border-[#1e2124] last:border-0 hover:bg-white/[0.025] transition-colors"
    >
      <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 group-hover:text-white transition-colors">
        {item.summary ?? item.title}
      </p>
      <p className="text-xs text-gray-700 mt-1.5 group-hover:text-gray-600 transition-colors">{timeAgo}</p>
    </a>
  );
}

const SOURCE_LABEL: Record<string, string> = {
  anthropic: "Anthropic", openai: "OpenAI", huggingface: "HuggingFace",
  tldr_ai: "TLDR AI", venturebeat: "VentureBeat", mit_tech_review: "MIT Tech Review",
  techcrunch: "TechCrunch", reuters: "Reuters", bloomberg: "Bloomberg",
  hackernews: "Hacker News", arxiv: "arXiv",
};

function NewsItem({ item }: { item: ContentItem }) {
  const timeAgo = item.published_at
    ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
    : "";
  const source = SOURCE_LABEL[item.source] ?? item.source;
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 px-5 py-3 border-b border-[#1e2124] last:border-0 hover:bg-white/[0.025] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300 leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {item.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-xs text-gray-700">{source}</span>
          <span className="text-gray-800 text-xs">·</span>
          <span className="text-xs text-gray-700">{timeAgo}</span>
        </div>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-800 group-hover:text-gray-500 shrink-0 mt-0.5 transition-colors" />
    </a>
  );
}

function CreatorCard({ creator, posts, mentions }: {
  creator: Creator;
  posts: ContentItem[];
  mentions: ContentItem[];
}) {
  return (
    <section className="rounded-xl border border-[#2f3336] bg-[#0a0a0a] overflow-hidden flex flex-col">
      {/* Profile header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <AvatarWithFallback
            src={creator.avatar}
            alt={creator.name}
            name={creator.name}
            className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-white/10"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-white">{creator.name}</span>
              <CheckBadge />
              <span className="text-xs text-gray-600">@{creator.handle}</span>
              <a
                href={`https://x.com/${creator.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto shrink-0 text-xs text-gray-500 hover:text-sky-400 border border-[#2f3336] hover:border-sky-500/30 px-2.5 py-0.5 rounded-full transition-colors"
              >
                Follow
              </a>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 truncate">
              {creator.role}
              <span className="text-gray-700"> · </span>
              {creator.followers} followers
            </p>
          </div>
        </div>

        <p className="pl-3 border-l-2 border-accent/50 text-xs text-gray-400 italic leading-relaxed mb-3">
          &ldquo;{creator.thesis}&rdquo;
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {creator.focus.map(f => (
            <span key={f} className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent/70 border border-accent/20">
              {f}
            </span>
          ))}
        </div>

        {creator.links.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {creator.links.map(l => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-300 transition-colors">
                <ExternalLink className="w-3 h-3" />{l.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {posts.length > 0 && (
        <div className="border-t border-[#2f3336]">
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#1e2124]">
            <XLogo />
            <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">Latest posts</span>
            <span className="ml-auto text-xs text-gray-800">{posts.length}</span>
          </div>
          {posts.slice(0, 3).map(item => <SlimPost key={item.id} item={item} />)}
        </div>
      )}

      {mentions.length > 0 && (
        <div className="border-t border-[#2f3336]">
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#1e2124]">
            <BookOpen className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">In the news</span>
          </div>
          {mentions.map(item => <NewsItem key={item.id} item={item} />)}
        </div>
      )}

      {posts.length === 0 && mentions.length === 0 && (
        <div className="border-t border-[#2f3336] px-5 py-8 text-center">
          <p className="text-xs text-gray-700">No recent posts or mentions — refresh the feed.</p>
        </div>
      )}
    </section>
  );
}

function FeaturedCreatorCard({ creator, posts, mentions }: {
  creator: Creator;
  posts: ContentItem[];
  mentions: ContentItem[];
}) {
  return (
    <section className="col-span-full rounded-xl border border-accent/30 bg-[#0a0a0a] overflow-hidden">
      {/* Top strip */}
      <div className="px-6 pt-6 pb-5 border-b border-[#2f3336]">
        <div className="flex items-start gap-5">
          {/* Large avatar */}
          <AvatarWithFallback
            src={creator.avatar}
            alt={creator.name}
            name={creator.name}
            className="w-20 h-20 rounded-full object-cover shrink-0 ring-2 ring-accent/30"
          />

          {/* Identity + thesis */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-lg font-bold text-white">{creator.name}</span>
              <CheckBadge />
              <span className="text-sm text-gray-600">@{creator.handle}</span>
              <span className="text-xs font-mono text-accent/70 bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full ml-1">
                Featured
              </span>
              <a
                href={`https://x.com/${creator.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto shrink-0 text-xs text-gray-500 hover:text-sky-400 border border-[#2f3336] hover:border-sky-500/30 px-3 py-1 rounded-full transition-colors"
              >
                Follow
              </a>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {creator.role}
              <span className="text-gray-700"> · </span>
              {creator.followers} followers
            </p>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">{creator.bio}</p>

            <p className="pl-4 border-l-2 border-accent/60 text-sm text-gray-300 italic leading-relaxed mb-4">
              &ldquo;{creator.thesis}&rdquo;
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-wrap gap-1.5">
                {creator.focus.map(f => (
                  <span key={f} className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent/70 border border-accent/20">
                    {f}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 ml-auto">
                {creator.links.map(l => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-300 transition-colors">
                    <ExternalLink className="w-3 h-3" />{l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content — posts + news side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#2f3336]">
        {/* Posts */}
        <div>
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#1e2124]">
            <XLogo />
            <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">Latest posts</span>
            <span className="ml-auto text-xs text-gray-800">{posts.length}</span>
          </div>
          {posts.length > 0
            ? posts.slice(0, 5).map(item => <SlimPost key={item.id} item={item} />)
            : <p className="px-5 py-6 text-xs text-gray-700">No recent posts — refresh the feed.</p>
          }
        </div>

        {/* News */}
        <div>
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#1e2124]">
            <BookOpen className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">In the news</span>
          </div>
          {mentions.length > 0
            ? mentions.map(item => <NewsItem key={item.id} item={item} />)
            : <p className="px-5 py-6 text-xs text-gray-700">No recent mentions — refresh the feed.</p>
          }
        </div>
      </div>
    </section>
  );
}

export default async function CreatorsPage() {
  const { data: xData } = await supabase
    .from("content_items")
    .select("*")
    .eq("source", "x")
    .order("published_at", { ascending: false })
    .limit(80);

  const { data: newsData } = await supabase
    .from("content_items")
    .select("*")
    .not("source", "in", '("x","reddit")')
    .order("published_at", { ascending: false })
    .limit(200);

  const xPosts  = (xData  ?? []) as ContentItem[];
  const allNews = (newsData ?? []) as ContentItem[];

  const grouped: Record<string, ContentItem[]> = {};
  for (const item of xPosts) {
    const handle = (item.tags as string[]).find(t => t !== "x" && t !== "twitter") ?? "unknown";
    if (!grouped[handle]) grouped[handle] = [];
    grouped[handle].push(item);
  }

  function getNewsMentions(creator: Creator): ContentItem[] {
    return allNews
      .filter(item => {
        const text = `${item.title} ${item.summary ?? ""}`.toLowerCase();
        return creator.searchTerms.some(term => text.includes(term.toLowerCase()));
      })
      .slice(0, 6);
  }

  const featured  = CREATORS.find(c => c.featured)!;
  const rest      = CREATORS.filter(c => !c.featured);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-sky-500/15 flex items-center justify-center">
          <Users className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Creators</h1>
          <p className="text-xs text-gray-500">The minds shaping the AI era — posts, news, and context</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Chamath — featured full-width */}
        <FeaturedCreatorCard
          creator={featured}
          posts={grouped[featured.handle] ?? []}
          mentions={getNewsMentions(featured)}
        />

        {/* Everyone else */}
        {rest.map(creator => (
          <CreatorCard
            key={creator.handle}
            creator={creator}
            posts={grouped[creator.handle] ?? []}
            mentions={getNewsMentions(creator)}
          />
        ))}
      </div>
    </div>
  );
}

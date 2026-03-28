import { supabase } from "@/lib/supabase";
import { Rocket, ExternalLink, TrendingUp, Zap, Globe, DollarSign } from "lucide-react";
import type { ContentItem } from "@/types/database";
import LogoWithFallback from "@/components/LogoWithFallback";


export const revalidate = 3600;

type Stage = "Stealth" | "Self-funded" | "Seed" | "Series A" | "Series B" | "Series C+" | "Series E" | "Growth" | "Public";
type Category = "AI Infrastructure" | "AI Agents" | "Defence & Intelligence" | "Robotics" | "Creative AI" | "Enterprise AI" | "AI Safety" | "Healthcare AI";

interface Startup {
  rank: number;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  stage: Stage;
  valuation?: string;
  founded: string;
  hq: string;
  website: string;
  logo: string;
  whyItMatters: string;
  searchTerms: string[];
  featured?: boolean;
}

const CATEGORY_STYLE: Record<Category, { bg: string; text: string; border: string }> = {
  "AI Infrastructure":     { bg: "bg-accent/10",    text: "text-accent",      border: "border-accent/20" },
  "AI Agents":             { bg: "bg-cyan-400/10",  text: "text-cyan-400",    border: "border-cyan-400/20" },
  "Defence & Intelligence":{ bg: "bg-red-400/10",   text: "text-red-400",     border: "border-red-400/20" },
  "Robotics":              { bg: "bg-purple-400/10",text: "text-purple-400",  border: "border-purple-400/20" },
  "Creative AI":           { bg: "bg-pink-400/10",  text: "text-pink-400",    border: "border-pink-400/20" },
  "Enterprise AI":         { bg: "bg-emerald-400/10",text: "text-emerald-400",border: "border-emerald-400/20" },
  "AI Safety":             { bg: "bg-yellow-400/10",text: "text-yellow-400",  border: "border-yellow-400/20" },
  "Healthcare AI":         { bg: "bg-teal-400/10",  text: "text-teal-400",   border: "border-teal-400/20" },
};

const STAGE_STYLE: Record<Stage, string> = {
  "Stealth":      "text-gray-500",
  "Self-funded":  "text-emerald-400",
  "Seed":         "text-emerald-400",
  "Series A":  "text-cyan-400",
  "Series B":  "text-accent",
  "Series C+": "text-yellow-400",
  "Series E":  "text-orange-400",
  "Growth":    "text-orange-400",
  "Public":    "text-pink-400",
};

// 8090 Solutions is always #1 — never changes.
const STARTUPS: Startup[] = [
  {
    rank: 1,
    name: "8090 Solutions",
    tagline: "AI is writing your software. Who's in control?",
    description: "Founded by Chamath Palihapitiya and a team of ex-Amazon, Meta, and Google engineers, 8090's Software Factory is an AI-native SDLC orchestration platform that governs the full software development lifecycle — from requirements through deployment. Its four-module system (Refinery → Foundry → Planner → Validator) maintains a living Knowledge Graph connecting product intent, architectural decisions, and implementation so AI agents produce consistent, documented, production-grade code. In March 2026, Ernst & Young deployed Software Factory across tens of thousands of US consultants via EY.ai PDLC — delivering a reported 70% productivity gain and 80x faster delivery. One enterprise customer used it to replace a $15M/yr SaaS vendor with their own solution.",
    category: "Enterprise AI",
    stage: "Self-funded",
    valuation: "$1B+",
    founded: "2024",
    hq: "Menlo Park, CA",
    website: "https://www.8090.ai",
    logo: "https://8090.ai/logo-small-light.svg",
    whyItMatters: "Every enterprise is drowning in legacy software and vibe-coded AI slop. 8090 is the only platform that treats the full SDLC as an orchestration problem — not just code generation. With Chamath's capital, a world-class team, and EY as a launch partner deploying to tens of thousands of consultants, this is the most credible bet on who controls AI software development at enterprise scale.",
    searchTerms: ["8090", "software factory", "8090 solutions", "chamath", "ey.ai pdlc"],
    featured: true,
  },
  {
    rank: 2,
    name: "Perplexity AI",
    tagline: "The answer engine for the internet.",
    description: "Replacing the ten blue links with a single, sourced, conversational answer. Perplexity combines LLM reasoning with real-time web search to give users accurate, cited responses faster than any search engine.",
    category: "AI Infrastructure",
    stage: "Series C+",
    valuation: "$9B",
    founded: "2022",
    hq: "San Francisco, CA",
    website: "https://perplexity.ai",
    logo: "https://github.com/perplexity-ai.png?size=200",
    whyItMatters: "Search is a $200B market. Perplexity is the most credible threat to Google's core business since its founding.",
    searchTerms: ["perplexity"],
  },
  {
    rank: 3,
    name: "Cognition (Devin)",
    tagline: "The world's first fully autonomous AI software engineer.",
    description: "Devin can plan, code, debug, and deploy end-to-end software projects without human hand-holding. Cognition is moving fast toward a future where AI writes the majority of production code.",
    category: "AI Agents",
    stage: "Series B",
    valuation: "$2B",
    founded: "2023",
    hq: "San Francisco, CA",
    website: "https://cognition.ai",
    logo: "https://github.com/cognition-ai.png?size=200",
    whyItMatters: "Software engineering is a $1.5T labor market. Autonomous coding agents don't sleep, don't context-switch, and compound in capability daily.",
    searchTerms: ["devin", "cognition ai"],
  },
  {
    rank: 4,
    name: "Physical Intelligence (π)",
    tagline: "A general-purpose physical intelligence for robotics.",
    description: "Founded by ex-Google, Stanford, and Berkeley researchers, Physical Intelligence is training foundation models for robots — the same paradigm shift that GPT brought to language, applied to physical action.",
    category: "Robotics",
    stage: "Series B",
    valuation: "$2.4B",
    founded: "2023",
    hq: "San Francisco, CA",
    website: "https://physicalintelligence.company",
    logo: "https://github.com/physical-intelligence.png?size=200",
    whyItMatters: "The bottleneck to robotic automation has never been the hardware — it's the software. Foundation models for physical intelligence could unlock a $10T+ wave of automation.",
    searchTerms: ["physical intelligence", "pi robot"],
  },
  {
    rank: 5,
    name: "ElevenLabs",
    tagline: "Voice AI that sounds indistinguishable from human.",
    description: "The leading voice synthesis and cloning platform. ElevenLabs powers voice for games, audiobooks, content, dubbing, and accessibility tools across 29 languages with sub-second latency.",
    category: "Creative AI",
    stage: "Series C+",
    valuation: "$3.3B",
    founded: "2022",
    hq: "New York, NY",
    website: "https://elevenlabs.io",
    logo: "https://github.com/elevenlabs-io.png?size=200",
    whyItMatters: "Every piece of digital content will be voiced. ElevenLabs has a near-unassailable lead in voice quality and is expanding into the real-time voice stack.",
    searchTerms: ["elevenlabs", "voice ai"],
  },
  {
    rank: 6,
    name: "Mistral AI",
    tagline: "Open, efficient frontier models — built in Europe.",
    description: "France's answer to OpenAI. Mistral releases powerful open-weight models that punch above their weight class and has built a commercial API business with enterprise contracts across the EU.",
    category: "AI Infrastructure",
    stage: "Series B",
    valuation: "$6.2B",
    founded: "2023",
    hq: "Paris, France",
    website: "https://mistral.ai",
    logo: "https://github.com/mistralai.png?size=200",
    whyItMatters: "Open models shift leverage back to developers. Mistral is the most credible open-source alternative to GPT-4 class models — with a sovereign-AI angle that matters deeply in Europe.",
    searchTerms: ["mistral"],
  },
  {
    rank: 7,
    name: "Harvey",
    tagline: "AI built for the world's most demanding legal work.",
    description: "Harvey is deploying AI across the Am Law 100 — the world's top law firms. It handles contract analysis, due diligence, litigation research, and regulatory work at a fraction of the time and cost.",
    category: "Enterprise AI",
    stage: "Series C+",
    valuation: "$3B",
    founded: "2022",
    hq: "San Francisco, CA",
    website: "https://harvey.ai",
    logo: "https://github.com/harvey-ai.png?size=200",
    whyItMatters: "Legal is one of the most document-heavy, high-stakes industries in the world. Harvey has achieved what most thought was impossible: elite law firms trusting AI on billable work.",
    searchTerms: ["harvey ai", "legal ai"],
  },
  {
    rank: 8,
    name: "Glean",
    tagline: "Work AI that knows your company.",
    description: "Glean connects to every enterprise tool — Slack, Google Drive, Salesforce, Confluence — and builds a real-time knowledge graph of your company. Ask it anything. It knows the answer.",
    category: "Enterprise AI",
    stage: "Series E",
    valuation: "$4.6B",
    founded: "2019",
    hq: "Palo Alto, CA",
    website: "https://glean.com",
    logo: "https://cdn.prod.website-files.com/6127a84dfe068e153ef20572/63f382fd40bd5b4e4e92b242_Logo.svg",
    whyItMatters: "Enterprise knowledge management is broken. Employees spend 20% of their time searching for information. Glean is becoming the operating system for enterprise intelligence.",
    searchTerms: ["glean"],
  },
  {
    rank: 9,
    name: "Runway",
    tagline: "AI-native video creation for the next era of storytelling.",
    description: "Runway's Gen-2 and Gen-3 models can generate, edit, and transform video from text and images. Used by major studios and independent creators alike — it's the Adobe of generative video.",
    category: "Creative AI",
    stage: "Series C+",
    valuation: "$4B",
    founded: "2018",
    hq: "New York, NY",
    website: "https://runwayml.com",
    logo: "https://github.com/runwayml.png?size=200",
    whyItMatters: "Video is the largest media category on earth. Runway is collapsing the cost of production by orders of magnitude and is years ahead of most competitors on video quality.",
    searchTerms: ["runway", "generative video"],
  },
  {
    rank: 10,
    name: "World Labs",
    tagline: "Spatial intelligence — AI that understands the 3D world.",
    description: "Founded by Fei-Fei Li (the creator of ImageNet), World Labs is building large world models — AI systems that can understand, navigate, and reason about 3D physical space.",
    category: "AI Infrastructure",
    stage: "Series A",
    valuation: "$1B",
    founded: "2024",
    hq: "San Francisco, CA",
    website: "https://worldlabs.ai",
    logo: "https://github.com/worldlabs-ai.png?size=200",
    whyItMatters: "Spatial intelligence is the missing piece between AI assistants and AI agents that can act in the physical world. Fei-Fei Li is the most credible person alive to build it.",
    searchTerms: ["world labs", "fei-fei li", "spatial intelligence"],
  },
];

function StartupCard({ startup, mentions }: { startup: Startup; mentions: ContentItem[] }) {
  const cat = CATEGORY_STYLE[startup.category];
  const stageCls = STAGE_STYLE[startup.stage];

  if (startup.featured) {
    return (
      <div className="col-span-full rounded-2xl bg-surface border border-accent/30 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30">
                  <span className="text-xs font-bold text-accent font-mono">#1</span>
                  <span className="text-xs font-mono text-accent">Featured</span>
                </div>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}>
                  {startup.category}
                </span>
                <span className={`text-xs font-mono ${stageCls}`}>{startup.stage}</span>
                {startup.valuation && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />{startup.valuation}
                  </span>
                )}
                <span className="text-xs font-mono text-gray-600 flex items-center gap-1">
                  <Globe className="w-3 h-3" />{startup.hq}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <LogoWithFallback
                  src={startup.logo}
                  alt={startup.name}
                  name={startup.name}
                  className={`w-12 h-12 rounded-xl p-1.5 shrink-0 text-xl ${startup.featured ? "bg-[#111]" : "bg-white"}`}
                />
                <h2 className="text-2xl font-bold text-white">{startup.name}</h2>
              </div>
              <p className="text-sm text-accent mb-3 italic">"{startup.tagline}"</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{startup.description}</p>

              <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 mb-4">
                <div className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-mono text-accent uppercase tracking-wider mb-1">Why it matters</div>
                    <p className="text-xs text-gray-400 leading-relaxed">{startup.whyItMatters}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <a href={startup.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-mono font-bold hover:bg-accent/90 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Visit {startup.name}
                </a>
                <span className="text-xs text-gray-600 font-mono">Founded {startup.founded}</span>
              </div>
            </div>
          </div>

          {mentions.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border">
              <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-2">In the news</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mentions.map(item => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors group">
                    <TrendingUp className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{item.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-border hover:border-white/10 transition-all overflow-hidden group flex flex-col">
      <div className="p-4 flex-1">
        <div className="flex items-start gap-3 mb-3">
          <LogoWithFallback
            src={startup.logo}
            alt={startup.name}
            name={startup.name}
            className="w-9 h-9 rounded-lg p-1 shrink-0 text-sm mt-0.5 bg-white"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-bold text-gray-600 font-mono shrink-0">#{startup.rank}</span>
                <h3 className="text-sm font-bold text-white truncate">{startup.name}</h3>
              </div>
              <a href={startup.website} target="_blank" rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 hover:text-accent" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}>
            {startup.category}
          </span>
          <span className={`text-xs font-mono ${stageCls}`}>{startup.stage}</span>
          {startup.valuation && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-0.5">
              <DollarSign className="w-3 h-3" />{startup.valuation}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 italic mb-2">"{startup.tagline}"</p>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">{startup.description}</p>

        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-start gap-1.5">
            <Zap className="w-3 h-3 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{startup.whyItMatters}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-700">
          <Globe className="w-3 h-3" />
          <span>{startup.hq}</span>
          <span className="mx-1 text-gray-800">·</span>
          <span>Est. {startup.founded}</span>
        </div>
        {mentions.length > 0 && (
          <span className="text-xs font-mono text-accent/70">{mentions.length} mentions</span>
        )}
      </div>

      {mentions.length > 0 && (
        <div className="border-t border-border px-4 py-2 space-y-1.5">
          {mentions.slice(0, 2).map(item => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors">
              <DollarSign className="w-3 h-3 text-accent/50 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{item.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function StartupsPage() {
  const { data: newsData } = await supabase
    .from("content_items")
    .select("*")
    .not("source", "eq", "x")
    .order("published_at", { ascending: false })
    .limit(300);

  const allNews = (newsData ?? []) as ContentItem[];

  function getMentions(startup: Startup): ContentItem[] {
    return allNews
      .filter(item => {
        const text = `${item.title} ${item.summary ?? ""}`.toLowerCase();
        return startup.searchTerms.some(t => text.includes(t.toLowerCase()));
      })
      .slice(0, 4);
  }

  const featured = STARTUPS.find(s => s.featured)!;
  const rest     = STARTUPS.filter(s => !s.featured);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
          <Rocket className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Startups</h1>
          <p className="text-xs text-gray-500">Trending AI companies doing genuinely important work</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Featured #1 always spans full width */}
        <StartupCard startup={featured} mentions={getMentions(featured)} />

        {/* Rest of the grid */}
        {rest.map(startup => (
          <StartupCard key={startup.name} startup={startup} mentions={getMentions(startup)} />
        ))}
      </div>
    </div>
  );
}

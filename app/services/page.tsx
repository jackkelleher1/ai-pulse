import { ExternalLink, Zap, Globe, Briefcase, Star } from "lucide-react";

type Category =
  | "Leadership & Development"
  | "AI Strategy"
  | "Talent & Recruiting"
  | "Legal & Compliance"
  | "Cybersecurity"
  | "Marketing & Growth"
  | "Finance & CFO"
  | "IT & Infrastructure";

interface Service {
  rank: number;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  website: string;
  logo?: string;
  whyItMatters: string;
  featured?: boolean;
}

const CATEGORY_STYLE: Record<Category, { bg: string; text: string; border: string }> = {
  "Leadership & Development": { bg: "bg-accent/10",      text: "text-accent",       border: "border-accent/20" },
  "AI Strategy":              { bg: "bg-cyan-400/10",    text: "text-cyan-400",     border: "border-cyan-400/20" },
  "Talent & Recruiting":      { bg: "bg-purple-400/10",  text: "text-purple-400",   border: "border-purple-400/20" },
  "Legal & Compliance":       { bg: "bg-yellow-400/10",  text: "text-yellow-400",   border: "border-yellow-400/20" },
  "Cybersecurity":            { bg: "bg-red-400/10",     text: "text-red-400",      border: "border-red-400/20" },
  "Marketing & Growth":       { bg: "bg-pink-400/10",    text: "text-pink-400",     border: "border-pink-400/20" },
  "Finance & CFO":            { bg: "bg-emerald-400/10", text: "text-emerald-400",  border: "border-emerald-400/20" },
  "IT & Infrastructure":      { bg: "bg-orange-400/10",  text: "text-orange-400",   border: "border-orange-400/20" },
};

const SERVICES: Service[] = [
  {
    rank: 1,
    name: "Savage Systems",
    tagline: "Build leaders. Build teams. Build legacies.",
    description: "Savage Systems delivers high-impact leadership development workshops designed for the modern era. Their programs equip executives, managers, and high-potential talent with the frameworks, mindset, and skills to lead through change — including the AI transformation reshaping every industry. Whether you're building a leadership pipeline, aligning a senior team, or preparing your organization to operate at the pace of AI, Savage Systems brings structured, battle-tested methodology to every engagement.",
    category: "Leadership & Development",
    website: "https://savagesystems.co/",
    whyItMatters: "The companies that will win the AI era aren't just the ones with the best tools — they're the ones with the best leaders. Human judgment, team alignment, and decisive action under uncertainty are more valuable than ever. Savage Systems builds those capabilities.",
    featured: true,
  },
  {
    rank: 2,
    name: "Accenture AI",
    tagline: "AI transformation at enterprise scale.",
    description: "Accenture's AI practice helps Fortune 500 companies design, build, and deploy AI strategy — from identifying high-value use cases to full implementation and change management.",
    category: "AI Strategy",
    website: "https://www.accenture.com/us-en/services/ai-artificial-intelligence-index",
    whyItMatters: "Most enterprises don't lack AI tools — they lack a coherent strategy. Accenture bridges the gap between executive vision and operational reality.",
  },
  {
    rank: 3,
    name: "Korn Ferry",
    tagline: "Organizational talent for the AI era.",
    description: "The world's largest executive search and talent management firm. Korn Ferry helps companies attract, develop, and retain the leaders and technical talent needed to compete in an AI-driven market.",
    category: "Talent & Recruiting",
    website: "https://www.kornferry.com",
    whyItMatters: "AI is creating a two-tier talent market: those who can work with it and those who can't. Korn Ferry finds and develops the people on the right side of that divide.",
  },
  {
    rank: 4,
    name: "Cooley LLP",
    tagline: "Legal counsel for high-growth technology companies.",
    description: "Cooley is the go-to law firm for AI startups, venture-backed companies, and enterprise tech. From IP protection to regulatory compliance to fundraising, they've seen every AI legal challenge before you have.",
    category: "Legal & Compliance",
    website: "https://www.cooley.com",
    whyItMatters: "AI raises novel legal questions around IP, liability, data privacy, and regulation. Getting ahead of these now — before they become crises — is worth every dollar.",
  },
  {
    rank: 5,
    name: "CrowdStrike",
    tagline: "AI-native cybersecurity for the modern enterprise.",
    description: "CrowdStrike's Falcon platform uses AI to detect and stop breaches in real time. As AI expands the attack surface and enables more sophisticated threats, CrowdStrike is the platform organizations trust to protect their operations.",
    category: "Cybersecurity",
    website: "https://www.crowdstrike.com",
    whyItMatters: "Every AI deployment introduces new attack vectors. The same AI breakthroughs powering your products are being weaponized by adversaries. Proactive, AI-native security is now table stakes.",
  },
  {
    rank: 6,
    name: "Demand Curve",
    tagline: "Growth strategy for startups that want to scale.",
    description: "Demand Curve has trained 10,000+ growth marketers and worked directly with hundreds of startups to build scalable, data-driven acquisition and retention systems that work in an AI-accelerated world.",
    category: "Marketing & Growth",
    website: "https://www.demandcurve.com",
    whyItMatters: "Growth has changed. AI-generated content floods every channel; attention is scarcer than ever. Demand Curve teaches the frameworks that cut through.",
  },
  {
    rank: 7,
    name: "Pilot.com",
    tagline: "Finance and accounting for startups and scaleups.",
    description: "Pilot handles bookkeeping, tax, and CFO services for fast-growing companies. Their technology-first approach means founders get real-time financial clarity without hiring a full finance team.",
    category: "Finance & CFO",
    website: "https://www.pilot.com",
    whyItMatters: "AI startups move fast and burn capital. Having clean financials and strategic CFO guidance from day one is the difference between a fundable company and a messy cap table.",
  },
  {
    rank: 8,
    name: "Cloudflare",
    tagline: "The connectivity cloud powering the AI stack.",
    description: "Cloudflare protects and accelerates applications across the internet — and is rapidly becoming critical infrastructure for AI workloads with Workers AI, AI Gateway, and vectorize capabilities built natively into its global network.",
    category: "IT & Infrastructure",
    website: "https://www.cloudflare.com",
    whyItMatters: "Every AI product needs fast, secure, globally distributed infrastructure. Cloudflare is quietly becoming the backbone of the AI application layer.",
  },
];

function ServiceCard({ service }: { service: Service }) {
  const cat = CATEGORY_STYLE[service.category];

  if (service.featured) {
    return (
      <div className="col-span-full rounded-2xl bg-surface border border-accent/30 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30">
              <Star className="w-3 h-3 text-accent" />
              <span className="text-xs font-mono text-accent">Featured</span>
            </div>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}>
              {service.category}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">{service.name}</h2>
          <p className="text-sm text-accent mb-4 italic">"{service.tagline}"</p>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">{service.description}</p>

          <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 mb-5">
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-mono text-accent uppercase tracking-wider mb-1">Why it matters</div>
                <p className="text-xs text-gray-400 leading-relaxed">{service.whyItMatters}</p>
              </div>
            </div>
          </div>

          <a
            href={service.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-mono font-bold hover:bg-accent/90 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Visit {service.name}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-border hover:border-white/10 transition-all overflow-hidden group flex flex-col">
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-600 font-mono">#{service.rank}</span>
              <h3 className="text-sm font-bold text-white">{service.name}</h3>
            </div>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}>
              {service.category}
            </span>
          </div>
          <a href={service.website} target="_blank" rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
            <ExternalLink className="w-3.5 h-3.5 text-gray-600 hover:text-accent" />
          </a>
        </div>

        <p className="text-xs text-gray-500 italic mb-2">"{service.tagline}"</p>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">{service.description}</p>

        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-start gap-1.5">
            <Zap className="w-3 h-3 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{service.whyItMatters}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <a
          href={service.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono text-gray-500 hover:text-white hover:border-white/20 transition-all"
        >
          <Globe className="w-3 h-3" />
          {service.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
        </a>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const featured = SERVICES.find(s => s.featured)!;
  const rest     = SERVICES.filter(s => !s.featured);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Services</h1>
          <p className="text-xs text-gray-500">Trusted partners for the AI era — from leadership to infrastructure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ServiceCard service={featured} />
        {rest.map(service => (
          <ServiceCard key={service.name} service={service} />
        ))}
      </div>
    </div>
  );
}

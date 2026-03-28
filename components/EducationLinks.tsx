import { ExternalLink, BookOpen, Cpu, FlaskConical, Wrench, Users } from "lucide-react";

const RESOURCES = [
  {
    category: "Foundations",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    icon: BookOpen,
    items: [
      { title: "fast.ai — Practical Deep Learning", desc: "Free top-down course. The fastest path from zero to building real models.", url: "https://course.fast.ai" },
      { title: "Neural Networks: Zero to Hero", desc: "Andrej Karpathy builds everything from scratch. The clearest explainer on the internet.", url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ" },
    ],
  },
  {
    category: "LLMs & Agents",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    icon: Cpu,
    items: [
      { title: "Hugging Face NLP Course", desc: "Free, hands-on course covering transformers, fine-tuning, and deployment.", url: "https://huggingface.co/learn/nlp-course" },
      { title: "LLMs from Scratch", desc: "Sebastian Raschka's book — build a GPT-style LLM from the ground up in PyTorch.", url: "https://github.com/rasbt/LLMs-from-scratch" },
    ],
  },
  {
    category: "Research",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    icon: FlaskConical,
    items: [
      { title: "Papers With Code", desc: "Every ML paper linked to its implementation. The best way to stay current.", url: "https://paperswithcode.com" },
      { title: "Hugging Face Daily Papers", desc: "Top arXiv papers voted on by the ML community — curated signal.", url: "https://huggingface.co/papers" },
    ],
  },
  {
    category: "Tools & Docs",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    icon: Wrench,
    items: [
      { title: "OpenAI Cookbook", desc: "Practical examples and guides for building with GPT-4o and o3.", url: "https://cookbook.openai.com" },
      { title: "Anthropic Docs", desc: "Claude API docs, prompt engineering guides, and the Claude 3.5 system card.", url: "https://docs.anthropic.com" },
    ],
  },
  {
    category: "Stay Current",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    icon: Users,
    items: [
      { title: "The Batch — DeepLearning.AI", desc: "Andrew Ng's weekly newsletter. Consistently the best signal-to-noise in AI media.", url: "https://www.deeplearning.ai/the-batch" },
      { title: "TLDR AI", desc: "Daily 5-minute digest of the most important AI news, research, and launches.", url: "https://tldr.tech/ai" },
    ],
  },
];

export default function EducationLinks() {
  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-5">
        <BookOpen className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Learn AI
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESOURCES.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.category} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-md ${category.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${category.color}`} />
                </div>
                <span className={`text-xs font-semibold ${category.color} uppercase tracking-wider`}>
                  {category.category}
                </span>
              </div>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-2 hover:bg-surface-2 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors leading-snug">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-gray-400 shrink-0 mt-1 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

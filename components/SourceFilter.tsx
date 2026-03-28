"use client";

import type { Source } from "@/types/database";

const SOURCES: { value: Source | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "reddit", label: "Reddit" },
  { value: "hackernews", label: "Hacker News" },
  { value: "arxiv", label: "arXiv" },
  { value: "podcast_allin", label: "All-In" },
  { value: "podcast_moonshots", label: "Moonshots" },
];

interface SourceFilterProps {
  active: Source | "all";
  onChange: (source: Source | "all") => void;
}

export default function SourceFilter({ active, onChange }: SourceFilterProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {SOURCES.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            active === s.value
              ? "bg-accent text-white"
              : "bg-surface-2 text-gray-400 hover:text-gray-200 border border-border hover:border-accent/30"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

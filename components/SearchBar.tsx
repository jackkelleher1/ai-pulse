"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import SignalCard from "@/components/SignalCard";
import type { ContentItem } from "@/types/database";

interface SearchBarProps {
  onActiveChange?: (active: boolean) => void;
}

export default function SearchBar({ onActiveChange }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = query.trim().length > 0;

  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/content?q=${encodeURIComponent(query)}&limit=30`);
        const data = await res.json();
        setResults(data.items ?? []);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search signals... models, safety, funding, people"
          className="w-full bg-surface border border-border focus:border-accent/50 rounded-xl py-3 pl-11 pr-20 text-sm text-white placeholder-gray-700 outline-none transition-colors font-mono"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && <Loader2 className="w-3.5 h-3.5 text-gray-600 animate-spin" />}
          {query && !loading && (
            <button onClick={() => setQuery("")} className="text-gray-600 hover:text-gray-300 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {!query && (
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-gray-700 bg-surface-2 border border-border rounded font-mono">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {isActive && (
        <div className="mt-4">
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-surface border border-border animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 text-gray-600 text-sm font-mono">
              No signals found for &quot;{query}&quot;
            </div>
          ) : (
            <>
              <p className="text-xs font-mono text-gray-600 mb-3 uppercase tracking-wider">
                {results.length} signals matched
              </p>
              <div className="space-y-1">
                {results.map((item) => (
                  <SignalCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

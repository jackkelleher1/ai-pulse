"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Building2, DollarSign, Calendar, ExternalLink, RefreshCw } from "lucide-react";
import type { Holding } from "@/lib/fetchers/sec13f";
import type { StockQuote } from "@/lib/fetchers/stockPrices";

interface InvestingData {
  holdings:   Holding[];
  filingDate: string;
  totalValue: number;
  quotes:     Record<string, StockQuote>;
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtBig(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function Delta({ pct, size = "sm" }: { pct: number; size?: "sm" | "lg" }) {
  const up  = pct >= 0;
  const cls = up ? "text-emerald-400" : "text-red-400";
  const sz  = size === "lg" ? "text-lg font-bold" : "text-xs font-mono";
  return (
    <span className={`inline-flex items-center gap-0.5 ${cls} ${sz}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? "+" : ""}{fmt(pct)}%
    </span>
  );
}

function BarChart({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

// Sector heuristic based on issuer name / ticker
function getSector(issuerName: string): string {
  const name = issuerName.toLowerCase();
  if (/energy|power|solar|wind|nuclear|bloom|fuel cell/i.test(name)) return "Energy";
  if (/semiconductor|chip|nvidia|amd|intel|broadcom|qualcomm/i.test(name)) return "Semiconductors";
  if (/data center|server|storage|supermicro|dell|hewlett/i.test(name)) return "Data Centers";
  if (/network|fiber|optical|lumentum|coherent|viavi/i.test(name)) return "Networking";
  if (/mining|crypto|bitcoin|core scientific|marathon|riot/i.test(name)) return "Crypto/Mining";
  if (/cloud|software|saas|ai|openai|palantir|snowflake/i.test(name)) return "Software/AI";
  if (/bank|financial|capital|invest|fund/i.test(name)) return "Financial";
  return "Other";
}

const SECTOR_COLORS: Record<string, string> = {
  "Energy":        "bg-yellow-400",
  "Semiconductors":"bg-purple-400",
  "Data Centers":  "bg-blue-400",
  "Networking":    "bg-cyan-400",
  "Crypto/Mining": "bg-orange-400",
  "Software/AI":   "bg-emerald-400",
  "Financial":     "bg-pink-400",
  "Other":         "bg-gray-400",
};

export default function InvestingPage() {
  const [data, setData]       = useState<InvestingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/investing");
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const maxValue = data ? Math.max(...data.holdings.map(h => h.value)) : 0;

  // Sector breakdown
  const sectorMap: Record<string, number> = {};
  data?.holdings.forEach(h => {
    const sector = getSector(h.issuerName);
    sectorMap[sector] = (sectorMap[sector] ?? 0) + h.value;
  });
  const sectors = Object.entries(sectorMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, pct: data ? (value / data.totalValue) * 100 : 0 }));

  // Top performers / losers by quarter return
  const withQuotes = data?.holdings
    .filter(h => data.quotes[h.ticker])
    .map(h => ({ ...h, quote: data.quotes[h.ticker] })) ?? [];

  const topPerformers = [...withQuotes].sort((a, b) => b.quote.quarterReturn - a.quote.quarterReturn).slice(0, 5);
  const topDecliners  = [...withQuotes].sort((a, b) => a.quote.quarterReturn - b.quote.quarterReturn).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Fund Intelligence</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Situational Awareness LP</h1>
              <p className="text-sm text-gray-500 mt-1">
                AI infrastructure–focused hedge fund · 13F holdings via SEC EDGAR
              </p>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              {data && (
                <>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white font-mono">{fmtBig(data.totalValue)}</div>
                    <div className="text-xs text-gray-600 font-mono uppercase tracking-wider">Portfolio Value</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white font-mono">{data.holdings.length}</div>
                    <div className="text-xs text-gray-600 font-mono uppercase tracking-wider">Positions</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-sm font-mono text-gray-400">{data.filingDate}</span>
                    </div>
                    <div className="text-xs text-gray-600 font-mono uppercase tracking-wider">Filing Date</div>
                  </div>
                </>
              )}
              <button
                onClick={load}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-mono text-gray-600 hover:text-gray-300 transition-colors disabled:opacity-30"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {loading && (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-surface/50 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-gray-600 font-mono text-sm">
            Failed to load holdings. SEC EDGAR may be rate-limiting.
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Performance summary strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {topPerformers.slice(0, 1).map(h => (
                <div key={h.ticker} className="p-4 rounded-xl bg-emerald-400/5 border border-emerald-400/20">
                  <div className="text-xs font-mono text-gray-500 mb-1">Top Performer (90d)</div>
                  <div className="text-lg font-bold text-white">{h.ticker}</div>
                  <Delta pct={h.quote.quarterReturn} size="lg" />
                </div>
              ))}
              {topDecliners.slice(0, 1).map(h => (
                <div key={h.ticker} className="p-4 rounded-xl bg-red-400/5 border border-red-400/20">
                  <div className="text-xs font-mono text-gray-500 mb-1">Biggest Drag (90d)</div>
                  <div className="text-lg font-bold text-white">{h.ticker}</div>
                  <Delta pct={h.quote.quarterReturn} size="lg" />
                </div>
              ))}
              <div className="p-4 rounded-xl bg-surface border border-border">
                <div className="text-xs font-mono text-gray-500 mb-1">Top Sector</div>
                <div className="text-lg font-bold text-white">{sectors[0]?.name ?? "—"}</div>
                <div className="text-sm font-mono text-gray-400">{fmt(sectors[0]?.pct ?? 0, 1)}% of portfolio</div>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border">
                <div className="text-xs font-mono text-gray-500 mb-1">Largest Position</div>
                <div className="text-lg font-bold text-white">{data.holdings[0]?.ticker ?? "—"}</div>
                <div className="text-sm font-mono text-gray-400">{fmt(data.holdings[0]?.pctPortfolio ?? 0, 1)}% of portfolio</div>
              </div>
            </div>

            {/* Main grid: holdings + sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

              {/* Holdings table */}
              <div className="xl:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">All Holdings</span>
                  </div>
                  <span className="text-xs font-mono text-gray-700">{data.holdings.length} positions</span>
                </div>

                <div className="space-y-0.5">
                  {data.holdings.map(h => {
                    const q = data.quotes[h.ticker];
                    return (
                      <div
                        key={h.cusip}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface border border-transparent hover:border-border transition-all"
                      >
                        {/* Rank */}
                        <span className="text-xs font-mono text-gray-700 w-5 shrink-0 text-right">{h.rank}</span>

                        {/* Ticker */}
                        <div className="w-16 shrink-0">
                          <div className="text-sm font-bold text-white font-mono">{h.ticker}</div>
                          <div className="text-xs text-gray-600 truncate">{h.issuerName.split(" ").slice(0, 2).join(" ")}</div>
                        </div>

                        {/* Bar */}
                        <div className="flex-1 min-w-0 hidden sm:block">
                          <BarChart value={h.value} max={maxValue} color="bg-accent/60" />
                          <div className="text-xs font-mono text-gray-700 mt-0.5">{fmt(h.pctPortfolio, 1)}%</div>
                        </div>

                        {/* Value */}
                        <div className="text-right shrink-0">
                          <div className="text-sm font-mono text-gray-300">{fmtBig(h.value)}</div>
                          <div className="text-xs font-mono text-gray-700">{h.shares.toLocaleString()} sh</div>
                        </div>

                        {/* Price + delta */}
                        {q ? (
                          <div className="text-right shrink-0 w-20">
                            <div className="text-sm font-mono text-gray-300">${fmt(q.price)}</div>
                            <Delta pct={q.quarterReturn} />
                          </div>
                        ) : (
                          <div className="w-20 shrink-0" />
                        )}

                        <a
                          href={`https://finance.yahoo.com/quote/${h.ticker}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gray-600 hover:text-gray-400" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar */}
              <div className="xl:col-span-1 space-y-6 sticky top-20 self-start">

                {/* Sector breakdown */}
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <div className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest mb-4">Sector Breakdown</div>
                  <div className="space-y-3">
                    {sectors.map(s => (
                      <div key={s.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${SECTOR_COLORS[s.name] ?? "bg-gray-400"}`} />
                            <span className="text-xs text-gray-300">{s.name}</span>
                          </div>
                          <span className="text-xs font-mono text-gray-500">{fmt(s.pct, 1)}%</span>
                        </div>
                        <BarChart value={s.pct} max={100} color={SECTOR_COLORS[s.name]?.replace("bg-", "bg-") ?? "bg-gray-400"} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 90-day movers */}
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <div className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest mb-4">90-Day Movers</div>

                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-2 font-mono">Top performers</div>
                    <div className="space-y-1.5">
                      {topPerformers.map(h => (
                        <div key={h.ticker} className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-white">{h.ticker}</span>
                          <Delta pct={h.quote.quarterReturn} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="text-xs text-gray-600 mb-2 font-mono">Underperformers</div>
                    <div className="space-y-1.5">
                      {topDecliners.map(h => (
                        <div key={h.ticker} className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-white">{h.ticker}</span>
                          <Delta pct={h.quote.quarterReturn} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SEC filing link */}
                <a
                  href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002045724&type=13F&dateb=&owner=include&count=10`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-accent/30 transition-colors group"
                >
                  <div>
                    <div className="text-xs font-mono text-gray-400 group-hover:text-white transition-colors">View SEC Filings</div>
                    <div className="text-xs text-gray-600">CIK 0002045724 · 13F-HR</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-accent transition-colors" />
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

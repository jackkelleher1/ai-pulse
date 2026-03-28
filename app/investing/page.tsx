"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Building2, DollarSign, Calendar,
  ExternalLink, RefreshCw, Star, BarChart2, ShieldCheck, AlertTriangle,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { Holding } from "@/lib/fetchers/sec13f";
import type { StockQuote, Fundamentals } from "@/lib/fetchers/stockPrices";
import type { ContentItem } from "@/types/database";

interface InvestingData {
  holdings:   Holding[];
  filingDate: string;
  totalValue: number;
  quotes:     Record<string, StockQuote>;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

interface DimensionScore {
  label:    string;
  score:    number; // 0–25
  max:      number;
  bullets:  string[];
  flags:    string[]; // red flags
}

interface AnalystRating {
  conviction:  DimensionScore;
  valuation:   DimensionScore;
  quality:     DimensionScore;
  momentum:    DimensionScore;
  total:       number; // 0–100
  verdict:     "BUY" | "WATCH" | "AVOID";
  verdictNote: string;
}

function scoreConviction(h: Holding, q: StockQuote): DimensionScore {
  let score = 0;
  const bullets: string[] = [];
  const flags: string[] = [];

  // Portfolio weight
  if (h.pctPortfolio > 15)      { score += 15; bullets.push(`${fmt(h.pctPortfolio, 1)}% of fund — highest conviction`); }
  else if (h.pctPortfolio > 8)  { score += 11; bullets.push(`${fmt(h.pctPortfolio, 1)}% of fund — high conviction`); }
  else if (h.pctPortfolio > 3)  { score += 7;  bullets.push(`${fmt(h.pctPortfolio, 1)}% of fund — meaningful position`); }
  else                           { score += 3;  }

  // Rank in portfolio
  if (h.rank <= 3)  { score += 10; bullets.push(`Rank #${h.rank} in portfolio`); }
  else if (h.rank <= 8) { score += 6; }

  // Market cap — larger = more liquid, safer
  if (q.marketCap > 10e9) { score = Math.min(score + 0, 25); }
  else if (q.marketCap < 500e6) { flags.push("Small-cap — higher volatility risk"); }

  return { label: "Conviction", score: Math.min(score, 25), max: 25, bullets, flags };
}

function scoreValuation(f: Fundamentals): DimensionScore {
  let score = 0;
  const bullets: string[] = [];
  const flags: string[] = [];

  // PEG ratio — growth-adjusted P/E
  if (f.pegRatio !== null) {
    if (f.pegRatio < 1)       { score += 10; bullets.push(`PEG ${fmt(f.pegRatio, 2)} — attractively priced vs growth`); }
    else if (f.pegRatio < 2)  { score += 6;  bullets.push(`PEG ${fmt(f.pegRatio, 2)} — fair value`); }
    else if (f.pegRatio < 4)  { score += 2;  }
    else                       { flags.push(`PEG ${fmt(f.pegRatio, 1)} — growth priced in aggressively`); }
  }

  // Forward P/E
  if (f.forwardPE !== null && f.forwardPE > 0) {
    if (f.forwardPE < 15)     { score += 9; bullets.push(`Forward P/E ${fmt(f.forwardPE, 1)}× — cheap`); }
    else if (f.forwardPE < 25){ score += 6; bullets.push(`Forward P/E ${fmt(f.forwardPE, 1)}×`); }
    else if (f.forwardPE < 40){ score += 3; }
    else                       { flags.push(`Forward P/E ${fmt(f.forwardPE, 1)}× — high expectations baked in`); }
  }

  // EV/EBITDA
  if (f.evToEbitda !== null && f.evToEbitda > 0) {
    if (f.evToEbitda < 10)    { score += 6; bullets.push(`EV/EBITDA ${fmt(f.evToEbitda, 1)}× — reasonable`); }
    else if (f.evToEbitda < 20){ score += 3; }
    else                       { flags.push(`EV/EBITDA ${fmt(f.evToEbitda, 1)}× — elevated`); }
  }

  return { label: "Valuation", score: Math.min(score, 25), max: 25, bullets, flags };
}

function scoreQuality(f: Fundamentals): DimensionScore {
  let score = 0;
  const bullets: string[] = [];
  const flags: string[] = [];

  // ROE > 15% = Buffett threshold
  if (f.returnOnEquity !== null) {
    const roe = f.returnOnEquity * 100;
    if (roe > 20)      { score += 8; bullets.push(`ROE ${fmt(roe, 0)}% — excellent capital efficiency`); }
    else if (roe > 15) { score += 6; bullets.push(`ROE ${fmt(roe, 0)}% — meets Buffett threshold`); }
    else if (roe > 8)  { score += 3; }
    else if (roe < 0)  { flags.push(`ROE ${fmt(roe, 0)}% — negative, losing shareholder value`); }
  }

  // Gross margins — pricing power proxy
  if (f.grossMargins !== null) {
    const gm = f.grossMargins * 100;
    if (gm > 50)       { score += 8; bullets.push(`Gross margin ${fmt(gm, 0)}% — strong pricing power`); }
    else if (gm > 30)  { score += 5; bullets.push(`Gross margin ${fmt(gm, 0)}%`); }
    else if (gm > 15)  { score += 2; }
    else               { flags.push(`Gross margin ${fmt(gm, 0)}% — thin margins, limited pricing power`); }
  }

  // Revenue growth
  if (f.revenueGrowth !== null) {
    const rg = f.revenueGrowth * 100;
    if (rg > 20)       { score += 5; bullets.push(`Revenue growing ${fmt(rg, 0)}% YoY`); }
    else if (rg > 5)   { score += 3; }
    else if (rg < 0)   { flags.push(`Revenue declining ${fmt(Math.abs(rg), 0)}% YoY`); }
  }

  // Debt-to-equity (manageable = < 1.5, concerning = > 3)
  if (f.debtToEquity !== null) {
    if (f.debtToEquity < 50)      { score += 4; bullets.push("Low leverage — strong balance sheet"); }
    else if (f.debtToEquity > 300){ flags.push(`High D/E ${fmt(f.debtToEquity / 100, 1)}× — leveraged balance sheet`); }
  }

  // Free cash flow positive
  if (f.freeCashflow !== null) {
    if (f.freeCashflow > 0) { score = Math.min(score, 25); }
    else                    { flags.push("Negative free cash flow — burning cash"); }
  }

  return { label: "Quality", score: Math.min(score, 25), max: 25, bullets, flags };
}

function scoreMomentum(h: Holding, q: StockQuote): DimensionScore {
  let score = 0;
  const bullets: string[] = [];
  const flags: string[] = [];

  // 90-day return
  if (q.quarterReturn > 30)       { score += 10; bullets.push(`+${fmt(q.quarterReturn, 0)}% in 90 days — strong momentum`); }
  else if (q.quarterReturn > 10)  { score += 7;  bullets.push(`+${fmt(q.quarterReturn, 0)}% in 90 days`); }
  else if (q.quarterReturn > 0)   { score += 4; }
  else if (q.quarterReturn < -30) { score -= 5;  flags.push(`Down ${fmt(Math.abs(q.quarterReturn), 0)}% in 90 days — falling knife risk`); }
  else if (q.quarterReturn < -15) { flags.push(`Down ${fmt(Math.abs(q.quarterReturn), 0)}% in 90 days — negative trend`); }

  // Discount from 52w high (margin of safety)
  const belowHigh = q.high52w > 0 ? ((q.high52w - q.price) / q.high52w) * 100 : 0;
  if (belowHigh > 35)     { score += 10; bullets.push(`${fmt(belowHigh, 0)}% below 52w high — deep discount`); }
  else if (belowHigh > 20){ score += 7;  bullets.push(`${fmt(belowHigh, 0)}% off 52w high — pullback opportunity`); }
  else if (belowHigh > 8) { score += 4;  bullets.push(`${fmt(belowHigh, 0)}% off 52w high`); }
  else                    { bullets.push("Trading near 52w high — momentum continuation"); }

  // Recovery from 52w low (not still in freefall)
  const aboveLow = q.low52w > 0 ? ((q.price - q.low52w) / q.low52w) * 100 : 0;
  if (aboveLow > 25)       { score += 5; bullets.push(`${fmt(aboveLow, 0)}% above 52w low — recovering`); }
  else if (aboveLow < 5)   { flags.push("Near 52w low — no recovery signal yet"); }

  return { label: "Momentum", score: Math.max(Math.min(score, 25), 0), max: 25, bullets, flags };
}

function buildRating(h: Holding, q: StockQuote): AnalystRating {
  const f = q.fundamentals;
  const conviction = scoreConviction(h, q);
  const valuation  = scoreValuation(f);
  const quality    = scoreQuality(f);
  const momentum   = scoreMomentum(h, q);
  const total      = conviction.score + valuation.score + quality.score + momentum.score;

  const allFlags = [...conviction.flags, ...valuation.flags, ...quality.flags, ...momentum.flags];

  let verdict: "BUY" | "WATCH" | "AVOID";
  let verdictNote: string;
  if (total >= 65 && allFlags.length <= 1) {
    verdict = "BUY";
    verdictNote = "Strong across conviction, quality, and value";
  } else if (total >= 45 || (total >= 40 && allFlags.length === 0)) {
    verdict = "WATCH";
    verdictNote = "Solid thesis but wait for a better entry or more clarity";
  } else {
    verdict = "AVOID";
    verdictNote = allFlags[0] ?? "Risk/reward not compelling at current levels";
  }

  return { conviction, valuation, quality, momentum, total, verdict, verdictNote };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  return (
    <span className={`inline-flex items-center gap-0.5 font-mono ${size === "lg" ? "text-lg font-bold" : "text-xs"} ${up ? "text-emerald-400" : "text-red-400"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? "+" : ""}{fmt(pct)}%
    </span>
  );
}

function ScoreBar({ score, max, color = "bg-accent" }: { score: number; max: number; color?: string }) {
  return (
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${(score / max) * 100}%` }} />
    </div>
  );
}

const VERDICT_CONFIG = {
  BUY:   { bg: "bg-emerald-400/10", border: "border-emerald-400/30", text: "text-emerald-400",  dot: "bg-emerald-400" },
  WATCH: { bg: "bg-yellow-400/10",  border: "border-yellow-400/30",  text: "text-yellow-400",   dot: "bg-yellow-400" },
  AVOID: { bg: "bg-red-400/10",     border: "border-red-400/30",     text: "text-red-400",      dot: "bg-red-400" },
};

const SCORE_COLORS: Record<string, string> = {
  "Conviction": "bg-accent",
  "Valuation":  "bg-cyan-400",
  "Quality":    "bg-emerald-400",
  "Momentum":   "bg-yellow-400",
};

// ─── Report Card Component ─────────────────────────────────────────────────────

function BestBuyCard({ h, q, rating, rank }: { h: Holding; q: StockQuote; rating: AnalystRating; rank: number }) {
  const [open, setOpen] = useState(false);
  const vc = VERDICT_CONFIG[rating.verdict];
  const dims = [rating.conviction, rating.valuation, rating.quality, rating.momentum];
  const allFlags = dims.flatMap(d => d.flags);
  const allBullets = dims.flatMap(d => d.bullets);

  return (
    <div className={`rounded-xl border ${vc.border} ${vc.bg} overflow-hidden transition-all`}>
      {/* Top bar */}
      <div className={`h-0.5 ${vc.dot}`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 px-2 py-0.5 rounded text-xs font-bold font-mono border ${vc.border} ${vc.text} ${vc.bg} shrink-0`}>
              {rating.verdict}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white font-mono">{h.ticker}</span>
                <span className="text-xs text-gray-600">#{rank}</span>
              </div>
              <div className="text-xs text-gray-500 max-w-[200px] truncate">{h.issuerName}</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-mono text-white">${fmt(q.price)}</div>
            <Delta pct={q.changePct} />
          </div>
        </div>

        {/* Verdict note */}
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">{rating.verdictNote}</p>

        {/* Dimension scores */}
        <div className="space-y-2.5 mb-4">
          {dims.map(d => (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-gray-500">{d.label}</span>
                <span className="text-xs font-mono text-gray-400">{d.score}/{d.max}</span>
              </div>
              <ScoreBar score={d.score} max={d.max} color={SCORE_COLORS[d.label]} />
            </div>
          ))}
        </div>

        {/* Total score */}
        <div className="flex items-center justify-between py-2 border-t border-white/5 mb-3">
          <span className="text-xs font-mono text-gray-600">Total score</span>
          <span className={`text-sm font-bold font-mono ${vc.text}`}>{rating.total}/100</span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center bg-black/20 rounded-lg p-2">
            <div className="text-xs font-mono text-white">{fmt(h.pctPortfolio, 1)}%</div>
            <div className="text-xs text-gray-600 mt-0.5">Portfolio wt</div>
          </div>
          <div className="text-center bg-black/20 rounded-lg p-2">
            {q.fundamentals.forwardPE !== null && q.fundamentals.forwardPE > 0
              ? <><div className="text-xs font-mono text-white">{fmt(q.fundamentals.forwardPE, 1)}×</div><div className="text-xs text-gray-600 mt-0.5">Fwd P/E</div></>
              : <><div className="text-xs font-mono text-gray-600">—</div><div className="text-xs text-gray-600 mt-0.5">Fwd P/E</div></>
            }
          </div>
          <div className="text-center bg-black/20 rounded-lg p-2">
            {q.fundamentals.returnOnEquity !== null
              ? <><div className="text-xs font-mono text-white">{fmt(q.fundamentals.returnOnEquity * 100, 0)}%</div><div className="text-xs text-gray-600 mt-0.5">ROE</div></>
              : <><div className="text-xs font-mono text-gray-600">—</div><div className="text-xs text-gray-600 mt-0.5">ROE</div></>
            }
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full text-xs font-mono text-gray-600 hover:text-gray-300 transition-colors text-left"
        >
          {open ? "▲ less detail" : "▼ full analysis"}
        </button>

        {/* Expanded detail */}
        {open && (
          <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
            {/* Positives */}
            {allBullets.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-mono text-emerald-400">Positives</span>
                </div>
                <ul className="space-y-1">
                  {allBullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                      <span className="text-emerald-400 shrink-0 mt-0.5">·</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Red flags */}
            {allFlags.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="text-xs font-mono text-red-400">Red Flags</span>
                </div>
                <ul className="space-y-1">
                  {allFlags.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                      <span className="text-red-400 shrink-0 mt-0.5">·</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Fundamentals detail */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-white/5 pt-3">
              {[
                ["PEG ratio", q.fundamentals.pegRatio !== null ? fmt(q.fundamentals.pegRatio, 2) : null],
                ["Gross margin", q.fundamentals.grossMargins !== null ? `${fmt(q.fundamentals.grossMargins * 100, 0)}%` : null],
                ["Rev growth", q.fundamentals.revenueGrowth !== null ? `${fmt(q.fundamentals.revenueGrowth * 100, 0)}%` : null],
                ["D/E ratio", q.fundamentals.debtToEquity !== null ? fmt(q.fundamentals.debtToEquity / 100, 2) : null],
                ["EV/EBITDA", q.fundamentals.evToEbitda !== null ? `${fmt(q.fundamentals.evToEbitda, 1)}×` : null],
                ["Free CF", q.fundamentals.freeCashflow !== null ? fmtBig(q.fundamentals.freeCashflow) : null],
              ].map(([label, val]) => (
                <div key={label as string} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{label}</span>
                  <span className="text-xs font-mono text-gray-300">{val ?? "—"}</span>
                </div>
              ))}
            </div>
            <a
              href={`https://finance.yahoo.com/quote/${h.ticker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-mono text-gray-600 hover:text-gray-300 transition-colors mt-1"
            >
              <ExternalLink className="w-3 h-3" /> Yahoo Finance
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Line Chart ────────────────────────────────────────────────────────────────

const LINE_COLORS = [
  "#6366f1", "#34d399", "#f59e0b", "#f87171", "#22d3ee",
  "#c084fc", "#fb923c", "#4ade80", "#60a5fa", "#e879f9",
];
const RANGES = [{ label: "1M", days: 21 }, { label: "3M", days: 63 }, { label: "6M", days: 126 }];

function PerfChart({ holdings, quotes }: { holdings: Holding[]; quotes: Record<string, StockQuote> }) {
  const eligible     = holdings.filter(h => quotes[h.ticker]?.history?.length);
  const defaultTicks = eligible.slice(0, 5).map(h => h.ticker);
  const [selected, setSelected] = useState<string[]>(defaultTicks);
  const [range, setRange]       = useState(1);

  useEffect(() => {
    if (selected.length === 0 && defaultTicks.length > 0) setSelected(defaultTicks);
  }, [eligible.length]); // eslint-disable-line

  const days = RANGES[range].days;
  const chartData = useMemo(() => {
    if (!selected.length) return [];
    const sliced = selected.map(t => (quotes[t]?.history ?? []).slice(-days));
    const minLen = Math.min(...sliced.map(h => h.length));
    if (!minLen) return [];
    return Array.from({ length: minLen }, (_, i) => {
      const row: Record<string, string | number> = { date: sliced[0][i].date };
      selected.forEach((t, ti) => {
        const base  = sliced[ti][0]?.close ?? 1;
        const close = sliced[ti][i]?.close ?? base;
        row[t] = parseFloat(((close - base) / base * 100).toFixed(2));
      });
      return row;
    });
  }, [selected, range]); // eslint-disable-line

  function toggle(ticker: string) {
    setSelected(prev =>
      prev.includes(ticker)
        ? prev.length > 1 ? prev.filter(t => t !== ticker) : prev
        : [...prev, ticker]
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {eligible.slice(0, 10).map((h, i) => {
            const active = selected.includes(h.ticker);
            return (
              <button
                key={h.ticker}
                onClick={() => toggle(h.ticker)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
                  active ? "border-transparent text-black" : "border-border text-gray-600 hover:text-gray-300"
                }`}
                style={active ? { backgroundColor: LINE_COLORS[i % LINE_COLORS.length] } : {}}
              >
                {h.ticker}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRange(i)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${range === i ? "bg-accent/20 text-accent" : "text-gray-600 hover:text-gray-300"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "monospace" }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" axisLine={{ stroke: "#374151" }} tickLine={false} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "monospace" }} tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`} axisLine={false} tickLine={false} width={52} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-[#111] border border-[#374151] rounded-lg p-3 text-xs font-mono shadow-xl">
                  <div className="text-gray-500 mb-2">{label}</div>
                  {(payload as unknown as { color: string; name: string; value: number }[]).map(p => (
                    <div key={p.name} className="flex items-center gap-2">
                      <span style={{ color: p.color }}>{p.name}</span>
                      <span className={p.value >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {p.value >= 0 ? "+" : ""}{p.value.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
          {selected.map((ticker, i) => (
            <Line key={ticker} type="monotone" dataKey={ticker}
              stroke={LINE_COLORS[eligible.findIndex(h => h.ticker === ticker) % LINE_COLORS.length]}
              strokeWidth={2} dot={false} activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Sector helpers ────────────────────────────────────────────────────────────

function getSector(name: string): string {
  if (/energy|power|solar|wind|nuclear|bloom|fuel cell/i.test(name)) return "Energy";
  if (/semiconductor|chip|nvidia|amd|intel|broadcom|qualcomm/i.test(name)) return "Semiconductors";
  if (/data center|server|storage|supermicro|dell|hewlett/i.test(name)) return "Data Centers";
  if (/network|fiber|optical|lumentum|coherent|viavi/i.test(name)) return "Networking";
  if (/mining|crypto|bitcoin|core scientific|marathon|riot|bitfarm|bitdeer|applied digital/i.test(name)) return "Crypto/Mining";
  if (/cloud|software|saas|ai|openai|palantir|snowflake/i.test(name)) return "Software/AI";
  if (/bank|financial|capital|invest|fund/i.test(name)) return "Financial";
  return "Other";
}

const SECTOR_COLORS: Record<string, string> = {
  "Energy": "bg-yellow-400", "Semiconductors": "bg-purple-400", "Data Centers": "bg-blue-400",
  "Networking": "bg-cyan-400", "Crypto/Mining": "bg-orange-400", "Software/AI": "bg-emerald-400",
  "Financial": "bg-pink-400", "Other": "bg-gray-400",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function InvestingPage() {
  const [data, setData]             = useState<InvestingData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [marketNews, setMarketNews] = useState<ContentItem[]>([]);

  async function load() {
    setLoading(true); setError(false);
    try {
      const [inv, news] = await Promise.all([
        fetch("/api/investing"),
        fetch("/api/content?source=wsj,marketwatch&limit=8&sort=published_at"),
      ]);
      if (!inv.ok) throw new Error();
      setData(await inv.json());
      const nd = await news.json();
      setMarketNews(nd.items ?? []);
    } catch { setError(true); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const maxValue = data ? Math.max(...data.holdings.map(h => h.value)) : 0;

  const sectorMap: Record<string, number> = {};
  data?.holdings.forEach(h => {
    const s = getSector(h.issuerName);
    sectorMap[s] = (sectorMap[s] ?? 0) + h.value;
  });
  const sectors = Object.entries(sectorMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, pct: data ? (value / data.totalValue) * 100 : 0 }));

  // Build analyst ratings for holdings that have quotes
  const ratings = useMemo(() => {
    if (!data) return [];
    return data.holdings
      .filter(h => data.quotes[h.ticker])
      .map(h => ({ h, q: data.quotes[h.ticker], rating: buildRating(h, data.quotes[h.ticker]) }))
      .sort((a, b) => b.rating.total - a.rating.total);
  }, [data]);

  const buys    = ratings.filter(r => r.rating.verdict === "BUY");
  const watches = ratings.filter(r => r.rating.verdict === "WATCH");
  const avoids  = ratings.filter(r => r.rating.verdict === "AVOID");

  const bestBuys    = buys.slice(0, 5);
  const bestWatches = watches.slice(0, 5);
  // Backfill from top-scored AVOIDs if buys+watches total fewer than 3
  const shown       = bestBuys.length + bestWatches.length;
  const bestAvoids  = shown < 3 ? avoids.slice(0, 3 - shown) : [];

  const withQuotes = data?.holdings.filter(h => data.quotes[h.ticker]).map(h => ({ ...h, quote: data!.quotes[h.ticker] })) ?? [];
  const topPerf    = [...withQuotes].sort((a, b) => b.quote.quarterReturn - a.quote.quarterReturn).slice(0, 5);
  const topDrag    = [...withQuotes].sort((a, b) => a.quote.quarterReturn - b.quote.quarterReturn).slice(0, 5);

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
              <p className="text-sm text-gray-500 mt-1">AI infrastructure–focused hedge fund · 13F holdings via SEC EDGAR</p>
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
              <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs font-mono text-gray-600 hover:text-gray-300 transition-colors disabled:opacity-30">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {loading && (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-surface/50 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />)}
          </div>
        )}

        {error && <div className="text-center py-20 text-gray-600 font-mono text-sm">Failed to load holdings. SEC EDGAR may be rate-limiting.</div>}

        {!loading && !error && data && (
          <>
            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {topPerf.slice(0, 1).map(h => (
                <div key={h.ticker} className="p-4 rounded-xl bg-emerald-400/5 border border-emerald-400/20">
                  <div className="text-xs font-mono text-gray-500 mb-1">Top Performer (90d)</div>
                  <div className="text-lg font-bold text-white">{h.ticker}</div>
                  <Delta pct={h.quote.quarterReturn} size="lg" />
                </div>
              ))}
              {topDrag.slice(0, 1).map(h => (
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

            {/* Best Buys */}
            {ratings.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">Analyst Report Cards</span>
                </div>
                <p className="text-xs text-gray-700 mb-5 font-mono">
                  Scored across Conviction, Valuation (PEG, Fwd P/E, EV/EBITDA), Quality (ROE, margins, FCF) and Momentum.
                </p>

                <div className="flex gap-3">
                  {[...bestBuys, ...bestWatches, ...bestAvoids].map(({ h, q, rating }, i) => (
                    <div key={h.ticker} className="flex-1 min-w-0">
                      <BestBuyCard h={h} q={q} rating={rating} rank={i + 1} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Chart + holdings */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">

                <div className="p-5 rounded-xl bg-surface border border-border">
                  <div className="flex items-center gap-2 mb-5">
                    <BarChart2 className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">Price Performance</span>
                  </div>
                  <PerfChart holdings={data.holdings} quotes={data.quotes} />
                </div>

                <div>
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
                        <div key={h.cusip} className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface border border-transparent hover:border-border transition-all">
                          <span className="text-xs font-mono text-gray-700 w-5 shrink-0 text-right">{h.rank}</span>
                          <div className="w-16 shrink-0">
                            <div className="text-sm font-bold text-white font-mono">{h.ticker}</div>
                            <div className="text-xs text-gray-600 truncate">{h.issuerName.split(" ").slice(0, 2).join(" ")}</div>
                          </div>
                          <div className="flex-1 min-w-0 hidden sm:block">
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-accent/60" style={{ width: `${maxValue > 0 ? (h.value / maxValue) * 100 : 0}%` }} />
                            </div>
                            <div className="text-xs font-mono text-gray-700 mt-0.5">{fmt(h.pctPortfolio, 1)}%</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-mono text-gray-300">{fmtBig(h.value)}</div>
                            <div className="text-xs font-mono text-gray-700">{h.shares.toLocaleString()} sh</div>
                          </div>
                          {q ? (
                            <div className="text-right shrink-0 w-20">
                              <div className="text-sm font-mono text-gray-300">${fmt(q.price)}</div>
                              <Delta pct={q.quarterReturn} />
                            </div>
                          ) : <div className="w-20 shrink-0" />}
                          <a href={`https://finance.yahoo.com/quote/${h.ticker}`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-600 hover:text-gray-400" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="xl:col-span-1 space-y-6 sticky top-20 self-start">

                {/* Market Signals */}
                {marketNews.length > 0 && (
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] backdrop-blur-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-white/[0.05]">
                      <div className="w-1 h-3.5 bg-green-400 rounded-sm shrink-0" />
                      <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-[0.2em]">Market Signals</span>
                      <span className="text-[9px] font-mono text-gray-800 ml-auto">WSJ · MKTWATCH</span>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {marketNews.map(item => {
                        const isWSJ = item.source === "wsj";
                        const timeAgo = item.published_at
                          ? (() => {
                              const d = Date.now() - new Date(item.published_at).getTime();
                              const h = Math.floor(d / 3600000);
                              const m = Math.floor((d % 3600000) / 60000);
                              return h > 0 ? `${h}h ago` : `${m}m ago`;
                            })()
                          : "";
                        return (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2.5 px-4 py-3 hover:bg-white/[0.03] transition-colors group"
                          >
                            <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${isWSJ ? "bg-blue-300" : "bg-green-300"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-300 group-hover:text-white leading-snug line-clamp-2 transition-colors">
                                {item.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] font-mono text-gray-700 uppercase">{isWSJ ? "WSJ" : "MKTWATCH"}</span>
                                <span className="text-[9px] font-mono text-gray-800">·</span>
                                <span className="text-[9px] font-mono text-gray-800">{timeAgo}</span>
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${SECTOR_COLORS[s.name] ?? "bg-gray-400"}`} style={{ width: `${s.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border">
                  <div className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest mb-4">90-Day Movers</div>
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-2 font-mono">Top performers</div>
                    <div className="space-y-1.5">
                      {topPerf.map(h => (
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
                      {topDrag.map(h => (
                        <div key={h.ticker} className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-white">{h.ticker}</span>
                          <Delta pct={h.quote.quarterReturn} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002045724&type=13F&dateb=&owner=include&count=10"
                  target="_blank" rel="noopener noreferrer"
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

export interface PricePoint {
  date: string;
  close: number;
  normPct: number;
}

export interface Fundamentals {
  // Valuation
  trailingPE:    number | null;
  forwardPE:     number | null;
  pegRatio:      number | null;
  priceToBook:   number | null;
  evToEbitda:    number | null;
  // Quality
  returnOnEquity:  number | null; // as decimal e.g. 0.18 = 18%
  grossMargins:    number | null;
  profitMargins:   number | null;
  revenueGrowth:   number | null;
  // Health
  debtToEquity:    number | null;
  currentRatio:    number | null;
  freeCashflow:    number | null;
}

export interface StockQuote {
  ticker: string;
  price: number;
  change: number;
  changePct: number;
  high52w: number;
  low52w: number;
  marketCap: number;
  quarterReturn: number;
  history: PricePoint[];
  fundamentals: Fundamentals;
}

async function fetchFundamentals(ticker: string): Promise<Fundamentals> {
  const empty: Fundamentals = {
    trailingPE: null, forwardPE: null, pegRatio: null, priceToBook: null, evToEbitda: null,
    returnOnEquity: null, grossMargins: null, profitMargins: null, revenueGrowth: null,
    debtToEquity: null, currentRatio: null, freeCashflow: null,
  };
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=defaultKeyStatistics,financialData,summaryDetail`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return empty;
    const data = await res.json();
    const r    = data?.quoteSummary?.result?.[0];
    if (!r) return empty;

    const ks = r.defaultKeyStatistics ?? {};
    const fd = r.financialData        ?? {};
    const sd = r.summaryDetail        ?? {};

    const v = (obj: Record<string, { raw?: number }>, key: string): number | null =>
      obj[key]?.raw ?? null;

    return {
      trailingPE:    v(sd, "trailingPE"),
      forwardPE:     v(sd, "forwardPE"),
      pegRatio:      v(ks, "pegRatio"),
      priceToBook:   v(ks, "priceToBook"),
      evToEbitda:    v(ks, "enterpriseToEbitda"),
      returnOnEquity: v(fd, "returnOnEquity"),
      grossMargins:   v(fd, "grossMargins"),
      profitMargins:  v(fd, "profitMargins"),
      revenueGrowth:  v(fd, "revenueGrowth"),
      debtToEquity:   v(fd, "debtToEquity"),
      currentRatio:   v(fd, "currentRatio"),
      freeCashflow:   v(fd, "freeCashflow"),
    };
  } catch {
    return empty;
  }
}

async function fetchQuote(ticker: string): Promise<StockQuote | null> {
  try {
    const [chartRes, fundamentals] = await Promise.all([
      fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=6mo`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 3600 },
      }),
      fetchFundamentals(ticker),
    ]);

    if (!chartRes.ok) return null;
    const data   = await chartRes.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta       = result.meta;
    const timestamps = result.timestamp ?? [];
    const closes     = result.indicators?.quote?.[0]?.close ?? [];

    const history: PricePoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] == null) continue;
      history.push({
        date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
        close: closes[i],
        normPct: 0,
      });
    }

    const base = history[0]?.close ?? 1;
    history.forEach(p => { p.normPct = ((p.close - base) / base) * 100; });

    const price     = meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change    = price - prevClose;
    const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

    const qLen       = Math.min(63, history.length);
    const startClose = history[history.length - qLen]?.close ?? base;
    const endClose   = history[history.length - 1]?.close   ?? base;
    const quarterReturn = startClose > 0 ? ((endClose - startClose) / startClose) * 100 : 0;

    return {
      ticker,
      price,
      change,
      changePct,
      high52w:    meta.fiftyTwoWeekHigh ?? 0,
      low52w:     meta.fiftyTwoWeekLow  ?? 0,
      marketCap:  meta.marketCap        ?? 0,
      quarterReturn,
      history,
      fundamentals,
    };
  } catch {
    return null;
  }
}

export async function fetchStockQuotes(tickers: string[]): Promise<Record<string, StockQuote>> {
  const results = await Promise.all(tickers.map(t => fetchQuote(t)));
  const map: Record<string, StockQuote> = {};
  results.forEach((q, i) => { if (q) map[tickers[i]] = q; });
  return map;
}

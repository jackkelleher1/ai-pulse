export interface StockQuote {
  ticker: string;
  price: number;
  change: number;        // absolute change
  changePct: number;     // percent change (current day)
  high52w: number;
  low52w: number;
  marketCap: number;
  quarterReturn: number; // % return over last ~90 days
}

async function fetchQuote(ticker: string): Promise<StockQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=6mo`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta   = result.meta;
    const closes = result.indicators?.quote?.[0]?.close ?? [];
    const valid  = closes.filter((c: number | null) => c != null);

    const price      = meta.regularMarketPrice ?? 0;
    const prevClose  = meta.chartPreviousClose  ?? meta.previousClose ?? price;
    const change     = price - prevClose;
    const changePct  = prevClose > 0 ? (change / prevClose) * 100 : 0;
    const high52w    = meta.fiftyTwoWeekHigh ?? 0;
    const low52w     = meta.fiftyTwoWeekLow  ?? 0;
    const marketCap  = meta.marketCap        ?? 0;

    // Quarter return: last ~63 trading days (~90 calendar days)
    const qLen       = Math.min(63, valid.length);
    const startPrice = valid[valid.length - qLen];
    const endPrice   = valid[valid.length - 1];
    const quarterReturn = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;

    return { ticker, price, change, changePct, high52w, low52w, marketCap, quarterReturn };
  } catch {
    return null;
  }
}

export async function fetchStockQuotes(tickers: string[]): Promise<Record<string, StockQuote>> {
  const results = await Promise.all(tickers.map(t => fetchQuote(t)));
  const map: Record<string, StockQuote> = {};
  results.forEach((q, i) => {
    if (q) map[tickers[i]] = q;
  });
  return map;
}

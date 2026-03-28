import { NextResponse } from "next/server";
import { fetchSituationalAwarenessHoldings } from "@/lib/fetchers/sec13f";
import { fetchStockQuotes } from "@/lib/fetchers/stockPrices";

export const revalidate = 3600;

export async function GET() {
  try {
    const holdings = await fetchSituationalAwarenessHoldings();
    if (!holdings) {
      return NextResponse.json({ error: "Failed to fetch holdings" }, { status: 500 });
    }

    const tickers = holdings.holdings
      .slice(0, 30)
      .map(h => h.ticker)
      .filter(t => /^[A-Z]{1,5}$/.test(t)); // only valid-looking tickers

    const quotes = await fetchStockQuotes(tickers);

    return NextResponse.json({
      holdings:    holdings.holdings,
      filingDate:  holdings.filingDate,
      totalValue:  holdings.totalValue,
      quotes,
    });
  } catch (err) {
    console.error("Investing API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

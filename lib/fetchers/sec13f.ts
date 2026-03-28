export interface Holding {
  rank: number;
  cusip: string;
  issuerName: string;
  ticker: string;
  titleOfClass: string;
  value: number;       // USD (already multiplied from $1000s)
  shares: number;
  pctPortfolio: number;
}

interface SecSubmission {
  filings: {
    recent: {
      accessionNumber: string[];
      form: string[];
      filingDate: string[];
    };
  };
}

// CIK for Situational Awareness LP
const SA_CIK = "0002045724";

async function getLatest13FAccession(): Promise<{ accession: string; date: string } | null> {
  const res = await fetch(`https://data.sec.gov/submissions/CIK${SA_CIK}.json`, {
    headers: { "User-Agent": "AI-Pulse/1.0 contact@aipulse.dev" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data: SecSubmission = await res.json();
  const { accessionNumber, form, filingDate } = data.filings.recent;
  const idx = form.findIndex((f) => f === "13F-HR");
  if (idx === -1) return null;
  return { accession: accessionNumber[idx], date: filingDate[idx] };
}

async function getHoldingsXml(accession: string): Promise<string | null> {
  // accession format: "0002045724-26-000002" → "000204572426000002"
  const accFormatted = accession.replace(/-/g, "");
  const cikShort = SA_CIK.replace(/^0+/, "");
  const baseUrl = `https://www.sec.gov/Archives/edgar/data/${cikShort}/${accFormatted}`;

  // Scrape the HTML directory listing to find the holdings XML filename
  const dirRes = await fetch(`${baseUrl}/`, {
    headers: { "User-Agent": "AI-Pulse/1.0 contact@aipulse.dev" },
  });
  if (!dirRes.ok) return null;
  const html = await dirRes.text();

  // Find an XML file that isn't the primary_doc (which is the cover page)
  const xmlMatch = html.match(/href="([^"]+\.xml)"/g)
    ?.map(m => m.replace(/href="|"/g, ""))
    .find(f => !f.includes("primary_doc"));

  if (!xmlMatch) return null;
  const xmlFilename = xmlMatch.split("/").pop()!;

  const xmlRes = await fetch(`${baseUrl}/${xmlFilename}`, {
    headers: { "User-Agent": "AI-Pulse/1.0 contact@aipulse.dev" },
    next: { revalidate: 3600 },
  });
  if (!xmlRes.ok) return null;
  return xmlRes.text();
}

function parseHoldingsXml(xml: string): Omit<Holding, "ticker" | "pctPortfolio" | "rank">[] {
  const holdings: Omit<Holding, "ticker" | "pctPortfolio" | "rank">[] = [];
  // Handle both namespaced (ns1:infoTable) and plain (<infoTable>) tags
  const itemRegex = /<(?:\w+:)?infoTable>([\s\S]*?)<\/(?:\w+:)?infoTable>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    // Match tags with optional namespace prefix
    const get = (tag: string) => block.match(new RegExp(`<(?:\\w+:)?${tag}[^>]*>([^<]*)<`))?.[1]?.trim() ?? "";

    // Values are reported in dollars (not thousands) for this fund
    const value  = parseInt(get("value"),    10);
    const shares = parseInt(get("sshPrnamt"), 10);

    if (!isNaN(value) && !isNaN(shares)) {
      holdings.push({
        cusip:        get("cusip"),
        issuerName:   get("nameOfIssuer"),
        titleOfClass: get("titleOfClass"),
        value,
        shares,
      });
    }
  }

  return holdings;
}

// Map CUSIP → ticker via OpenFIGI (free, no auth required for small batches)
async function cusipsToTickers(cusips: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  const chunks = [];
  for (let i = 0; i < cusips.length; i += 10) chunks.push(cusips.slice(i, i + 10));

  for (const chunk of chunks) {
    try {
      const res = await fetch("https://api.openfigi.com/v3/mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chunk.map((c) => ({ idType: "ID_CUSIP", idValue: c }))),
      });
      if (!res.ok) continue;
      const data = await res.json();
      chunk.forEach((cusip, i) => {
        const match = data[i]?.data?.[0];
        if (match?.ticker) map[cusip] = match.ticker;
      });
    } catch {
      // continue without mapping
    }
  }
  return map;
}

export async function fetchSituationalAwarenessHoldings(): Promise<{
  holdings: Holding[];
  filingDate: string;
  totalValue: number;
} | null> {
  try {
    const latest = await getLatest13FAccession();
    if (!latest) return null;

    const xml = await getHoldingsXml(latest.accession);
    if (!xml) return null;

    const raw = parseHoldingsXml(xml);
    const totalValue = raw.reduce((s, h) => s + h.value, 0);

    // Get ticker symbols
    const cusips = raw.map((h) => h.cusip).filter(Boolean);
    const tickerMap = await cusipsToTickers(cusips);

    const holdings: Holding[] = raw
      .sort((a, b) => b.value - a.value)
      .map((h, i) => ({
        ...h,
        rank:         i + 1,
        ticker:       tickerMap[h.cusip] ?? h.issuerName.split(" ")[0].toUpperCase(),
        pctPortfolio: totalValue > 0 ? (h.value / totalValue) * 100 : 0,
      }));

    return { holdings, filingDate: latest.date, totalValue };
  } catch (err) {
    console.error("Failed to fetch 13F:", err);
    return null;
  }
}

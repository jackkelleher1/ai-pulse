import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ imageUrl: null });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AI-Pulse/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return NextResponse.json({ imageUrl: null });

    const html = await res.text();

    // Try og:image, then twitter:image
    const match =
      html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ??
      html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i) ??
      html.match(/<meta[^>]*name="twitter:image(?:src)?"[^>]*content="([^"]+)"/i) ??
      html.match(/<meta[^>]*content="([^"]+)"[^>]*name="twitter:image(?:src)?"/i);

    const imageUrl = match?.[1] ?? null;
    return NextResponse.json(
      { imageUrl },
      { headers: { "Cache-Control": "public, s-maxage=7200, max-age=7200" } }
    );
  } catch {
    return NextResponse.json({ imageUrl: null });
  }
}

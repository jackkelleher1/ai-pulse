import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Source } from "@/types/database";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source") as Source | null;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const sort = searchParams.get("sort") ?? "published_at";

  const q = searchParams.get("q");

  let query = supabase
    .from("content_items")
    .select("*")
    .order(sort === "score" ? "score" : "published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (source) query = query.eq("source", source);
  if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data, count, offset, limit });
}

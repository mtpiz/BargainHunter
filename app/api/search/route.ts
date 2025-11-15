import { NextResponse } from "next/server";
import { runBargainSearch } from "@/src/agents/bargainAgent";
import type { SearchParams } from "@/src/models/searchParams";

function validateSearchParams(body: unknown): SearchParams {
  if (
    !body ||
    typeof body !== "object" ||
    !("searchParams" in body) ||
    typeof (body as any).searchParams !== "object"
  ) {
    throw new Error("Invalid request body");
  }

  const params = (body as { searchParams: Partial<SearchParams> }).searchParams;
  const { query, zipCode, radiusMiles, minPrice, maxPrice, category } = params;

  if (!query || typeof query !== "string") {
    throw new Error("Query is required");
  }

  if (!zipCode || typeof zipCode !== "string") {
    throw new Error("ZIP code is required");
  }

  if (typeof radiusMiles !== "number" || Number.isNaN(radiusMiles)) {
    throw new Error("Radius must be a number");
  }

  const normalized: SearchParams = {
    query: query.trim(),
    zipCode: zipCode.trim(),
    radiusMiles,
    minPrice: typeof minPrice === "number" ? minPrice : undefined,
    maxPrice: typeof maxPrice === "number" ? maxPrice : undefined,
    category: typeof category === "string" ? category : undefined,
  };

  return normalized;
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const body = await request.json();
    const searchParams = validateSearchParams(body);
    const results = await runBargainSearch(searchParams);
    const executionTimeMs = Date.now() - startedAt;

    return NextResponse.json({
      results,
      meta: {
        totalListingsFetched: results.length,
        totalListingsReturned: results.length,
        searchParams,
        executionTimeMs,
      },
    });
  } catch (error) {
    console.error("/api/search error", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

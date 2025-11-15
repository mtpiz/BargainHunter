import { NextResponse } from "next/server";
import { runBargainSearch } from "@/src/agents/bargainAgent";
import type { SearchParams } from "@/src/models/searchParams";

function coerceOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error("Value must be a number");
  }

  return numeric;
}

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

  const normalizedRadius = typeof radiusMiles === "number" ? radiusMiles : Number(radiusMiles);
  if (!Number.isFinite(normalizedRadius) || normalizedRadius <= 0) {
    throw new Error("Radius must be a positive number");
  }

  const normalizedMinPrice = coerceOptionalNumber(minPrice);
  const normalizedMaxPrice = coerceOptionalNumber(maxPrice);

  if (normalizedMinPrice !== undefined && normalizedMinPrice < 0) {
    throw new Error("Min price must be a positive number");
  }

  if (normalizedMaxPrice !== undefined && normalizedMaxPrice < 0) {
    throw new Error("Max price must be a positive number");
  }

  if (
    normalizedMinPrice !== undefined &&
    normalizedMaxPrice !== undefined &&
    normalizedMinPrice > normalizedMaxPrice
  ) {
    throw new Error("Min price cannot be greater than max price");
  }

  const normalizedCategory =
    typeof category === "string" && category.trim().length > 0 ? category.trim() : undefined;

  const normalized: SearchParams = {
    query: query.trim(),
    zipCode: zipCode.trim(),
    radiusMiles: normalizedRadius,
    minPrice: normalizedMinPrice,
    maxPrice: normalizedMaxPrice,
    category: normalizedCategory,
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

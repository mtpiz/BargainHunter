"use client";

import { useMemo, useState } from "react";
import type { EnrichedListing } from "@/src/models/analysis";
import type { SearchParams } from "@/src/models/searchParams";

const DEFAULT_PARAMS: SearchParams = {
  query: "laptop",
  zipCode: "80202",
  radiusMiles: 25,
  minPrice: undefined,
  maxPrice: undefined,
};

export default function HomePage() {
  const [searchParams, setSearchParams] = useState<SearchParams>(DEFAULT_PARAMS);
  const [results, setResults] = useState<EnrichedListing[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasResults = useMemo(() => (results?.length ?? 0) > 0, [results]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchParams }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as {
        results: EnrichedListing[];
      };
      setResults(data.results);
    } catch (err) {
      console.error(err);
      setError("Unable to complete search. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateParam<K extends keyof SearchParams>(key: K, value: SearchParams[K]) {
    setResults(null);
    setSearchParams((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <main>
      <h1>Denver Bargain Hunter</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Search query
          <input
            type="text"
            value={searchParams.query}
            onChange={(event) => updateParam("query", event.target.value)}
            required
          />
        </label>
        <label>
          ZIP code
          <input
            type="text"
            value={searchParams.zipCode}
            onChange={(event) => updateParam("zipCode", event.target.value)}
            pattern="\d{5}"
            required
          />
        </label>
        <label>
          Radius (miles)
          <input
            type="number"
            value={searchParams.radiusMiles}
            min={1}
            max={200}
            onChange={(event) => updateParam("radiusMiles", Number(event.target.value))}
            required
          />
        </label>
        <label>
          Min price
          <input
            type="number"
            value={searchParams.minPrice ?? ""}
            min={0}
            onChange={(event) =>
              updateParam(
                "minPrice",
                event.target.value ? Number(event.target.value) : undefined
              )
            }
          />
        </label>
        <label>
          Max price
          <input
            type="number"
            value={searchParams.maxPrice ?? ""}
            min={0}
            onChange={(event) =>
              updateParam(
                "maxPrice",
                event.target.value ? Number(event.target.value) : undefined
              )
            }
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Find bargains"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {loading && <p>Searching Denver Craigslist for deals…</p>}

      {!loading && results && results.length === 0 && (
        <p>No matching listings found. Try adjusting your filters or widening the search radius.</p>
      )}

      {hasResults && !loading && (
        <section>
          <h2 className="section-title">Top matches</h2>
          <div className="listings">
            {results!.map((listing) => (
              <article key={listing.id} className="listing-card">
                <a href={listing.url} target="_blank" rel="noreferrer">
                  {listing.title}
                </a>
                <p>
                  {listing.price !== null ? `$${listing.price.toLocaleString()}` : "Price unavailable"}
                  {typeof listing.estimatedMsrp === "number"
                    ? ` (Estimated MSRP: $${listing.estimatedMsrp.toLocaleString()})`
                    : ""}
                </p>
                <p>Bargain Score: {listing.bargainScore}/100</p>
                {listing.reasoningSummary && <p>{listing.reasoningSummary}</p>}
                <div className="listing-meta">
                  <span>{listing.location ?? "Denver area"}</span>
                  {listing.postedAt && (
                    <span>
                      {" "}• Posted {new Date(listing.postedAt).toLocaleString()}
                    </span>
                  )}
                  {listing.analysis.detectedModel && (
                    <span>{" "}• Model: {listing.analysis.detectedModel}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

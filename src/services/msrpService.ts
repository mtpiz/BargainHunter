import type { ListingAnalysis } from "@/src/models/analysis";
import type { RawListing } from "@/src/models/listing";

const MSRP_BY_MODEL: Record<string, number> = {
  "Sony WH-1000XM4": 350,
  "Apple iPhone 13 Pro": 999,
  "Specialized Rockhopper": 1100,
  "LG C1": 1499,
  "Apple MacBook Air M2": 1499,
  "Nintendo Switch OLED": 349,
};

export async function lookupMsrp(
  analysis: ListingAnalysis,
  listing: RawListing
): Promise<number | null> {
  // TODO: Integrate with a live MSRP / retail pricing API or search provider.
  if (analysis.detectedModel && MSRP_BY_MODEL[analysis.detectedModel]) {
    return MSRP_BY_MODEL[analysis.detectedModel];
  }

  if (listing.price === null) {
    return null;
  }

  const base = listing.price;
  return Math.round(base * 1.6);
}

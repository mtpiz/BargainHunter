import type { EnrichedListing, ListingAnalysis } from "@/src/models/analysis";
import type { SearchParams } from "@/src/models/searchParams";
import { searchDenver } from "@/src/services/craigslistService";
import { analyzeListingWithLlm, generateReasoningSummary } from "@/src/services/llmService";
import { lookupMsrp } from "@/src/services/msrpService";
import { computeBargainScore } from "@/src/services/scoringService";
import { logger } from "@/src/utils/logger";
import { buildHeuristicAnalysis } from "@/src/services/parsingService";

export async function runBargainSearch(searchParams: SearchParams): Promise<EnrichedListing[]> {
  logger.info("Running bargain search", searchParams);
  const rawListings = await searchDenver(searchParams);

  const enrichedListings = await Promise.all(
    rawListings.map(async (listing) => {
      const analysis = await analyzeListingWithFallback(listing);
      const estimatedMsrp = await lookupMsrpWithFallback(analysis, listing);
      const bargainScore = computeBargainScore({ listing, analysis, estimatedMsrp });
      const reasoningSummary = generateReasoningSummary(listing, analysis, estimatedMsrp);

      const enriched: EnrichedListing = {
        ...listing,
        analysis,
        estimatedMsrp,
        bargainScore,
        reasoningSummary,
      };
      return enriched;
    })
  );

  return enrichedListings.sort((a, b) => b.bargainScore - a.bargainScore);
}

async function analyzeListingWithFallback(
  listing: Parameters<typeof analyzeListingWithLlm>[0]
): Promise<ListingAnalysis> {
  try {
    return await analyzeListingWithLlm(listing);
  } catch (error) {
    logger.error("LLM analysis failed", { listingId: listing.id, error });
    return {
      ...buildHeuristicAnalysis(listing),
      notes: "LLM analysis failed; heuristic fallback used.",
    };
  }
}

async function lookupMsrpWithFallback(
  analysis: Parameters<typeof lookupMsrp>[0],
  listing: Parameters<typeof lookupMsrp>[1]
): Promise<number | null> {
  try {
    return await lookupMsrp(analysis, listing);
  } catch (error) {
    logger.error("MSRP lookup failed", { listingId: listing.id, error });
    return null;
  }
}

import type { EnrichedListing } from "@/src/models/analysis";
import type { SearchParams } from "@/src/models/searchParams";
import { searchDenver } from "@/src/services/craigslistService";
import { analyzeListingWithLlm, generateReasoningSummary } from "@/src/services/llmService";
import { lookupMsrp } from "@/src/services/msrpService";
import { computeBargainScore } from "@/src/services/scoringService";
import { logger } from "@/src/utils/logger";

export async function runBargainSearch(searchParams: SearchParams): Promise<EnrichedListing[]> {
  logger.info("Running bargain search", searchParams);
  const rawListings = await searchDenver(searchParams);

  const enrichedListings = await Promise.all(
    rawListings.map(async (listing) => {
      const analysis = await analyzeListingWithLlm(listing);
      const estimatedMsrp = await lookupMsrp(analysis, listing);
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

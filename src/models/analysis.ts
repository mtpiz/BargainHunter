import type { RawListing } from "./listing";

export interface ListingAnalysis {
  detectedModel?: string;
  inferredCategory?: string;
  qualityHints?: string[];
  notes?: string;
}

export interface EnrichedListing extends RawListing {
  analysis: ListingAnalysis;
  estimatedMsrp?: number | null;
  bargainScore: number;
  reasoningSummary?: string;
}

export interface BargainScoreContext {
  listing: RawListing;
  analysis: ListingAnalysis;
  estimatedMsrp: number | null | undefined;
}

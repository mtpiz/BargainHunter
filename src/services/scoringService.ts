import type { ListingAnalysis } from "@/src/models/analysis";
import type { RawListing } from "@/src/models/listing";
import { differenceInDays } from "@/src/utils/time";

interface ScoreInputs {
  listing: RawListing;
  analysis: ListingAnalysis;
  estimatedMsrp: number | null | undefined;
}

const POSITIVE_HINTS = ["like new", "excellent", "refurbished"];
const NEGATIVE_HINTS = ["for parts", "broken", "has scratches"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeAgeFactor(postedAt?: string): number {
  const ageDays = differenceInDays(postedAt);
  if (ageDays === null) {
    return 0.8;
  }

  if (ageDays <= 2) {
    return 1;
  }

  if (ageDays >= 90) {
    return 0.3;
  }

  if (ageDays >= 30) {
    const slope = (0.3 - 0.6) / (90 - 30);
    return 0.6 + (ageDays - 30) * slope;
  }

  const slope = (0.6 - 1) / (30 - 2);
  return 1 + (ageDays - 2) * slope;
}

export function computeQualityModifier(analysis: ListingAnalysis): number {
  const hints = analysis.qualityHints ?? [];
  let modifier = 0;

  for (const hint of hints) {
    const normalized = hint.toLowerCase();
    if (POSITIVE_HINTS.some((token) => normalized.includes(token))) {
      modifier += 0.05;
    }
    if (NEGATIVE_HINTS.some((token) => normalized.includes(token))) {
      modifier -= 0.05;
    }
  }

  return clamp(modifier, -0.1, 0.1);
}

export function computeBargainScore({
  listing,
  analysis,
  estimatedMsrp,
}: ScoreInputs): number {
  if (listing.price === null || typeof estimatedMsrp !== "number" || estimatedMsrp <= 0) {
    return 20;
  }

  const discount = clamp((estimatedMsrp - listing.price) / estimatedMsrp, 0, 0.7);
  const ageScore = clamp(computeAgeFactor(listing.postedAt), 0.3, 1);
  const qualityScore = computeQualityModifier(analysis);

  const raw = discount * 0.7 + ageScore * 0.25 + qualityScore * 0.05;
  const normalized = clamp(raw, 0, 1);
  return Math.round(normalized * 100);
}

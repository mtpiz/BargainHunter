import { describe, expect, it } from "vitest";
import { computeAgeFactor, computeBargainScore, computeQualityModifier } from "@/src/services/scoringService";
import type { ListingAnalysis } from "@/src/models/analysis";
import type { RawListing } from "@/src/models/listing";

const baseListing: RawListing = {
  id: "1",
  title: "Test listing",
  url: "https://example.com",
  price: 200,
  source: "craigslist",
  postedAt: new Date().toISOString(),
};

const baseAnalysis: ListingAnalysis = {};

describe("computeAgeFactor", () => {
  it("returns 1 for fresh listings", () => {
    const factor = computeAgeFactor(new Date().toISOString());
    expect(factor).toBeCloseTo(1, 2);
  });

  it("decays for older listings", () => {
    const thirtyFiveDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString();
    const factor = computeAgeFactor(thirtyFiveDaysAgo);
    expect(factor).toBeLessThan(1);
    expect(factor).toBeGreaterThan(0.3);
  });
});

describe("computeQualityModifier", () => {
  it("adds bonus for positive hints", () => {
    const modifier = computeQualityModifier({ qualityHints: ["Like New"] });
    expect(modifier).toBeGreaterThan(0);
  });

  it("penalizes negative hints", () => {
    const modifier = computeQualityModifier({ qualityHints: ["for parts only"] });
    expect(modifier).toBeLessThan(0);
  });
});

describe("computeBargainScore", () => {
  it("returns low score when price or MSRP missing", () => {
    const score = computeBargainScore({
      listing: { ...baseListing, price: null },
      analysis: baseAnalysis,
      estimatedMsrp: null,
    });
    expect(score).toBe(20);
  });

  it("increases score with better discount", () => {
    const modestScore = computeBargainScore({
      listing: baseListing,
      analysis: baseAnalysis,
      estimatedMsrp: 250,
    });
    const highScore = computeBargainScore({
      listing: baseListing,
      analysis: baseAnalysis,
      estimatedMsrp: 500,
    });
    expect(highScore).toBeGreaterThan(modestScore);
  });
});

import { describe, expect, it } from "vitest";
import { buildHeuristicAnalysis, detectModelAndCategory, detectQualityHints } from "@/src/services/parsingService";

const listing = {
  id: "abc",
  title: "Sony WH-1000XM4 noise cancelling headphones - like new",
  description: "Includes case, works great",
  url: "https://example.com",
  price: 200,
  source: "craigslist" as const,
};

describe("detectModelAndCategory", () => {
  it("finds known models", () => {
    const result = detectModelAndCategory(listing.title);
    expect(result.model).toBe("Sony WH-1000XM4");
    expect(result.category).toBe("headphones");
  });
});

describe("detectQualityHints", () => {
  it("collects quality descriptors", () => {
    const hints = detectQualityHints(listing.title);
    expect(hints).toContain("like new");
  });
});

describe("buildHeuristicAnalysis", () => {
  it("combines heuristics into analysis", () => {
    const analysis = buildHeuristicAnalysis(listing);
    expect(analysis.detectedModel).toBe("Sony WH-1000XM4");
    expect(analysis.qualityHints).toContain("like new");
  });
});

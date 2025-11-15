import type { ListingAnalysis } from "@/src/models/analysis";
import type { RawListing } from "@/src/models/listing";

const MODEL_PATTERNS: Array<{ pattern: RegExp; model: string; category?: string }> = [
  { pattern: /wh[-\s]?1000xm4/i, model: "Sony WH-1000XM4", category: "headphones" },
  { pattern: /iphone\s?13\s?pro/i, model: "Apple iPhone 13 Pro", category: "smartphone" },
  { pattern: /rockhopper/i, model: "Specialized Rockhopper", category: "bike" },
  { pattern: /lg\s?c1/i, model: "LG C1", category: "television" },
  { pattern: /macbook\s?air\s?m2/i, model: "Apple MacBook Air M2", category: "laptop" },
  { pattern: /switch\s?oled/i, model: "Nintendo Switch OLED", category: "gaming console" },
];

const QUALITY_HINT_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /like new/i, label: "like new" },
  { pattern: /excellent/i, label: "excellent condition" },
  { pattern: /scratches?/i, label: "has scratches" },
  { pattern: /broken|for parts/i, label: "for parts or broken" },
  { pattern: /refurbished/i, label: "refurbished" },
];

export function detectModelAndCategory(text: string): {
  model?: string;
  category?: string;
} {
  for (const entry of MODEL_PATTERNS) {
    if (entry.pattern.test(text)) {
      return { model: entry.model, category: entry.category };
    }
  }

  return {};
}

export function detectQualityHints(text: string): string[] {
  const hints = new Set<string>();
  for (const entry of QUALITY_HINT_PATTERNS) {
    if (entry.pattern.test(text)) {
      hints.add(entry.label);
    }
  }
  return Array.from(hints);
}

export function buildHeuristicAnalysis(listing: RawListing): ListingAnalysis {
  const body = `${listing.title}\n${listing.description ?? ""}`;
  const { model, category } = detectModelAndCategory(body);
  const qualityHints = detectQualityHints(body);

  return {
    detectedModel: model,
    inferredCategory: category,
    qualityHints: qualityHints.length > 0 ? qualityHints : undefined,
    notes: model ? `Detected via heuristic: ${model}` : undefined,
  };
}

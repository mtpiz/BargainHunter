import type { ListingAnalysis } from "@/src/models/analysis";
import type { RawListing } from "@/src/models/listing";
import { buildHeuristicAnalysis, detectQualityHints } from "./parsingService";
import { logger } from "@/src/utils/logger";

const LLM_API_KEY = process.env.LLM_API_KEY;

function buildPrompt(listing: RawListing): string {
  return `You are an expert product identifier. Provide a concise JSON object with keys detectedModel, inferredCategory, qualityHints, notes based on this listing.\nTitle: ${listing.title}\nDescription: ${listing.description ?? ""}`;
}

export async function analyzeListingWithLlm(listing: RawListing): Promise<ListingAnalysis> {
  const prompt = buildPrompt(listing);

  if (!LLM_API_KEY) {
    logger.warn("LLM_API_KEY not provided; using heuristic analysis for", listing.id);
    const heuristic = buildHeuristicAnalysis(listing);
    return {
      ...heuristic,
      notes: heuristic.notes ?? "LLM not configured; heuristic analysis used.",
    };
  }

  // TODO: Replace with real LLM API invocation. For the prototype, we log the intent
  // and reuse deterministic parsing to keep the interface stable.
  logger.info("Simulating LLM call for listing", listing.id, prompt);
  const heuristic = buildHeuristicAnalysis(listing);
  return {
    ...heuristic,
    notes: "Simulated LLM response based on heuristics.",
  };
}

export function generateReasoningSummary(
  listing: RawListing,
  analysis: ListingAnalysis,
  estimatedMsrp: number | null | undefined
): string {
  const hints = analysis.qualityHints ?? detectQualityHints(`${listing.title} ${listing.description ?? ""}`);
  const hintText = hints.length > 0 ? `Quality hints: ${hints.join(", ")}.` : "";
  const priceText =
    listing.price !== null && typeof estimatedMsrp === "number"
      ? `Priced at $${listing.price.toLocaleString()} vs. estimated MSRP $${estimatedMsrp.toLocaleString()}.`
      : "Limited pricing data available.";
  const modelText = analysis.detectedModel ? `Model detected: ${analysis.detectedModel}.` : "Model uncertain.";
  return [priceText, modelText, hintText].filter(Boolean).join(" ");
}

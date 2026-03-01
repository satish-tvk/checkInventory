import { tavily } from "@tavily/core";

const client = tavily({ apiKey: process.env.TAVILY_API_KEY! });

/**
 * Search the web for recent risk information about a supplier.
 * Returns a condensed text summary suitable for LLM context.
 */
export async function searchSupplierInfo(
  supplierName: string,
  country: string
): Promise<string> {
  const query = `${supplierName} ${country} supplier risk news financial stability reliability 2024 2025`;

  const response = await client.search(query, {
    searchDepth: "basic",
    maxResults: 5,
    includeAnswer: true,
  });

  const parts: string[] = [];

  if (response.answer) {
    parts.push(`Summary: ${response.answer}`);
  }

  const snippets = response.results
    .map((r) => `• ${r.title}: ${r.content.slice(0, 300)}`)
    .join("\n");

  if (snippets) {
    parts.push(`Recent findings:\n${snippets}`);
  }

  return parts.join("\n\n") || "No relevant information found.";
}

/**
 * Search the web for competitors operating in the same industry/space.
 * Returns a condensed text summary with company names, descriptions and URLs.
 */
export async function searchCompetitors(
  businessName: string,
  industry: string,
  location?: string
): Promise<string> {
  const locationPart = location ? ` ${location}` : "";
  const query = `${industry}${locationPart} companies competitors alternatives to ${businessName} 2024 2025`;

  const response = await client.search(query, {
    searchDepth: "advanced",
    maxResults: 8,
    includeAnswer: true,
  });

  const parts: string[] = [];

  if (response.answer) {
    parts.push(`Overview: ${response.answer}`);
  }

  const snippets = response.results
    .map((r) => `• ${r.title} (${r.url}): ${r.content.slice(0, 400)}`)
    .join("\n");

  if (snippets) {
    parts.push(`Competitor sources:\n${snippets}`);
  }

  return parts.join("\n\n") || "No competitor information found.";
}

/**
 * Fetch detailed profile information about a specific company.
 * Returns funding, founding year, HQ, products, and market positioning.
 */
export async function getCompanyProfile(companyName: string): Promise<string> {
  const query = `${companyName} company profile founded headquarters funding employees products services overview`;

  const response = await client.search(query, {
    searchDepth: "advanced",
    maxResults: 5,
    includeAnswer: true,
  });

  const parts: string[] = [];

  if (response.answer) {
    parts.push(`Company summary: ${response.answer}`);
  }

  const snippets = response.results
    .map((r) => `• ${r.title} (${r.url}): ${r.content.slice(0, 500)}`)
    .join("\n");

  if (snippets) {
    parts.push(`Details:\n${snippets}`);
  }

  return parts.join("\n\n") || "No company profile found.";
}

/**
 * Search external review platforms/news to validate a vendor's review quality.
 * Returns compact evidence suitable for downstream scoring.
 */
export async function searchVendorReviews(
  vendorName: string,
  location?: string,
  category?: string,
): Promise<string> {
  const locationPart = location ? ` ${location}` : "";
  const categoryPart = category ? ` ${category}` : "";
  const query = `${vendorName}${locationPart}${categoryPart} reviews rating trustpilot yelp google maps g2 complaints fake reviews customer feedback`;

  const response = await client.search(query, {
    searchDepth: "advanced",
    maxResults: 8,
    includeAnswer: true,
  });

  const parts: string[] = [];

  if (response.answer) {
    parts.push(`Review overview: ${response.answer}`);
  }

  const snippets = response.results
    .map((r) => `- ${r.title} (${r.url}): ${r.content.slice(0, 350)}`)
    .join("\n");

  if (snippets) {
    parts.push(`Review sources:\n${snippets}`);
  }

  return parts.join("\n\n") || "No review evidence found.";
}

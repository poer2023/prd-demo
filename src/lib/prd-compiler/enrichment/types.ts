export interface EnrichmentRequest {
  pageTitle: string;
  requirements: string[];
  inferredFields: string[];
}

export interface EnrichmentSuggestion {
  source: "mock-ai";
  fields: string[];
}

export interface EnrichmentGuardResult {
  valid: boolean;
  reason?: string;
  fields: string[];
}

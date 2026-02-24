import type { EnrichmentGuardResult, EnrichmentSuggestion } from "./types";

const FIELD_NAME_REGEX = /^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/;
const MAX_FIELD_COUNT = 20;
const MAX_FIELD_LENGTH = 40;

function dedupe(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function guardEnrichmentSuggestion(suggestion: EnrichmentSuggestion): EnrichmentGuardResult {
  const fields = dedupe(suggestion.fields);
  if (fields.length === 0) {
    return { valid: false, reason: "No enrichable fields in suggestion.", fields: [] };
  }
  if (fields.length > MAX_FIELD_COUNT) {
    return { valid: false, reason: "Too many fields in enrichment suggestion.", fields: [] };
  }

  for (const field of fields) {
    if (field.length > MAX_FIELD_LENGTH) {
      return { valid: false, reason: `Field is too long: ${field}`, fields: [] };
    }
    if (!FIELD_NAME_REGEX.test(field)) {
      return { valid: false, reason: `Field contains invalid characters: ${field}`, fields: [] };
    }
  }

  return { valid: true, fields };
}

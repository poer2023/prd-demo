import type { EnrichmentRequest, EnrichmentSuggestion } from "./types";

const EMAIL_REGEX = /(email|邮箱)/i;
const PHONE_REGEX = /(phone|手机号|电话)/i;
const NAME_REGEX = /(name|姓名|称呼)/i;

function dedupe(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function generateEnrichmentSuggestion(request: EnrichmentRequest): EnrichmentSuggestion | null {
  const existing = new Set(request.inferredFields.map((field) => field.toLowerCase()));
  const suggested: string[] = [];

  const fullText = [request.pageTitle, ...request.requirements].join("\n");
  if (EMAIL_REGEX.test(fullText) && !existing.has("email")) {
    suggested.push("email");
  }
  if (PHONE_REGEX.test(fullText) && !existing.has("phone")) {
    suggested.push("phone");
  }
  if (NAME_REGEX.test(fullText) && !existing.has("name")) {
    suggested.push("name");
  }

  const fields = dedupe(suggested);
  if (fields.length === 0) return null;

  return {
    source: "mock-ai",
    fields,
  };
}

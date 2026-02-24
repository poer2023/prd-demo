import type { NormalizedPrdPage, PageClassification } from "../types";

const FORM_REQUIREMENT_REGEX = /(表单|form|input|submit)/i;
const LIST_REQUIREMENT_REGEX = /(列表|list|table|card)/i;

export function classifyPage(page: NormalizedPrdPage): PageClassification {
  const hasFormRequirement = page.requirements.some((item) => FORM_REQUIREMENT_REGEX.test(item));
  const hasListRequirement = page.requirements.some((item) => LIST_REQUIREMENT_REGEX.test(item));

  if (hasFormRequirement) {
    return {
      template: "form",
      hasFormRequirement,
      hasListRequirement,
    };
  }

  if (hasListRequirement) {
    return {
      template: "list",
      hasFormRequirement,
      hasListRequirement,
    };
  }

  return {
    template: "detail",
    hasFormRequirement,
    hasListRequirement,
  };
}

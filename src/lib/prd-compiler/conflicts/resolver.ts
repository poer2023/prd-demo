import type { NormalizedPrdPage, PageSemanticSignals } from "../types";
import type { ConflictResolutionResult, CompilerConflict } from "./types";

const PRIMARY_HEX_REGEX = /(?:主色|primary)\s*[:：]\s*(#[A-Fa-f0-9]{3,6})/i;
const BACKGROUND_HEX_REGEX = /(?:背景色|background)\s*[:：]\s*(#[A-Fa-f0-9]{3,6})/i;
const PRIMARY_KEYWORD_REGEX = /(?:主色|primary)\s*[:：]\s*/i;
const BACKGROUND_KEYWORD_REGEX = /(?:背景色|background)\s*[:：]\s*/i;
const UNSUPPORTED_UPLOAD_REGEX = /(上传|upload|附件|file upload)/i;

function collectTokenConflicts(
  directives: string[],
  tokenRegex: RegExp,
  tokenKeywordRegex: RegExp,
  conflictCode: string,
  pathPrefix: string
) {
  const values: string[] = [];
  directives.forEach((directive) => {
    const match = directive.match(tokenRegex);
    if (match?.[1]) values.push(match[1].toLowerCase());
  });

  const warnings: ConflictResolutionResult["warnings"] = [];
  const uniqueValues = [...new Set(values)];
  if (uniqueValues.length > 1) {
    warnings.push({
      code: conflictCode,
      message: `${pathPrefix} has conflicting values (${uniqueValues.join(", ")}). Using last declaration.`,
    });
  }

  directives.forEach((directive, index) => {
    if (tokenKeywordRegex.test(directive) && !tokenRegex.test(directive)) {
      warnings.push({
        code: "UNSUPPORTED_STYLE_TOKEN_FORMAT",
        message: `${pathPrefix}[${index}] uses unsupported token format: "${directive}"`,
      });
    }
  });

  return warnings;
}

export function resolvePageConflicts(
  page: NormalizedPrdPage,
  signals: PageSemanticSignals
): ConflictResolutionResult {
  const warnings: ConflictResolutionResult["warnings"] = [];
  const errors: CompilerConflict[] = [];

  let template = signals.template;
  if (signals.hasFormRequirement && signals.hasListRequirement) {
    template = "form";
    warnings.push({
      code: "MIXED_PAGE_INTENT_DOWNGRADED",
      message: `Page "${page.title}" includes both form and list intent. Downgraded to form template.`,
    });
  }

  page.requirements.forEach((requirement, index) => {
    if (UNSUPPORTED_UPLOAD_REGEX.test(requirement)) {
      errors.push({
        code: "UNSUPPORTED_COMPONENT_CAPABILITY",
        message: `Requirement requests unsupported capability: ${requirement}`,
        path: `pages[${page.id}].requirements[${index}]`,
        resolution: "fail",
      });
    }
  });

  warnings.push(
    ...collectTokenConflicts(
      page.styleDirectives,
      PRIMARY_HEX_REGEX,
      PRIMARY_KEYWORD_REGEX,
      "STYLE_PRIMARY_CONFLICT_DOWNGRADED",
      `Page "${page.title}" primary style directives`
    ),
    ...collectTokenConflicts(
      page.styleDirectives,
      BACKGROUND_HEX_REGEX,
      BACKGROUND_KEYWORD_REGEX,
      "STYLE_BACKGROUND_CONFLICT_DOWNGRADED",
      `Page "${page.title}" background style directives`
    )
  );

  return { template, warnings, errors };
}

export function resolveGlobalStyleConflicts(globalStyleDirectives: string[]): ConflictResolutionResult["warnings"] {
  return [
    ...collectTokenConflicts(
      globalStyleDirectives,
      PRIMARY_HEX_REGEX,
      PRIMARY_KEYWORD_REGEX,
      "STYLE_PRIMARY_CONFLICT_DOWNGRADED",
      "Global primary style directives"
    ),
    ...collectTokenConflicts(
      globalStyleDirectives,
      BACKGROUND_HEX_REGEX,
      BACKGROUND_KEYWORD_REGEX,
      "STYLE_BACKGROUND_CONFLICT_DOWNGRADED",
      "Global background style directives"
    ),
  ];
}

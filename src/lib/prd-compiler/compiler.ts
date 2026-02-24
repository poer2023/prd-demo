import {
  DEFAULT_DESIGN_TOKENS,
  PROTO_SPEC_VERSION,
  validateProtoSpec,
  type DesignTokens,
  type PageSpec,
  type ProtoSpec,
  type RequirementTrace,
} from "@/lib/protospec";
import { PRD_COMPILER_ERROR_CODES, PrdCompilerError } from "./errors";
import { normalizePrdDocument } from "./normalizer";
import { parsePrdSource } from "./parser";
import { resolveGlobalStyleConflicts, resolvePageConflicts } from "./conflicts/resolver";
import { guardEnrichmentSuggestion } from "./enrichment/guard";
import { generateEnrichmentSuggestion } from "./enrichment/service";
import { buildRootComponent } from "./rules/component-extractor";
import { inferFieldNames } from "./rules/field-extractor";
import { buildInteractions } from "./rules/flow-extractor";
import { classifyPage } from "./rules/page-classifier";
import type {
  CompilerOutput,
  CompilerReviewReport,
  CompilerWarning,
  PageSemanticSignals,
  PrdSource,
} from "./types";

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(16);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "page";
}

function applyStyleDirectives(tokens: DesignTokens, directives: string[]): DesignTokens {
  const nextTokens: DesignTokens = JSON.parse(JSON.stringify(tokens)) as DesignTokens;

  directives.forEach((directive) => {
    const colorMatch = directive.match(/(?:主色|primary)\s*[:：]\s*(#[A-Fa-f0-9]{3,6})/i);
    if (colorMatch?.[1]) {
      nextTokens.color.primary = colorMatch[1];
    }

    const backgroundMatch = directive.match(/(?:背景色|background)\s*[:：]\s*(#[A-Fa-f0-9]{3,6})/i);
    if (backgroundMatch?.[1]) {
      nextTokens.color.background = backgroundMatch[1];
    }

    const radiusMatch = directive.match(/(?:圆角|radius)\s*[:：]\s*([0-9]+px)/i);
    if (radiusMatch?.[1]) {
      nextTokens.radius.md = radiusMatch[1];
    }

    const fontMatch = directive.match(/(?:字体|font)\s*[:：]\s*([^\n]+)/i);
    if (fontMatch?.[1]) {
      nextTokens.typography.fontFamily = fontMatch[1].trim();
    }
  });

  return nextTokens;
}

function buildTraces(pages: PageSpec[]): RequirementTrace[] {
  const traces: RequirementTrace[] = [];
  let traceIndex = 0;

  for (const page of pages) {
    for (const criterion of page.acceptanceCriteria) {
      traceIndex += 1;
      traces.push({
        requirementId: `req_${traceIndex}`,
        text: criterion,
        references: [{ pageId: page.id }],
      });
    }

    for (const interaction of page.interactions) {
      traceIndex += 1;
      traces.push({
        requirementId: `req_${traceIndex}`,
        text: interaction.name,
        references: [{ pageId: page.id, interactionId: interaction.id }],
      });
    }
  }

  return traces;
}

function buildReviewReport(pages: PageSpec[], warnings: CompilerWarning[]): CompilerReviewReport {
  const warningPenalty: Record<string, number> = {
    NO_INTERACTIONS_DETECTED: 0.2,
    MIXED_PAGE_INTENT_DOWNGRADED: 0.15,
    FORM_FIELD_INFERRED_DEFAULT: 0.1,
    STYLE_PRIMARY_CONFLICT_DOWNGRADED: 0.05,
    STYLE_BACKGROUND_CONFLICT_DOWNGRADED: 0.05,
    UNSUPPORTED_STYLE_TOKEN_FORMAT: 0.08,
  };

  const reasons: string[] = [];
  let confidence = 1;

  for (const warning of warnings) {
    const penalty = warningPenalty[warning.code];
    if (!penalty) continue;
    confidence -= penalty;
    reasons.push(warning.message);
  }

  const pagesWithoutAcceptance = pages.filter((page) => page.acceptanceCriteria.length === 0).length;
  if (pagesWithoutAcceptance > 0) {
    confidence -= 0.1;
    reasons.push(`${pagesWithoutAcceptance} page(s) have no acceptance criteria.`);
  }

  const pagesWithoutInteractions = pages.filter((page) => page.interactions.length === 0).length;
  if (pagesWithoutInteractions > 0) {
    confidence -= 0.05;
    reasons.push(`${pagesWithoutInteractions} page(s) have no interaction rules.`);
  }

  const roundedConfidence = Math.max(0, Math.min(1, Number(confidence.toFixed(2))));
  const needsHumanReview =
    roundedConfidence < 0.75 ||
    warnings.some((warning) =>
      ["MIXED_PAGE_INTENT_DOWNGRADED", "UNSUPPORTED_STYLE_TOKEN_FORMAT"].includes(warning.code)
    );

  return {
    confidence: roundedConfidence,
    needsHumanReview,
    reasons,
  };
}

export function compilePrdToProtoSpec(source: PrdSource): CompilerOutput {
  const document = parsePrdSource(source);
  const normalized = normalizePrdDocument(source, document);

  const warnings: CompilerWarning[] = [...resolveGlobalStyleConflicts(normalized.globalStyleDirectives)];
  const baseTokens = applyStyleDirectives(
    DEFAULT_DESIGN_TOKENS,
    [...normalized.globalStyleDirectives, ...normalized.pages.flatMap((page) => page.styleDirectives)]
  );

  const pages: PageSpec[] = normalized.pages.map((page, index) => {
    const ruleInferredFields = inferFieldNames(page.requirements);
    const enrichmentSuggestion = generateEnrichmentSuggestion({
      pageTitle: page.title,
      requirements: page.requirements,
      inferredFields: ruleInferredFields,
    });

    let inferredFields = [...new Set(ruleInferredFields)];
    if (enrichmentSuggestion) {
      const guardedSuggestion = guardEnrichmentSuggestion(enrichmentSuggestion);
      if (guardedSuggestion.valid) {
        inferredFields = [...new Set([...inferredFields, ...guardedSuggestion.fields])];
        warnings.push({
          code: "ENRICHMENT_FIELDS_APPLIED",
          message: `Page "${page.title}" applied guarded enrichment fields: ${guardedSuggestion.fields.join(", ")}`,
        });
      } else {
        warnings.push({
          code: "ENRICHMENT_GUARD_REJECTED",
          message: `Page "${page.title}" rejected enrichment suggestion: ${guardedSuggestion.reason || "invalid suggestion"}`,
        });
      }
    }

    const baseSignals: PageSemanticSignals = {
      ...classifyPage(page),
      inferredFields,
    };
    const pageResolution = resolvePageConflicts(page, baseSignals);
    warnings.push(...pageResolution.warnings);
    if (pageResolution.errors.length > 0) {
      throw new PrdCompilerError(
        PRD_COMPILER_ERROR_CODES.CONSTRAINT_CONFLICT,
        "Compiler constraints conflict",
        pageResolution.errors.reduce<Record<string, string>>((acc, conflict, idx) => {
          acc[`conflict_${idx + 1}`] = `${conflict.path}: ${conflict.message} (${conflict.code})`;
          return acc;
        }, {})
      );
    }

    const semanticSignals: PageSemanticSignals = {
      ...baseSignals,
      template: pageResolution.template,
    };
    const pageSlug = slugify(page.title);
    const pageId = `${source.projectId}_page_${index + 1}_${pageSlug}`;

    return {
      id: pageId,
      slug: pageSlug,
      title: page.title,
      summary: page.summary,
      root: buildRootComponent(page, pageSlug, semanticSignals, warnings),
      interactions: buildInteractions(page, pageSlug),
      acceptanceCriteria:
        page.acceptanceCriteria.length > 0
          ? page.acceptanceCriteria
          : normalized.globalAcceptanceCriteria,
    };
  });

  if (pages.every((page) => page.interactions.length === 0)) {
    warnings.push({
      code: "NO_INTERACTIONS_DETECTED",
      message: "No interactions detected from PRD. Generated pages include structure only.",
    });
  }

  const review = buildReviewReport(pages, warnings);

  const spec: ProtoSpec = {
    id: `spec_${source.projectId}_${stableHash(source.content)}`,
    version: PROTO_SPEC_VERSION,
    meta: {
      projectId: source.projectId,
      title: normalized.title,
      description: normalized.pages.map((page) => page.summary).join(" | ").slice(0, 240),
      generatedAt: new Date().toISOString(),
      sourceHash: stableHash(source.content),
      sourceType: source.sourceType || "markdown",
      compilerVersion: "phase-a",
    },
    pages,
    tokens: baseTokens,
    traces: buildTraces(pages),
    quality: {
      validationPassed: false,
      warningCount: warnings.length,
      warnings: warnings.map((warning) => warning.message),
    },
  };

  const validation = validateProtoSpec(spec);
  if (!validation.valid) {
    throw new PrdCompilerError(
      PRD_COMPILER_ERROR_CODES.INVALID_PROTO_SPEC,
      "Compiled ProtoSpec failed validation",
      validation.issues.reduce<Record<string, string>>((acc, issue, idx) => {
        acc[`issue_${idx + 1}`] = `${issue.path}: ${issue.message}`;
        return acc;
      }, {})
    );
  }

  spec.quality.validationPassed = true;
  return { spec, warnings, review };
}

import {
  DEFAULT_DESIGN_TOKENS,
  PROTO_SPEC_VERSION,
  validateProtoSpec,
  type ComponentNode,
  type DesignTokens,
  type InteractionAction,
  type InteractionSpec,
  type PageSpec,
  type ProtoSpec,
  type RequirementTrace,
} from "@/lib/protospec";
import { PrdCompilerError } from "./errors";
import { normalizePrdDocument } from "./normalizer";
import { parsePrdSource } from "./parser";
import type { CompilerOutput, CompilerWarning, NormalizedPrdPage, PrdSource } from "./types";

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

function inferFieldNames(requirements: string[]): string[] {
  const fields: string[] = [];
  for (const requirement of requirements) {
    const match = requirement.match(/(?:字段|field|input)[:：]\s*([a-zA-Z0-9_\-\u4e00-\u9fa5]+)/i);
    if (match?.[1]) fields.push(match[1]);
  }
  return fields;
}

function createComponentNode(
  id: string,
  type: ComponentNode["type"],
  name: string,
  props: ComponentNode["props"],
  children: ComponentNode[] = []
): ComponentNode {
  return { id, type, name, props, children };
}

function buildRootComponent(page: NormalizedPrdPage, warnings: CompilerWarning[]): ComponentNode {
  const rootId = `${slugify(page.title)}_root`;
  const inferredFields = inferFieldNames(page.requirements);

  const hasFormRequirement = page.requirements.some((item) => /(表单|form|input|submit)/i.test(item));
  const hasListRequirement = page.requirements.some((item) => /(列表|list|table|card)/i.test(item));

  const heading = createComponentNode(
    `${rootId}_heading`,
    "Heading",
    "pageHeading",
    { text: page.title, level: 1 }
  );
  const summary = createComponentNode(
    `${rootId}_summary`,
    "Text",
    "pageSummary",
    { text: page.summary }
  );

  if (hasFormRequirement) {
    const formFields =
      inferredFields.length > 0
        ? inferredFields
        : ["topic", "description", "submit"];
    if (inferredFields.length === 0) {
      warnings.push({
        code: "FORM_FIELD_INFERRED_DEFAULT",
        message: `Page "${page.title}" has form-like requirements but no explicit fields. Applied default fields.`,
      });
    }

    const formChildren = formFields.map((fieldName, index) =>
      createComponentNode(
        `${rootId}_field_${index + 1}`,
        /submit|提交/i.test(fieldName) ? "Button" : "Input",
        fieldName,
        /submit|提交/i.test(fieldName)
          ? { label: fieldName, role: "submit" }
          : { label: fieldName, name: slugify(fieldName), placeholder: `Enter ${fieldName}` }
      )
    );

    const form = createComponentNode(
      `${rootId}_form`,
      "Container",
      "formContainer",
      { role: "form", gap: "md" },
      formChildren
    );

    return createComponentNode(rootId, "Page", page.title, { layout: "single-column" }, [heading, summary, form]);
  }

  if (hasListRequirement) {
    const listItems = page.requirements.slice(0, 5).map((item, index) =>
      createComponentNode(`${rootId}_list_item_${index + 1}`, "ListItem", `item${index + 1}`, { text: item })
    );
    const list = createComponentNode(`${rootId}_list`, "List", "mainList", { ordered: false }, listItems);
    return createComponentNode(rootId, "Page", page.title, { layout: "single-column" }, [heading, summary, list]);
  }

  return createComponentNode(rootId, "Page", page.title, { layout: "single-column" }, [heading, summary]);
}

function buildInteractions(page: NormalizedPrdPage): InteractionSpec[] {
  const interactions: InteractionSpec[] = [];

  page.interactions.forEach((raw, index) => {
    const interactionId = `${slugify(page.title)}_int_${index + 1}`;
    const [left, right] = raw.split(/->|=>|→/).map((part) => part.trim());
    const event = left || `event_${index + 1}`;
    const target = right || "state_change";

    const action: InteractionAction = {
      id: `${interactionId}_action_1`,
      type: /navigate|跳转/i.test(target) ? "navigate" : "set_state",
      payload: /navigate|跳转/i.test(target)
        ? { to: target.replace(/^(navigate|跳转)[:：]?\s*/i, "") || "/" }
        : { patch: target },
    };

    interactions.push({
      id: interactionId,
      name: raw,
      event,
      actions: [action],
    });
  });

  return interactions;
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

export function compilePrdToProtoSpec(source: PrdSource): CompilerOutput {
  const document = parsePrdSource(source);
  const normalized = normalizePrdDocument(source, document);

  const warnings: CompilerWarning[] = [];
  const baseTokens = applyStyleDirectives(
    DEFAULT_DESIGN_TOKENS,
    [...normalized.globalStyleDirectives, ...normalized.pages.flatMap((page) => page.styleDirectives)]
  );

  const pages: PageSpec[] = normalized.pages.map((page, index) => {
    const pageId = `${source.projectId}_page_${index + 1}_${slugify(page.title)}`;
    return {
      id: pageId,
      slug: slugify(page.title),
      title: page.title,
      summary: page.summary,
      root: buildRootComponent(page, warnings),
      interactions: buildInteractions(page),
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
      "INVALID_PROTO_SPEC",
      "Compiled ProtoSpec failed validation",
      validation.issues.reduce<Record<string, string>>((acc, issue, idx) => {
        acc[`issue_${idx + 1}`] = `${issue.path}: ${issue.message}`;
        return acc;
      }, {})
    );
  }

  spec.quality.validationPassed = true;
  return { spec, warnings };
}

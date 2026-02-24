import type {
  ComponentNode,
  InteractionSpec,
  PageSpec,
  ProtoSpec,
  ProtoSpecValidationIssue,
  ProtoSpecValidationResult,
  RequirementTrace,
} from "./types";

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

function pushIssue(
  issues: ProtoSpecValidationIssue[],
  code: string,
  message: string,
  path: string
) {
  issues.push({ code, message, path });
}

function collectNodeIds(node: ComponentNode, ids: Set<string>, issues: ProtoSpecValidationIssue[], path: string) {
  if (ids.has(node.id)) {
    pushIssue(issues, "DUPLICATE_NODE_ID", `Duplicate component node id: ${node.id}`, `${path}.id`);
  } else {
    ids.add(node.id);
  }

  node.children.forEach((child, index) => {
    collectNodeIds(child, ids, issues, `${path}.children[${index}]`);
  });
}

function validateInteractionTargets(
  page: PageSpec,
  nodeIds: Set<string>,
  issues: ProtoSpecValidationIssue[],
  basePath: string
) {
  page.interactions.forEach((interaction, index) => {
    const path = `${basePath}.interactions[${index}]`;
    if (!interaction.id.trim()) {
      pushIssue(issues, "EMPTY_INTERACTION_ID", "Interaction id cannot be empty", `${path}.id`);
    }
    if (!interaction.event.trim()) {
      pushIssue(issues, "EMPTY_INTERACTION_EVENT", "Interaction event cannot be empty", `${path}.event`);
    }
    if (interaction.targetNodeId && !nodeIds.has(interaction.targetNodeId)) {
      pushIssue(
        issues,
        "MISSING_TARGET_NODE",
        `Interaction target node not found: ${interaction.targetNodeId}`,
        `${path}.targetNodeId`
      );
    }
    if (interaction.actions.length === 0) {
      pushIssue(issues, "EMPTY_INTERACTION_ACTIONS", "Interaction must have at least one action", `${path}.actions`);
    }
  });
}

function validatePage(page: PageSpec, issues: ProtoSpecValidationIssue[], path: string) {
  if (!page.id.trim()) {
    pushIssue(issues, "EMPTY_PAGE_ID", "Page id cannot be empty", `${path}.id`);
  }
  if (!page.slug.trim()) {
    pushIssue(issues, "EMPTY_PAGE_SLUG", "Page slug cannot be empty", `${path}.slug`);
  }
  if (!page.title.trim()) {
    pushIssue(issues, "EMPTY_PAGE_TITLE", "Page title cannot be empty", `${path}.title`);
  }

  const nodeIds = new Set<string>();
  collectNodeIds(page.root, nodeIds, issues, `${path}.root`);
  validateInteractionTargets(page, nodeIds, issues, path);
}

function validateColorToken(value: string, path: string, issues: ProtoSpecValidationIssue[]) {
  if (!HEX_COLOR_REGEX.test(value)) {
    pushIssue(issues, "INVALID_COLOR_TOKEN", `Invalid color token: ${value}`, path);
  }
}

function validateTraces(
  pagesById: Set<string>,
  interactionsByPage: Map<string, Set<string>>,
  traces: RequirementTrace[],
  issues: ProtoSpecValidationIssue[]
) {
  traces.forEach((trace, index) => {
    if (!trace.requirementId.trim()) {
      pushIssue(issues, "EMPTY_TRACE_ID", "Requirement trace id cannot be empty", `traces[${index}].requirementId`);
    }
    if (!trace.text.trim()) {
      pushIssue(issues, "EMPTY_TRACE_TEXT", "Requirement trace text cannot be empty", `traces[${index}].text`);
    }

    trace.references.forEach((ref, refIndex) => {
      const refPath = `traces[${index}].references[${refIndex}]`;
      if (!pagesById.has(ref.pageId)) {
        pushIssue(issues, "TRACE_PAGE_NOT_FOUND", `Trace page not found: ${ref.pageId}`, `${refPath}.pageId`);
      }
      if (ref.interactionId && pagesById.has(ref.pageId)) {
        const pageInteractions = interactionsByPage.get(ref.pageId);
        if (!pageInteractions?.has(ref.interactionId)) {
          pushIssue(
            issues,
            "TRACE_INTERACTION_NOT_FOUND",
            `Trace interaction not found: ${ref.interactionId}`,
            `${refPath}.interactionId`
          );
        }
      }
    });
  });
}

export function validateProtoSpec(spec: ProtoSpec): ProtoSpecValidationResult {
  const issues: ProtoSpecValidationIssue[] = [];

  if (!spec.id.trim()) {
    pushIssue(issues, "EMPTY_SPEC_ID", "Spec id cannot be empty", "id");
  }
  if (!spec.meta.projectId.trim()) {
    pushIssue(issues, "EMPTY_PROJECT_ID", "Project id cannot be empty", "meta.projectId");
  }
  if (!spec.meta.title.trim()) {
    pushIssue(issues, "EMPTY_META_TITLE", "Meta title cannot be empty", "meta.title");
  }
  if (spec.pages.length === 0) {
    pushIssue(issues, "NO_PAGES", "Spec must contain at least one page", "pages");
  }

  validateColorToken(spec.tokens.color.background, "tokens.color.background", issues);
  validateColorToken(spec.tokens.color.surface, "tokens.color.surface", issues);
  validateColorToken(spec.tokens.color.primary, "tokens.color.primary", issues);
  validateColorToken(spec.tokens.color.secondary, "tokens.color.secondary", issues);
  validateColorToken(spec.tokens.color.text, "tokens.color.text", issues);
  validateColorToken(spec.tokens.color.mutedText, "tokens.color.mutedText", issues);
  validateColorToken(spec.tokens.color.border, "tokens.color.border", issues);

  const pageIds = new Set<string>();
  const pageSlugs = new Set<string>();
  const interactionsByPage = new Map<string, Set<string>>();

  spec.pages.forEach((page, pageIndex) => {
    const path = `pages[${pageIndex}]`;
    if (pageIds.has(page.id)) {
      pushIssue(issues, "DUPLICATE_PAGE_ID", `Duplicate page id: ${page.id}`, `${path}.id`);
    } else {
      pageIds.add(page.id);
    }

    if (pageSlugs.has(page.slug)) {
      pushIssue(issues, "DUPLICATE_PAGE_SLUG", `Duplicate page slug: ${page.slug}`, `${path}.slug`);
    } else {
      pageSlugs.add(page.slug);
    }

    const interactionIds = new Set<string>();
    page.interactions.forEach((interaction: InteractionSpec, interactionIndex) => {
      const interactionPath = `${path}.interactions[${interactionIndex}]`;
      if (interactionIds.has(interaction.id)) {
        pushIssue(
          issues,
          "DUPLICATE_INTERACTION_ID",
          `Duplicate interaction id in page ${page.id}: ${interaction.id}`,
          `${interactionPath}.id`
        );
      } else {
        interactionIds.add(interaction.id);
      }
    });
    interactionsByPage.set(page.id, interactionIds);

    validatePage(page, issues, path);
  });

  validateTraces(pageIds, interactionsByPage, spec.traces, issues);

  return {
    valid: issues.length === 0,
    issues,
  };
}

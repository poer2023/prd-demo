import type {
  NormalizedPrd,
  NormalizedPrdPage,
  PrdAstDocument,
  PrdAstSection,
  PrdSource,
} from "./types";

const PAGE_TITLE_REGEX = /(页面|page|screen|view)/i;
const INTERACTION_TITLE_REGEX = /(交互|interaction|flow|行为)/i;
const STYLE_TITLE_REGEX = /(样式|style|theme|视觉|design token)/i;
const ACCEPTANCE_TITLE_REGEX = /(验收|acceptance|criteria|done)/i;

function sectionChildrenMap(sections: PrdAstSection[]): Map<string | null, PrdAstSection[]> {
  const map = new Map<string | null, PrdAstSection[]>();
  for (const section of sections) {
    const key = section.parentId;
    const existing = map.get(key);
    if (existing) {
      existing.push(section);
    } else {
      map.set(key, [section]);
    }
  }
  return map;
}

function collectSubtreeSections(
  sectionId: string,
  childrenByParent: Map<string | null, PrdAstSection[]>
): PrdAstSection[] {
  const result: PrdAstSection[] = [];
  const queue: PrdAstSection[] = [...(childrenByParent.get(sectionId) || [])];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    const children = childrenByParent.get(current.id) || [];
    queue.push(...children);
  }
  return result;
}

function extractBulletLines(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*+]\s+/.test(line))
    .map((line) => line.replace(/^[-*+]\s+/, "").trim())
    .filter(Boolean);
}

function extractPlainParagraphs(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^[-*+]\s+/.test(line) && !/^#{1,6}\s+/.test(line));
}

function normalizePageFromSections(
  pageSection: PrdAstSection,
  subtree: PrdAstSection[]
): NormalizedPrdPage {
  const allSections = [pageSection, ...subtree];

  const summary = extractPlainParagraphs(pageSection.content)[0] || pageSection.title;
  const requirements = allSections.flatMap((section) => extractBulletLines(section.content));

  const interactions = allSections
    .filter((section) => INTERACTION_TITLE_REGEX.test(section.title))
    .flatMap((section) => {
      const bullets = extractBulletLines(section.content);
      const paragraphs = extractPlainParagraphs(section.content);
      return [...bullets, ...paragraphs];
    })
    .filter(Boolean);

  const styleDirectives = allSections
    .filter((section) => STYLE_TITLE_REGEX.test(section.title))
    .flatMap((section) => [...extractBulletLines(section.content), ...extractPlainParagraphs(section.content)])
    .filter(Boolean);

  const acceptanceCriteria = allSections
    .filter((section) => ACCEPTANCE_TITLE_REGEX.test(section.title))
    .flatMap((section) => [...extractBulletLines(section.content), ...extractPlainParagraphs(section.content)])
    .filter(Boolean);

  return {
    id: pageSection.id,
    title: pageSection.title,
    summary,
    requirements,
    interactions,
    styleDirectives,
    acceptanceCriteria,
  };
}

function buildFallbackPage(document: PrdAstDocument): NormalizedPrdPage {
  const allContent = document.sections.map((section) => section.content).join("\n");
  return {
    id: "fallback_page_1",
    title: document.title,
    summary: extractPlainParagraphs(allContent)[0] || "Generated from PRD content",
    requirements: document.sections.flatMap((section) => extractBulletLines(section.content)),
    interactions: [],
    styleDirectives: [],
    acceptanceCriteria: [],
  };
}

export function normalizePrdDocument(source: PrdSource, document: PrdAstDocument): NormalizedPrd {
  const topLevelSections = document.sections.filter((section) => section.level === 2);
  const childrenByParent = sectionChildrenMap(document.sections);

  const explicitPageSections = topLevelSections.filter((section) => PAGE_TITLE_REGEX.test(section.title));
  const pageSections = explicitPageSections.length > 0 ? explicitPageSections : topLevelSections;

  const pages =
    pageSections.length > 0
      ? pageSections.map((pageSection) =>
          normalizePageFromSections(pageSection, collectSubtreeSections(pageSection.id, childrenByParent))
        )
      : [buildFallbackPage(document)];

  const globalStyleDirectives = document.sections
    .filter((section) => section.level <= 2 && STYLE_TITLE_REGEX.test(section.title))
    .flatMap((section) => [...extractBulletLines(section.content), ...extractPlainParagraphs(section.content)]);

  const globalAcceptanceCriteria = document.sections
    .filter((section) => section.level <= 2 && ACCEPTANCE_TITLE_REGEX.test(section.title))
    .flatMap((section) => [...extractBulletLines(section.content), ...extractPlainParagraphs(section.content)]);

  return {
    projectId: source.projectId,
    title: document.title,
    pages,
    globalStyleDirectives,
    globalAcceptanceCriteria,
  };
}

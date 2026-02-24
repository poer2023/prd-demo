import { PrdCompilerError } from "./errors";
import type { PrdAstDocument, PrdAstSection, PrdSource } from "./types";

function createSectionId(index: number, title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `sec_${index}_${slug || "untitled"}`;
}

export function parsePrdSource(source: PrdSource): PrdAstDocument {
  if (!source.content.trim()) {
    throw new PrdCompilerError("EMPTY_PRD_CONTENT", "PRD content cannot be empty");
  }

  const lines = source.content.replace(/\r\n/g, "\n").split("\n");
  const sections: PrdAstSection[] = [];
  const stack: { id: string; level: number }[] = [];

  let currentSection: PrdAstSection | null = null;
  let detectedTitle = source.title?.trim() || "";
  let sectionIndex = 0;

  function flushCurrentSection() {
    if (!currentSection) return;
    currentSection.content = currentSection.lines.join("\n").trim();
    sections.push(currentSection);
    currentSection = null;
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushCurrentSection();
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();

      if (!detectedTitle && level === 1) {
        detectedTitle = title;
      }

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      const parent = stack.length > 0 ? stack[stack.length - 1] : null;
      sectionIndex += 1;
      const id = createSectionId(sectionIndex, title);

      currentSection = {
        id,
        title,
        level,
        parentId: parent?.id || null,
        content: "",
        lines: [],
      };
      stack.push({ id, level });
      continue;
    }

    if (!currentSection) {
      sectionIndex += 1;
      currentSection = {
        id: createSectionId(sectionIndex, "introduction"),
        title: "Introduction",
        level: 1,
        parentId: null,
        content: "",
        lines: [],
      };
      if (!detectedTitle) {
        detectedTitle = source.title?.trim() || "Untitled PRD";
      }
    }

    currentSection.lines.push(line);
  }

  flushCurrentSection();

  if (sections.length === 0) {
    throw new PrdCompilerError("EMPTY_PRD_STRUCTURE", "Cannot parse any sections from PRD content");
  }

  return {
    id: `prd_${Date.now()}`,
    title: detectedTitle || "Untitled PRD",
    sourceType: source.sourceType || "markdown",
    raw: source.content,
    sections,
  };
}

import type { OutlineNode } from "@/lib/outline/types";
import type { PrdSource } from "@/lib/prd-compiler";

function normalizeLine(line: string): string {
  return line.replace(/\r\n/g, "\n").trim();
}

export function buildPrdSourceFromOutlineNode(node: OutlineNode): PrdSource {
  const markdownBlocks = node.contentBlocks.filter((block) => block.type === "markdown");
  const interactionBlocks = node.contentBlocks.filter((block) => block.type === "interaction");
  const acceptanceBlocks = node.contentBlocks.filter((block) => block.type === "acceptance");

  const lines: string[] = [`# ${node.title}`];

  if (markdownBlocks.length > 0) {
    lines.push("## 页面说明");
    markdownBlocks.forEach((block) => {
      const content = normalizeLine(block.content);
      if (content) lines.push(content);
    });
  }

  const interactionRules = interactionBlocks.flatMap((block) => block.rules);
  if (interactionRules.length > 0) {
    lines.push("## 交互");
    interactionRules.forEach((rule) => {
      const trigger = normalizeLine(rule.trigger) || "触发事件";
      const response = normalizeLine(rule.response) || "状态变化";
      lines.push(`- ${trigger} -> ${response}`);
    });
  }

  const acceptanceCriteria = acceptanceBlocks.flatMap((block) => block.criteria);
  if (acceptanceCriteria.length > 0) {
    lines.push("## 验收标准");
    acceptanceCriteria.forEach((criterion) => {
      const description = normalizeLine(criterion.description);
      if (description) lines.push(`- ${description}`);
    });
  }

  if (lines.length === 1) {
    lines.push("## 页面说明");
    lines.push("- 暂无详细 PRD 内容。");
  }

  return {
    projectId: node.id,
    title: node.title,
    sourceType: "markdown",
    content: lines.join("\n\n"),
  };
}

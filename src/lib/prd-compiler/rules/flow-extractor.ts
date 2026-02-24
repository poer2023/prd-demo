import type { ComponentNode, InteractionAction, InteractionSpec } from "@/lib/protospec";
import type { NormalizedPrdPage } from "../types";

function flattenNodes(root: ComponentNode): ComponentNode[] {
  const nodes: ComponentNode[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    nodes.push(current);
    for (let i = current.children.length - 1; i >= 0; i -= 1) {
      stack.push(current.children[i]);
    }
  }
  return nodes;
}

function getSearchableNodeText(node: ComponentNode): string {
  const propValues = Object.values(node.props)
    .filter((value) => typeof value === "string" || typeof value === "number")
    .map((value) => String(value));
  return `${node.id} ${node.name ?? ""} ${propValues.join(" ")}`.toLowerCase();
}

function extractKeywords(raw: string): string[] {
  const normalized = raw.toLowerCase();
  const keywords = new Set<string>();
  const patterns = [
    /(?:点击|click|tap)\s*([^\s\-=>→,，。；;:：]+)/i,
    /(?:输入|填写|type)\s*([^\s\-=>→,，。；;:：]+)/i,
  ];

  for (const pattern of patterns) {
    const matched = raw.match(pattern);
    if (matched?.[1]) keywords.add(matched[1].toLowerCase());
  }

  const lexicon = [
    "submit",
    "提交",
    "save",
    "保存",
    "back",
    "返回",
    "search",
    "搜索",
    "confirm",
    "确认",
    "cancel",
    "取消",
    "delete",
    "删除",
    "edit",
    "编辑",
  ];
  for (const item of lexicon) {
    if (normalized.includes(item)) keywords.add(item);
  }

  return [...keywords];
}

function baseTypeScore(type: ComponentNode["type"]): number {
  if (type === "Button") return 6;
  if (type === "Input" || type === "Textarea" || type === "Select" || type === "Checkbox") return 5;
  if (type === "ListItem") return 4;
  if (type === "Card" || type === "List") return 2;
  if (type === "Page" || type === "Container" || type === "Section") return 0;
  return 1;
}

function intentTypeBoost(type: ComponentNode["type"], event: string): number {
  const normalized = event.toLowerCase();
  if (/(?:输入|填写|type)/i.test(event) && (type === "Input" || type === "Textarea" || type === "Select")) {
    return 4;
  }
  if (/(?:点击|click|tap|提交|submit)/i.test(event) && type === "Button") {
    return 4;
  }
  if ((normalized.includes("row") || normalized.includes("行")) && type === "ListItem") {
    return 3;
  }
  return 0;
}

function inferTargetNodeId(raw: string, event: string, root: ComponentNode): string {
  const allNodes = flattenNodes(root);
  const keywords = extractKeywords(`${raw} ${event}`);
  const candidates = allNodes.filter((node) => node.type !== "Page" && node.type !== "Container" && node.type !== "Section");

  if (keywords.length === 0) {
    const fallbackButton = candidates.find((node) => node.type === "Button");
    return fallbackButton?.id ?? root.id;
  }

  let best: { nodeId: string; score: number } | null = null;
  for (const node of candidates) {
    const searchable = getSearchableNodeText(node);
    let score = baseTypeScore(node.type) + intentTypeBoost(node.type, event);
    for (const keyword of keywords) {
      if (!keyword.trim()) continue;
      if (searchable === keyword) score += 10;
      else if (searchable.includes(keyword)) score += 6;
    }
    if (!best || score > best.score) {
      best = { nodeId: node.id, score };
    }
  }

  if (best && best.score > 0) return best.nodeId;
  return root.id;
}

export function buildInteractions(page: NormalizedPrdPage, pageSlug: string, rootNode: ComponentNode): InteractionSpec[] {
  const interactions: InteractionSpec[] = [];

  page.interactions.forEach((raw, index) => {
    const interactionId = `${pageSlug}_int_${index + 1}`;
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
      targetNodeId: inferTargetNodeId(raw, event, rootNode),
      actions: [action],
    });
  });

  return interactions;
}

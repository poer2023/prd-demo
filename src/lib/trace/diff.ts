import type { ComponentNode, ProtoSpec } from "@/lib/protospec";
import type { SpecDiffResult } from "./types";

function collectNodeIds(node: ComponentNode, ids: Set<string>) {
  ids.add(node.id);
  for (const child of node.children) {
    collectNodeIds(child, ids);
  }
}

function setDiff(previous: Set<string>, next: Set<string>) {
  const added: string[] = [];
  const removed: string[] = [];

  for (const item of next) {
    if (!previous.has(item)) added.push(item);
  }
  for (const item of previous) {
    if (!next.has(item)) removed.push(item);
  }

  return { added, removed };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`).join(",")}}`;
}

function collectNodeMap(node: ComponentNode, map: Map<string, ComponentNode>) {
  map.set(node.id, node);
  for (const child of node.children) {
    collectNodeMap(child, map);
  }
}

function pageFingerprint(spec: ProtoSpec, pageId: string): string | null {
  const page = spec.pages.find((item) => item.id === pageId);
  if (!page) return null;

  return stableStringify({
    slug: page.slug,
    title: page.title,
    summary: page.summary,
    acceptanceCriteria: page.acceptanceCriteria,
  });
}

function nodeFingerprint(node: ComponentNode): string {
  return stableStringify({
    type: node.type,
    name: node.name,
    props: node.props,
    children: node.children.map((child) => child.id),
  });
}

function interactionFingerprint(spec: ProtoSpec, interactionId: string): string | null {
  for (const page of spec.pages) {
    const interaction = page.interactions.find((item) => item.id === interactionId);
    if (!interaction) continue;

    return stableStringify({
      name: interaction.name,
      event: interaction.event,
      targetNodeId: interaction.targetNodeId,
      guard: interaction.guard,
      actions: interaction.actions,
    });
  }
  return null;
}

function modifiedIdsFromFingerprints(
  ids: Set<string>,
  previousFingerprint: (id: string) => string | null,
  nextFingerprint: (id: string) => string | null
): string[] {
  const modified: string[] = [];
  for (const id of ids) {
    const before = previousFingerprint(id);
    const after = nextFingerprint(id);
    if (!before || !after) continue;
    if (before !== after) modified.push(id);
  }
  return modified;
}

export function computeSpecDiff(previous: ProtoSpec | null, next: ProtoSpec): SpecDiffResult {
  if (!previous) {
    const allPageIds = next.pages.map((page) => page.id);
    const allNodeIds = new Set<string>();
    const allInteractionIds: string[] = [];

    for (const page of next.pages) {
      collectNodeIds(page.root, allNodeIds);
      allInteractionIds.push(...page.interactions.map((interaction) => interaction.id));
    }

    return {
      hasChanges: allPageIds.length > 0,
      summary: {
        pagesAdded: allPageIds.length,
        pagesRemoved: 0,
        pagesModified: 0,
        nodesAdded: allNodeIds.size,
        nodesRemoved: 0,
        nodesModified: 0,
        interactionsAdded: allInteractionIds.length,
        interactionsRemoved: 0,
        interactionsModified: 0,
      },
      pageIdsAdded: allPageIds,
      pageIdsRemoved: [],
      pageIdsModified: [],
      nodeIdsAdded: [...allNodeIds],
      nodeIdsRemoved: [],
      nodeIdsModified: [],
      interactionIdsAdded: allInteractionIds,
      interactionIdsRemoved: [],
      interactionIdsModified: [],
      previousSpecId: null,
      nextSpecId: next.id,
    };
  }

  const previousPageIds = new Set(previous.pages.map((page) => page.id));
  const nextPageIds = new Set(next.pages.map((page) => page.id));
  const pageDiff = setDiff(previousPageIds, nextPageIds);

  const previousNodeIds = new Set<string>();
  const nextNodeIds = new Set<string>();
  const previousNodeMap = new Map<string, ComponentNode>();
  const nextNodeMap = new Map<string, ComponentNode>();
  previous.pages.forEach((page) => collectNodeIds(page.root, previousNodeIds));
  next.pages.forEach((page) => collectNodeIds(page.root, nextNodeIds));
  previous.pages.forEach((page) => collectNodeMap(page.root, previousNodeMap));
  next.pages.forEach((page) => collectNodeMap(page.root, nextNodeMap));
  const nodeDiff = setDiff(previousNodeIds, nextNodeIds);

  const previousInteractionIds = new Set<string>();
  const nextInteractionIds = new Set<string>();
  previous.pages.forEach((page) => page.interactions.forEach((interaction) => previousInteractionIds.add(interaction.id)));
  next.pages.forEach((page) => page.interactions.forEach((interaction) => nextInteractionIds.add(interaction.id)));
  const interactionDiff = setDiff(previousInteractionIds, nextInteractionIds);

  const sharedPageIds = new Set([...previousPageIds].filter((pageId) => nextPageIds.has(pageId)));
  const sharedNodeIds = new Set([...previousNodeIds].filter((nodeId) => nextNodeIds.has(nodeId)));
  const sharedInteractionIds = new Set(
    [...previousInteractionIds].filter((interactionId) => nextInteractionIds.has(interactionId))
  );

  const pageIdsModified = modifiedIdsFromFingerprints(
    sharedPageIds,
    (pageId) => pageFingerprint(previous, pageId),
    (pageId) => pageFingerprint(next, pageId)
  );
  const nodeIdsModified = modifiedIdsFromFingerprints(
    sharedNodeIds,
    (nodeId) => {
      const node = previousNodeMap.get(nodeId);
      return node ? nodeFingerprint(node) : null;
    },
    (nodeId) => {
      const node = nextNodeMap.get(nodeId);
      return node ? nodeFingerprint(node) : null;
    }
  );
  const interactionIdsModified = modifiedIdsFromFingerprints(
    sharedInteractionIds,
    (interactionId) => interactionFingerprint(previous, interactionId),
    (interactionId) => interactionFingerprint(next, interactionId)
  );

  const summary = {
    pagesAdded: pageDiff.added.length,
    pagesRemoved: pageDiff.removed.length,
    pagesModified: pageIdsModified.length,
    nodesAdded: nodeDiff.added.length,
    nodesRemoved: nodeDiff.removed.length,
    nodesModified: nodeIdsModified.length,
    interactionsAdded: interactionDiff.added.length,
    interactionsRemoved: interactionDiff.removed.length,
    interactionsModified: interactionIdsModified.length,
  };

  return {
    hasChanges:
      summary.pagesAdded > 0 ||
      summary.pagesRemoved > 0 ||
      summary.pagesModified > 0 ||
      summary.nodesAdded > 0 ||
      summary.nodesRemoved > 0 ||
      summary.nodesModified > 0 ||
      summary.interactionsAdded > 0 ||
      summary.interactionsRemoved > 0 ||
      summary.interactionsModified > 0,
    summary,
    pageIdsAdded: pageDiff.added,
    pageIdsRemoved: pageDiff.removed,
    pageIdsModified,
    nodeIdsAdded: nodeDiff.added,
    nodeIdsRemoved: nodeDiff.removed,
    nodeIdsModified,
    interactionIdsAdded: interactionDiff.added,
    interactionIdsRemoved: interactionDiff.removed,
    interactionIdsModified,
    previousSpecId: previous.id,
    nextSpecId: next.id,
  };
}

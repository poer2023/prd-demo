import type { ComponentNode, ComponentType, PageSpec } from "@/lib/protospec";
import type { RuntimeMergeOptions, RuntimeRenderOptions, RuntimeRenderResult, RuntimeWarning } from "./types";

export const RUNTIME_COMPONENT_WHITELIST: ReadonlySet<ComponentType> = new Set<ComponentType>([
  "Page",
  "Container",
  "Section",
  "Heading",
  "Text",
  "Button",
  "Input",
  "Select",
  "Textarea",
  "Checkbox",
  "RadioGroup",
  "List",
  "ListItem",
  "Card",
  "Image",
  "Modal",
]);

function sanitizeNode(
  node: ComponentNode,
  warnings: RuntimeWarning[],
  allowedComponents: ReadonlySet<ComponentType>
): ComponentNode {
  const children = node.children.map((child) => sanitizeNode(child, warnings, allowedComponents));
  if (allowedComponents.has(node.type)) {
    return { ...node, children };
  }

  warnings.push({
    code: "UNSUPPORTED_COMPONENT_TYPE",
    message: `Component type "${node.type}" is not allowed at runtime. Downgraded to Container.`,
    nodeId: node.id,
  });

  return {
    ...node,
    type: "Container",
    children,
  };
}

export function renderRuntimePage(page: PageSpec, options: RuntimeRenderOptions = {}): RuntimeRenderResult {
  const warnings: RuntimeWarning[] = [];
  const allowedComponents = options.allowedComponents ?? RUNTIME_COMPONENT_WHITELIST;
  const root = sanitizeNode(page.root, warnings, allowedComponents);
  return { page, root, warnings };
}

function mergeNode(
  previousNode: ComponentNode | null,
  nextNode: ComponentNode,
  lockedNodeIds: ReadonlySet<string>
): ComponentNode {
  if (previousNode && lockedNodeIds.has(nextNode.id)) {
    return previousNode;
  }

  const previousChildrenById = new Map<string, ComponentNode>();
  if (previousNode) {
    for (const child of previousNode.children) {
      previousChildrenById.set(child.id, child);
    }
  }

  const mergedChildren = nextNode.children.map((child) =>
    mergeNode(previousChildrenById.get(child.id) || null, child, lockedNodeIds)
  );

  if (previousNode) {
    for (const previousChild of previousNode.children) {
      if (lockedNodeIds.has(previousChild.id) && !nextNode.children.some((child) => child.id === previousChild.id)) {
        mergedChildren.push(previousChild);
      }
    }
  }

  return {
    ...nextNode,
    children: mergedChildren,
  };
}

export function mergeLockedNodes(
  previousPage: PageSpec,
  regeneratedPage: PageSpec,
  options: RuntimeMergeOptions
): PageSpec {
  return {
    ...regeneratedPage,
    root: mergeNode(previousPage.root, regeneratedPage.root, options.lockedNodeIds),
  };
}

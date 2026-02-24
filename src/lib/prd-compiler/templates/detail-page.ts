import type { ComponentNode } from "@/lib/protospec";
import type { NormalizedPrdPage } from "../types";

function createComponentNode(
  id: string,
  type: ComponentNode["type"],
  name: string,
  props: ComponentNode["props"],
  children: ComponentNode[] = []
): ComponentNode {
  return { id, type, name, props, children };
}

export function buildDetailPageRoot(rootId: string, page: NormalizedPrdPage): ComponentNode {
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

  return createComponentNode(rootId, "Page", page.title, { layout: "single-column" }, [heading, summary]);
}

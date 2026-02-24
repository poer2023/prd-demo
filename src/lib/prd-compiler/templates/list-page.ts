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

export function buildListPageRoot(rootId: string, page: NormalizedPrdPage): ComponentNode {
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
  const listItems = page.requirements.slice(0, 5).map((item, index) =>
    createComponentNode(`${rootId}_list_item_${index + 1}`, "ListItem", `item${index + 1}`, { text: item })
  );
  const list = createComponentNode(`${rootId}_list`, "List", "mainList", { ordered: false }, listItems);

  return createComponentNode(rootId, "Page", page.title, { layout: "single-column" }, [heading, summary, list]);
}

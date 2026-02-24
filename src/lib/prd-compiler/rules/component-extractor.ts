import type { ComponentNode } from "@/lib/protospec";
import type { CompilerWarning, NormalizedPrdPage, PageSemanticSignals } from "../types";
import { buildDetailPageRoot } from "../templates/detail-page";
import { buildFormPageRoot } from "../templates/form-page";
import { buildListPageRoot } from "../templates/list-page";

export function buildRootComponent(
  page: NormalizedPrdPage,
  pageSlug: string,
  signals: PageSemanticSignals,
  warnings: CompilerWarning[]
): ComponentNode {
  const rootId = `${pageSlug}_root`;

  if (signals.template === "form") {
    return buildFormPageRoot(rootId, page, signals.inferredFields, warnings);
  }
  if (signals.template === "list") {
    return buildListPageRoot(rootId, page);
  }

  return buildDetailPageRoot(rootId, page);
}

import type { ComponentNode } from "@/lib/protospec";
import type { CompilerWarning, NormalizedPrdPage } from "../types";

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "page"
  );
}

function createComponentNode(
  id: string,
  type: ComponentNode["type"],
  name: string,
  props: ComponentNode["props"],
  children: ComponentNode[] = []
): ComponentNode {
  return { id, type, name, props, children };
}

export function buildFormPageRoot(
  rootId: string,
  page: NormalizedPrdPage,
  inferredFields: string[],
  warnings: CompilerWarning[]
): ComponentNode {
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

  const formFields = inferredFields.length > 0 ? inferredFields : ["topic", "description", "submit"];
  if (inferredFields.length === 0) {
    warnings.push({
      code: "FORM_FIELD_INFERRED_DEFAULT",
      message: `Page "${page.title}" has form-like requirements but no explicit fields. Applied default fields.`,
    });
  }

  const formChildren = formFields.map((fieldName, index) =>
    createComponentNode(
      `${rootId}_field_${index + 1}`,
      /submit|提交/i.test(fieldName) ? "Button" : "Input",
      fieldName,
      /submit|提交/i.test(fieldName)
        ? { label: fieldName, role: "submit" }
        : { label: fieldName, name: slugify(fieldName), placeholder: `Enter ${fieldName}` }
    )
  );

  const form = createComponentNode(
    `${rootId}_form`,
    "Container",
    "formContainer",
    { role: "form", gap: "md" },
    formChildren
  );

  return createComponentNode(rootId, "Page", page.title, { layout: "single-column" }, [heading, summary, form]);
}

import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_DESIGN_TOKENS, type PageSpec } from "@/lib/protospec";
import { compileTokensToCssVariables, mergeLockedNodes } from "@/lib/runtime";

function createPage(summaryText: string): PageSpec {
  return {
    id: "page_1",
    slug: "page-1",
    title: "Page 1",
    summary: summaryText,
    root: {
      id: "root",
      type: "Page",
      name: "root",
      props: { layout: "single-column" },
      children: [
        {
          id: "summary",
          type: "Text",
          name: "summary",
          props: { text: summaryText },
          children: [],
        },
      ],
    },
    interactions: [],
    acceptanceCriteria: [],
  };
}

test("mergeLockedNodes keeps locked subtree from previous page", () => {
  const previous = createPage("old summary");
  const regenerated = createPage("new summary");
  const merged = mergeLockedNodes(previous, regenerated, {
    lockedNodeIds: new Set(["summary"]),
  });

  const summaryNode = merged.root.children.find((node) => node.id === "summary");
  assert.ok(summaryNode);
  assert.equal(summaryNode.props.text, "old summary");
});

test("compileTokensToCssVariables applies theme and overrides", () => {
  const vars = compileTokensToCssVariables(DEFAULT_DESIGN_TOKENS, {
    themeMode: "dark",
    overrides: {
      color: {
        primary: "#123456",
      },
    },
  });

  assert.equal(vars["--proto-color-primary"], "#123456");
  assert.equal(vars["--proto-color-background"], "#0B1220");
});

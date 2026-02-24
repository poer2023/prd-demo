"use client";

import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { ComponentNode } from "@/lib/protospec";
import { compilePrdToProtoSpec } from "@/lib/prd-compiler";
import {
  buildPrdSourceFromOutlineNode,
  compileTokensToCssVariables,
  renderRuntimePage,
} from "@/lib/runtime";
import type { OutlineNode } from "@/lib/outline/types";

interface RuntimePrototypeViewProps {
  node: OutlineNode;
  mode: "full" | "thumbnail";
}

function asString(value: unknown, fallback: string = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function toStyleVars(vars: Record<string, string>): CSSProperties {
  return Object.entries(vars).reduce<CSSProperties>((acc, [key, value]) => {
    (acc as Record<string, string>)[key] = value;
    return acc;
  }, {});
}

function renderNode(node: ComponentNode): ReactNode {
  const children = node.children.map((child) => <div key={child.id}>{renderNode(child)}</div>);

  switch (node.type) {
    case "Page":
    case "Container":
    case "Section":
      return <div className="space-y-3">{children}</div>;
    case "Heading": {
      const level = Math.max(1, Math.min(6, asNumber(node.props.level, 2)));
      const text = asString(node.props.text, asString(node.props.children, "Heading"));
      if (level === 1) return <h1 className="text-2xl font-semibold">{text}</h1>;
      if (level === 2) return <h2 className="text-xl font-semibold">{text}</h2>;
      if (level === 3) return <h3 className="text-lg font-semibold">{text}</h3>;
      if (level === 4) return <h4 className="text-base font-semibold">{text}</h4>;
      if (level === 5) return <h5 className="text-sm font-semibold">{text}</h5>;
      return <h6 className="text-sm font-semibold">{text}</h6>;
    }
    case "Text":
      return <p className="text-sm leading-6 text-[var(--proto-color-text)]">{asString(node.props.text)}</p>;
    case "Button":
      return (
        <button
          type={asString(node.props.role) === "submit" ? "submit" : "button"}
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--proto-color-primary)" }}
        >
          {asString(node.props.label, asString(node.props.text, "Button"))}
        </button>
      );
    case "Input":
      return (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--proto-color-text)]">{asString(node.props.label, "Input")}</span>
          <input
            name={asString(node.props.name)}
            placeholder={asString(node.props.placeholder)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--proto-color-border)",
              backgroundColor: "var(--proto-color-surface)",
              color: "var(--proto-color-text)",
            }}
            readOnly
          />
        </label>
      );
    case "Textarea":
      return (
        <textarea
          className="min-h-24 w-full rounded-md border px-3 py-2 text-sm outline-none"
          style={{
            borderColor: "var(--proto-color-border)",
            backgroundColor: "var(--proto-color-surface)",
            color: "var(--proto-color-text)",
          }}
          placeholder={asString(node.props.placeholder)}
          readOnly
        />
      );
    case "Checkbox":
      return (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={asBoolean(node.props.checked, false)} readOnly />
          <span>{asString(node.props.label, "Checkbox")}</span>
        </label>
      );
    case "RadioGroup":
      return <div className="text-sm text-[var(--proto-color-muted-text)]">RadioGroup</div>;
    case "Select":
      return (
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          style={{
            borderColor: "var(--proto-color-border)",
            backgroundColor: "var(--proto-color-surface)",
            color: "var(--proto-color-text)",
          }}
          disabled
        >
          <option>{asString(node.props.placeholder, "Select")}</option>
        </select>
      );
    case "List":
      return asBoolean(node.props.ordered, false) ? (
        <ol className="list-decimal space-y-1 pl-5">{children}</ol>
      ) : (
        <ul className="list-disc space-y-1 pl-5">{children}</ul>
      );
    case "ListItem":
      return <li className="text-sm">{asString(node.props.text, "List item")}</li>;
    case "Card":
      return (
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: "var(--proto-color-border)",
            backgroundColor: "var(--proto-color-surface)",
          }}
        >
          {children}
        </div>
      );
    case "Image":
      return (
        <div className="rounded-md border border-dashed p-4 text-sm text-[var(--proto-color-muted-text)]">
          [Image] {asString(node.props.alt, "image")}
        </div>
      );
    case "Modal":
      return (
        <div className="rounded-lg border p-4 shadow-md" style={{ borderColor: "var(--proto-color-border)" }}>
          {children}
        </div>
      );
    default:
      return <div className="text-sm text-red-500">Unsupported component: {node.type}</div>;
  }
}

export function RuntimePrototypeView({ node, mode }: RuntimePrototypeViewProps) {
  const result = useMemo(() => {
    try {
      const source = buildPrdSourceFromOutlineNode(node);
      const output = compilePrdToProtoSpec(source);
      const page = output.spec.pages[0];
      if (!page) {
        return { error: "No page generated from current node." };
      }

      const runtime = renderRuntimePage(page);
      const cssVariables = compileTokensToCssVariables(output.spec.tokens);
      return { output, runtime, cssVariables };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Runtime compilation failed",
      };
    }
  }, [node]);

  if ("error" in result) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="max-w-lg rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Runtime compile failed: {result.error}
        </div>
      </div>
    );
  }

  const { output, runtime, cssVariables } = result;
  const containerStyle = toStyleVars(cssVariables);
  const content = (
    <div
      className="space-y-4 rounded-xl border p-4"
      style={{
        ...containerStyle,
        borderColor: "var(--proto-color-border)",
        backgroundColor: "var(--proto-color-background)",
        color: "var(--proto-color-text)",
        fontFamily: "var(--proto-typography-font-family)",
      }}
    >
      {runtime.warnings.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Runtime warnings: {runtime.warnings.map((warning) => warning.code).join(", ")}
        </div>
      )}
      {renderNode(runtime.root)}
      <div className="rounded-md border border-[var(--proto-color-border)] bg-[var(--proto-color-surface)] p-3 text-xs text-[var(--proto-color-muted-text)]">
        confidence={output.review.confidence} · needsHumanReview=
        {output.review.needsHumanReview ? "true" : "false"}
      </div>
    </div>
  );

  if (mode === "thumbnail") {
    return (
      <div className="h-full p-4 overflow-hidden">
        <div className="h-full border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--background)]">
          <div className="px-3 py-2 bg-[var(--nav-hover)] border-b border-[var(--border-color)]">
            <span className="text-xs font-medium text-[var(--foreground)]">Runtime · {node.title}</span>
          </div>
          <div className="relative h-[calc(100%-36px)] overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none origin-top-left"
              style={{ transform: "scale(0.6)", width: "166.67%", height: "166.67%" }}
            >
              <div className="p-4">{content}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-[var(--background)]">
      <div className="min-h-full p-4">{content}</div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { buildReplayPlan, runReplayPlan } from "@/lib/replay";
import { compilePrdToProtoSpec, type CompilerOutput } from "@/lib/prd-compiler";
import type { ComponentNode, PageSpec, ProtoSpec } from "@/lib/protospec";
import {
  buildPrdSourceFromOutlineNode,
  compileTokensToCssVariables,
  mergeLockedNodes,
  renderRuntimePage,
} from "@/lib/runtime";
import { buildTraceMap, computeSpecDiff } from "@/lib/trace";
import type { OutlineNode } from "@/lib/outline/types";

interface RuntimePrototypeViewProps {
  node: OutlineNode;
  mode: "full" | "thumbnail";
}

interface RuntimeSession {
  output: CompilerOutput;
  spec: ProtoSpec;
  page: PageSpec;
  runtimeWarnings: string[];
  generatedAt: string;
  diffSummary: ReturnType<typeof computeSpecDiff>;
  traceMap: ReturnType<typeof buildTraceMap>;
}

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;

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

function renderNode(
  node: ComponentNode,
  options: {
    selectedNodeId: string | null;
    activeStepNodeId: string | null;
    lockedNodeIds: ReadonlySet<string>;
    onNodeClick: (nodeId: string, toggleLock: boolean) => void;
  }
): ReactNode {
  const isSelected = options.selectedNodeId === node.id;
  const isReplayActive = options.activeStepNodeId === node.id;
  const isLocked = options.lockedNodeIds.has(node.id);

  const frameClass = [
    "rounded-md transition",
    isSelected ? "ring-2 ring-blue-500" : "ring-1 ring-transparent",
    isReplayActive ? "bg-amber-50 dark:bg-amber-900/20" : "",
    isLocked ? "outline outline-1 outline-offset-2 outline-emerald-500" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const children = node.children.map((child) => (
    <div key={child.id}>{renderNode(child, options)}</div>
  ));

  let body: ReactNode;
  switch (node.type) {
    case "Page":
    case "Container":
    case "Section":
      body = <div className="space-y-3">{children}</div>;
      break;
    case "Heading": {
      const level = Math.max(1, Math.min(6, asNumber(node.props.level, 2)));
      const text = asString(node.props.text, asString(node.props.children, "Heading"));
      if (level === 1) body = <h1 className="text-2xl font-semibold">{text}</h1>;
      else if (level === 2) body = <h2 className="text-xl font-semibold">{text}</h2>;
      else if (level === 3) body = <h3 className="text-lg font-semibold">{text}</h3>;
      else if (level === 4) body = <h4 className="text-base font-semibold">{text}</h4>;
      else if (level === 5) body = <h5 className="text-sm font-semibold">{text}</h5>;
      else body = <h6 className="text-sm font-semibold">{text}</h6>;
      break;
    }
    case "Text":
      body = <p className="text-sm leading-6 text-[var(--proto-color-text)]">{asString(node.props.text)}</p>;
      break;
    case "Button":
      body = (
        <button
          type={asString(node.props.role) === "submit" ? "submit" : "button"}
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--proto-color-primary)" }}
        >
          {asString(node.props.label, asString(node.props.text, "Button"))}
        </button>
      );
      break;
    case "Input":
      body = (
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
      break;
    case "Textarea":
      body = (
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
      break;
    case "Checkbox":
      body = (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={asBoolean(node.props.checked, false)} readOnly />
          <span>{asString(node.props.label, "Checkbox")}</span>
        </label>
      );
      break;
    case "RadioGroup":
      body = <div className="text-sm text-[var(--proto-color-muted-text)]">RadioGroup</div>;
      break;
    case "Select":
      body = (
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
      break;
    case "List":
      body = asBoolean(node.props.ordered, false) ? (
        <ol className="list-decimal space-y-1 pl-5">{children}</ol>
      ) : (
        <ul className="list-disc space-y-1 pl-5">{children}</ul>
      );
      break;
    case "ListItem":
      body = <li className="text-sm">{asString(node.props.text, "List item")}</li>;
      break;
    case "Card":
      body = (
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
      break;
    case "Image":
      body = (
        <div className="rounded-md border border-dashed p-4 text-sm text-[var(--proto-color-muted-text)]">
          [Image] {asString(node.props.alt, "image")}
        </div>
      );
      break;
    case "Modal":
      body = (
        <div className="rounded-lg border p-4 shadow-md" style={{ borderColor: "var(--proto-color-border)" }}>
          {children}
        </div>
      );
      break;
    default:
      body = <div className="text-sm text-red-500">Unsupported component: {node.type}</div>;
      break;
  }

  return (
    <div
      className={frameClass}
      onClick={(event) => {
        event.stopPropagation();
        options.onNodeClick(node.id, event.shiftKey);
      }}
      title={isLocked ? "Locked node (Shift+Click to unlock)" : "Click to focus, Shift+Click to lock"}
    >
      {body}
    </div>
  );
}

export function RuntimePrototypeView({ node, mode }: RuntimePrototypeViewProps) {
  const [session, setSession] = useState<RuntimeSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTraceId, setActiveTraceId] = useState<string | null>(null);
  const [activeInteractionId, setActiveInteractionId] = useState<string | null>(null);
  const [lockedNodeIds, setLockedNodeIds] = useState<Set<string>>(new Set());
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [primaryOverride, setPrimaryOverride] = useState("");
  const [backgroundOverride, setBackgroundOverride] = useState("");
  const [replayLogs, setReplayLogs] = useState<string[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);
  const [activeStepNodeId, setActiveStepNodeId] = useState<string | null>(null);
  const replayAbortRef = useRef<AbortController | null>(null);

  const buildSession = useCallback(
    (previousSpec: ProtoSpec | null, previousPage: PageSpec | null, applyLockedNodes: boolean): RuntimeSession => {
      const source = buildPrdSourceFromOutlineNode(node);
      const compiled = compilePrdToProtoSpec(source);
      const firstPage = compiled.spec.pages[0];
      if (!firstPage) {
        throw new Error("No page generated from current node.");
      }

      let page = firstPage;
      if (applyLockedNodes && previousPage && lockedNodeIds.size > 0) {
        page = mergeLockedNodes(previousPage, firstPage, { lockedNodeIds });
      }

      const spec: ProtoSpec = {
        ...compiled.spec,
        pages: [page, ...compiled.spec.pages.slice(1)],
      };
      const runtimeResult = renderRuntimePage(page);
      const traceMap = buildTraceMap(spec);
      const diffSummary = computeSpecDiff(previousSpec, spec);

      return {
        output: { ...compiled, spec },
        spec,
        page,
        runtimeWarnings: runtimeResult.warnings.map((warning) => warning.code),
        generatedAt: new Date().toISOString(),
        diffSummary,
        traceMap,
      };
    },
    [lockedNodeIds, node]
  );

  useEffect(() => {
    replayAbortRef.current?.abort();
    setSelectedNodeId(null);
    setActiveTraceId(null);
    setActiveInteractionId(null);
    setLockedNodeIds(new Set());
    setReplayLogs([]);
    setActiveStepNodeId(null);
    setIsReplaying(false);

    try {
      setSession(buildSession(null, null, false));
      setError(null);
    } catch (buildError) {
      setSession(null);
      setError(buildError instanceof Error ? buildError.message : "Runtime compilation failed");
    }
  }, [buildSession, node.id, node.updatedAt]);

  useEffect(() => {
    return () => {
      replayAbortRef.current?.abort();
    };
  }, []);

  const handleRegenerate = useCallback(() => {
    if (!session) return;
    try {
      const nextSession = buildSession(session.spec, session.page, true);
      setSession(nextSession);
      setError(null);
      setReplayLogs((previous) => [...previous.slice(-12), "Regenerated with lock strategy."]);
    } catch (buildError) {
      setError(buildError instanceof Error ? buildError.message : "Runtime regeneration failed");
    }
  }, [buildSession, session]);

  const handleNodeClick = useCallback((nodeId: string, toggleLock: boolean) => {
    setSelectedNodeId(nodeId);
    if (!toggleLock) return;
    setLockedNodeIds((previous) => {
      const next = new Set(previous);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleTraceClick = useCallback(
    (traceId: string) => {
      if (!session) return;
      const entry = session.traceMap.byRequirementId.get(traceId);
      if (!entry) return;

      setActiveTraceId(traceId);
      const primaryRef = entry.references[0];
      if (primaryRef?.nodeId) {
        setSelectedNodeId(primaryRef.nodeId);
      }
      if (primaryRef?.interactionId) {
        setActiveInteractionId(primaryRef.interactionId);
      }
    },
    [session]
  );

  const handlePlayInteraction = useCallback(
    async (interactionId: string) => {
      if (!session) return;
      const plan = buildReplayPlan(session.page, interactionId);
      if (!plan) return;

      replayAbortRef.current?.abort();
      const controller = new AbortController();
      replayAbortRef.current = controller;

      setActiveInteractionId(interactionId);
      setReplayLogs([`Replay started: ${plan.interactionName}`]);
      setIsReplaying(true);
      setActiveStepNodeId(null);

      try {
        await runReplayPlan(plan, {
          stepDelayMs: 420,
          signal: controller.signal,
          onStep: (step) => {
            setReplayLogs((previous) => [...previous.slice(-15), step.label]);
            if (step.targetNodeId) {
              setActiveStepNodeId(step.targetNodeId);
              setSelectedNodeId(step.targetNodeId);
            }
          },
        });
        setReplayLogs((previous) => [...previous.slice(-15), "Replay completed."]);
      } catch (replayError) {
        const message = replayError instanceof Error ? replayError.message : "Replay interrupted";
        setReplayLogs((previous) => [...previous.slice(-15), message]);
      } finally {
        setIsReplaying(false);
      }
    },
    [session]
  );

  const tokenOverrides = useMemo(() => {
    const colorOverrides: Record<string, string> = {};
    if (HEX_COLOR_REGEX.test(primaryOverride)) colorOverrides.primary = primaryOverride;
    if (HEX_COLOR_REGEX.test(backgroundOverride)) colorOverrides.background = backgroundOverride;
    if (Object.keys(colorOverrides).length === 0) return undefined;
    return { color: colorOverrides };
  }, [backgroundOverride, primaryOverride]);

  const cssVariables = useMemo(() => {
    if (!session) return {};
    return compileTokensToCssVariables(session.spec.tokens, {
      themeMode,
      overrides: tokenOverrides,
    });
  }, [session, themeMode, tokenOverrides]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="max-w-lg rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Runtime compile failed: {error}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-sm text-[var(--text-muted)]">
        Runtime session initializing...
      </div>
    );
  }

  const renderOptions = {
    selectedNodeId,
    activeStepNodeId,
    lockedNodeIds,
    onNodeClick: handleNodeClick,
  };

  const runtimeContent = (
    <div
      data-testid="runtime-canvas"
      className="space-y-4 rounded-xl border p-4"
      style={{
        ...toStyleVars(cssVariables),
        borderColor: "var(--proto-color-border)",
        backgroundColor: "var(--proto-color-background)",
        color: "var(--proto-color-text)",
        fontFamily: "var(--proto-typography-font-family)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--proto-color-muted-text)]">
        <span>generatedAt={session.generatedAt}</span>
        <span>confidence={session.output.review.confidence}</span>
        <span>needsHumanReview={session.output.review.needsHumanReview ? "true" : "false"}</span>
      </div>

      {session.runtimeWarnings.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Runtime warnings: {session.runtimeWarnings.join(", ")}
        </div>
      )}

      {renderNode(session.page.root, renderOptions)}
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
              <div className="p-4">{runtimeContent}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="runtime-prototype-view" className="h-full w-full overflow-auto bg-[var(--background)]">
      <div className="grid min-h-full grid-cols-1 gap-4 p-4 xl:grid-cols-[320px,1fr]">
        <aside data-testid="runtime-controls" className="space-y-3 rounded-xl border border-[var(--border-color)] bg-[var(--nav-hover)] p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-[var(--foreground)]">Runtime Controls</h4>
            <button
              onClick={handleRegenerate}
              className="rounded-md bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)]"
            >
              Regenerate
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setThemeMode("light")}
              className={`rounded-md px-2 py-1 ${themeMode === "light" ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
            >
              Light
            </button>
            <button
              onClick={() => setThemeMode("dark")}
              className={`rounded-md px-2 py-1 ${themeMode === "dark" ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
            >
              Dark
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[var(--text-muted)]">Primary Override</label>
            <input
              value={primaryOverride}
              onChange={(event) => setPrimaryOverride(event.target.value)}
              placeholder="#2563EB"
              className="w-full rounded-md border px-2 py-1 text-xs"
            />
            <label className="text-xs text-[var(--text-muted)]">Background Override</label>
            <input
              value={backgroundOverride}
              onChange={(event) => setBackgroundOverride(event.target.value)}
              placeholder="#F8FAFC"
              className="w-full rounded-md border px-2 py-1 text-xs"
            />
          </div>

          <div data-testid="runtime-spec-diff" className="rounded-md border bg-white p-2 text-xs">
            <div className="mb-1 font-medium">Locked Nodes</div>
            {lockedNodeIds.size === 0 ? (
              <div className="text-[var(--text-muted)]">Shift+Click node to lock.</div>
            ) : (
              <div className="space-y-1">
                {[...lockedNodeIds].map((nodeId) => (
                  <div key={nodeId} className="truncate text-[var(--foreground)]">
                    {nodeId}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div data-testid="runtime-traces" className="rounded-md border bg-white p-2 text-xs">
            <div className="mb-1 font-medium">Spec Diff</div>
            <div className="grid grid-cols-2 gap-1">
              <span>pages +{session.diffSummary.summary.pagesAdded}</span>
              <span>pages -{session.diffSummary.summary.pagesRemoved}</span>
              <span>pages ~{session.diffSummary.summary.pagesModified}</span>
              <span>nodes +{session.diffSummary.summary.nodesAdded}</span>
              <span>nodes -{session.diffSummary.summary.nodesRemoved}</span>
              <span>nodes ~{session.diffSummary.summary.nodesModified}</span>
              <span>int +{session.diffSummary.summary.interactionsAdded}</span>
              <span>int -{session.diffSummary.summary.interactionsRemoved}</span>
              <span>int ~{session.diffSummary.summary.interactionsModified}</span>
            </div>
          </div>

          <div data-testid="runtime-replay" className="rounded-md border bg-white p-2 text-xs">
            <div className="mb-1 font-medium">PRD Traces</div>
            <div className="max-h-44 space-y-1 overflow-auto">
              {session.traceMap.entries.map((entry) => (
                <button
                  key={entry.requirementId}
                  onClick={() => handleTraceClick(entry.requirementId)}
                  className={`w-full rounded px-2 py-1 text-left ${
                    activeTraceId === entry.requirementId ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                  }`}
                  title={entry.text}
                >
                  <div className="truncate font-medium">{entry.requirementId}</div>
                  <div className="truncate text-[11px]">{entry.text}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border bg-white p-2 text-xs">
            <div className="mb-1 font-medium">Interaction Replay</div>
            <div className="space-y-1">
              {session.page.interactions.map((interaction) => (
                <div key={interaction.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{interaction.name}</span>
                  <button
                    onClick={() => void handlePlayInteraction(interaction.id)}
                    disabled={isReplaying}
                    className={`rounded px-2 py-1 ${
                      activeInteractionId === interaction.id ? "bg-blue-500 text-white" : "bg-gray-100"
                    } ${isReplaying ? "opacity-60" : ""}`}
                  >
                    {isReplaying && activeInteractionId === interaction.id ? "Playing" : "Play"}
                  </button>
                </div>
              ))}
            </div>
            {replayLogs.length > 0 && (
              <div className="mt-2 max-h-28 overflow-auto rounded border bg-gray-50 p-2">
                {replayLogs.map((log, index) => (
                  <div key={`${log}-${index}`} className="truncate">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div>{runtimeContent}</div>
      </div>
    </div>
  );
}

import type { ProtoSpec, TraceReference } from "@/lib/protospec";

export interface TraceMapEntry {
  requirementId: string;
  text: string;
  references: TraceReference[];
}

export interface TraceMapIndex {
  specId: string;
  entries: TraceMapEntry[];
  byRequirementId: Map<string, TraceMapEntry>;
  byNodeId: Map<string, TraceMapEntry[]>;
  byInteractionId: Map<string, TraceMapEntry[]>;
}

export interface SpecDiffSummary {
  pagesAdded: number;
  pagesRemoved: number;
  pagesModified: number;
  nodesAdded: number;
  nodesRemoved: number;
  nodesModified: number;
  interactionsAdded: number;
  interactionsRemoved: number;
  interactionsModified: number;
}

export interface SpecDiffResult {
  hasChanges: boolean;
  summary: SpecDiffSummary;
  pageIdsAdded: string[];
  pageIdsRemoved: string[];
  pageIdsModified: string[];
  nodeIdsAdded: string[];
  nodeIdsRemoved: string[];
  nodeIdsModified: string[];
  interactionIdsAdded: string[];
  interactionIdsRemoved: string[];
  interactionIdsModified: string[];
  previousSpecId: string | null;
  nextSpecId: string;
}

export interface TraceViewState {
  traceMap: TraceMapIndex;
  diff: SpecDiffResult;
  spec: ProtoSpec;
}

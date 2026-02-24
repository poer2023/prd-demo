import type { ProtoSpec } from "@/lib/protospec";
import type { TraceMapEntry, TraceMapIndex } from "./types";

function pushMapList<K>(map: Map<K, TraceMapEntry[]>, key: K, value: TraceMapEntry) {
  const existing = map.get(key);
  if (existing) {
    existing.push(value);
  } else {
    map.set(key, [value]);
  }
}

export function buildTraceMap(spec: ProtoSpec): TraceMapIndex {
  const entries: TraceMapEntry[] = spec.traces.map((trace) => ({
    requirementId: trace.requirementId,
    text: trace.text,
    references: trace.references,
  }));

  const byRequirementId = new Map<string, TraceMapEntry>();
  const byNodeId = new Map<string, TraceMapEntry[]>();
  const byInteractionId = new Map<string, TraceMapEntry[]>();

  for (const entry of entries) {
    byRequirementId.set(entry.requirementId, entry);
    for (const reference of entry.references) {
      if (reference.nodeId) {
        pushMapList(byNodeId, reference.nodeId, entry);
      }
      if (reference.interactionId) {
        pushMapList(byInteractionId, reference.interactionId, entry);
      }
    }
  }

  return {
    specId: spec.id,
    entries,
    byRequirementId,
    byNodeId,
    byInteractionId,
  };
}

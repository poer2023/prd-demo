import type { ProtoSpec, ProtoSpecValidationIssue } from "@/lib/protospec";

export type QualityGateCheckName = "schema" | "traceability" | "interaction_replay";

export interface QualityGateCheckResult {
  name: QualityGateCheckName;
  passed: boolean;
  details: string[];
  durationMs: number;
}

export interface QualityGateReport {
  passed: boolean;
  specId: string;
  generatedAt: string;
  checks: QualityGateCheckResult[];
}

export interface QualityGateOptions {
  replayStepDelayMs?: number;
}

export interface QualityGateContext {
  spec: ProtoSpec;
  options: Required<QualityGateOptions>;
}

export interface SchemaGateContext extends QualityGateContext {
  issues: ProtoSpecValidationIssue[];
}

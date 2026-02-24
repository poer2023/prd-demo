import { buildReplayPlan, runReplayPlan } from "@/lib/replay";
import { validateProtoSpec } from "@/lib/protospec";
import { buildTraceMap } from "@/lib/trace";
import type {
  QualityGateCheckResult,
  QualityGateContext,
  QualityGateOptions,
  QualityGateReport,
  SchemaGateContext,
} from "./types";

function now() {
  return Date.now();
}

function withTiming(name: QualityGateCheckResult["name"], runner: () => Promise<string[]> | string[]) {
  return async (): Promise<QualityGateCheckResult> => {
    const start = now();
    const details = await runner();
    return {
      name,
      passed: details.length === 0,
      details,
      durationMs: now() - start,
    };
  };
}

function runSchemaGate(context: QualityGateContext): string[] {
  const validation = validateProtoSpec(context.spec);
  const schemaContext: SchemaGateContext = {
    ...context,
    issues: validation.issues,
  };

  return validation.valid
    ? []
    : schemaContext.issues.map((issue) => `${issue.code} @ ${issue.path}: ${issue.message}`);
}

function runTraceabilityGate(context: QualityGateContext): string[] {
  const details: string[] = [];
  const traceMap = buildTraceMap(context.spec);

  for (const page of context.spec.pages) {
    for (const interaction of page.interactions) {
      if (!interaction.targetNodeId) {
        details.push(`interaction ${interaction.id} missing targetNodeId`);
      }
      const interactionTraces = traceMap.byInteractionId.get(interaction.id);
      if (!interactionTraces || interactionTraces.length === 0) {
        details.push(`interaction ${interaction.id} has no trace entry`);
      }
    }
  }

  return details;
}

async function runInteractionReplayGate(context: QualityGateContext): Promise<string[]> {
  const details: string[] = [];

  for (const page of context.spec.pages) {
    for (const interaction of page.interactions) {
      const plan = buildReplayPlan(page, interaction.id);
      if (!plan) {
        details.push(`interaction ${interaction.id} cannot build replay plan`);
        continue;
      }
      try {
        await runReplayPlan(plan, { stepDelayMs: context.options.replayStepDelayMs });
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown replay error";
        details.push(`interaction ${interaction.id} replay failed: ${message}`);
      }
    }
  }

  return details;
}

export async function runQualityGate(spec: QualityGateContext["spec"], options: QualityGateOptions = {}): Promise<QualityGateReport> {
  const context: QualityGateContext = {
    spec,
    options: {
      replayStepDelayMs: options.replayStepDelayMs ?? 0,
    },
  };

  const schemaResult = await withTiming("schema", () => runSchemaGate(context))();
  const traceabilityResult = await withTiming("traceability", () => runTraceabilityGate(context))();
  const replayResult = await withTiming("interaction_replay", () => runInteractionReplayGate(context))();

  const checks: QualityGateCheckResult[] = [schemaResult, traceabilityResult, replayResult];

  return {
    passed: checks.every((item) => item.passed),
    specId: spec.id,
    generatedAt: new Date().toISOString(),
    checks,
  };
}

import type { InteractionSpec, PageSpec } from "@/lib/protospec";
import type { ReplayPlan, ReplayRunOptions, ReplayStep } from "./types";

function formatStepLabel(step: ReplayStep): string {
  const payload = JSON.stringify(step.action.payload);
  return `[${step.index + 1}] ${step.action.type}: ${payload}`;
}

function createReplayStep(interaction: InteractionSpec, actionIndex: number): ReplayStep {
  const action = interaction.actions[actionIndex];
  const step: ReplayStep = {
    id: `${interaction.id}_step_${actionIndex + 1}`,
    index: actionIndex,
    interactionId: interaction.id,
    action,
    label: "",
    targetNodeId: interaction.targetNodeId,
  };
  step.label = formatStepLabel(step);
  return step;
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    function onAbort() {
      cleanup();
      reject(new Error("Replay aborted"));
    }

    function cleanup() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }

    signal?.addEventListener("abort", onAbort);
  });
}

export function buildReplayPlan(page: PageSpec, interactionId: string): ReplayPlan | null {
  const interaction = page.interactions.find((item) => item.id === interactionId);
  if (!interaction) return null;

  const steps = interaction.actions.map((_, actionIndex) => createReplayStep(interaction, actionIndex));
  return {
    interactionId: interaction.id,
    interactionName: interaction.name,
    event: interaction.event,
    steps,
  };
}

export async function runReplayPlan(plan: ReplayPlan, options: ReplayRunOptions = {}): Promise<void> {
  const stepDelayMs = options.stepDelayMs ?? 350;
  for (const step of plan.steps) {
    if (options.signal?.aborted) {
      throw new Error("Replay aborted");
    }
    options.onStep?.(step);
    await sleep(stepDelayMs, options.signal);
  }
}

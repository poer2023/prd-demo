import type { InteractionAction } from "@/lib/protospec";

export interface ReplayStep {
  id: string;
  index: number;
  interactionId: string;
  action: InteractionAction;
  label: string;
  targetNodeId?: string;
}

export interface ReplayPlan {
  interactionId: string;
  interactionName: string;
  event: string;
  steps: ReplayStep[];
}

export interface ReplayRunOptions {
  stepDelayMs?: number;
  signal?: AbortSignal;
  onStep?: (step: ReplayStep) => void;
}

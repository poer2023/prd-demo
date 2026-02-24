import type { InteractionAction, InteractionSpec } from "@/lib/protospec";
import type { NormalizedPrdPage } from "../types";

export function buildInteractions(page: NormalizedPrdPage, pageSlug: string): InteractionSpec[] {
  const interactions: InteractionSpec[] = [];

  page.interactions.forEach((raw, index) => {
    const interactionId = `${pageSlug}_int_${index + 1}`;
    const [left, right] = raw.split(/->|=>|→/).map((part) => part.trim());
    const event = left || `event_${index + 1}`;
    const target = right || "state_change";

    const action: InteractionAction = {
      id: `${interactionId}_action_1`,
      type: /navigate|跳转/i.test(target) ? "navigate" : "set_state",
      payload: /navigate|跳转/i.test(target)
        ? { to: target.replace(/^(navigate|跳转)[:：]?\s*/i, "") || "/" }
        : { patch: target },
    };

    interactions.push({
      id: interactionId,
      name: raw,
      event,
      actions: [action],
    });
  });

  return interactions;
}

import test from "node:test";
import assert from "node:assert/strict";
import { buildReplayPlan } from "@/lib/replay";
import { compilePrdToProtoSpec } from "@/lib/prd-compiler";
import { buildTraceMap, computeSpecDiff } from "@/lib/trace";

const PRD_FIXTURE_V1 = `# 订单页
## 页面 列表
- 列表展示订单
### 交互
- 点击订单 -> navigate: /orders/1
### 验收标准
- 用户可查看订单列表`;

const PRD_FIXTURE_V2 = `# 订单页
## 页面 列表
- 列表展示订单
### 交互
- 点击订单 -> navigate: /orders/1
- 点击返回 -> navigate: /orders
### 验收标准
- 用户可查看订单列表`;

const PRD_FIXTURE_MODIFIED = `# 订单页
## 页面 列表
- 列表展示订单
### 交互
- 点击订单 -> navigate: /orders/latest
### 验收标准
- 用户可查看订单列表`;

test("trace map indexes requirements and interactions", () => {
  const output = compilePrdToProtoSpec({
    projectId: "trace-project",
    content: PRD_FIXTURE_V1,
    sourceType: "markdown",
  });
  const page = output.spec.pages[0];
  assert.ok(page);

  const traceMap = buildTraceMap(output.spec);
  assert.ok(traceMap.entries.length > 0);

  const interactionId = page.interactions[0]?.id;
  assert.ok(interactionId);
  assert.ok(page.interactions[0]?.targetNodeId);
  const entries = traceMap.byInteractionId.get(interactionId as string);
  assert.ok(entries && entries.length > 0);
  const nodeEntries = traceMap.byNodeId.get(page.interactions[0]?.targetNodeId as string);
  assert.ok(nodeEntries && nodeEntries.length > 0);

  const replayPlan = buildReplayPlan(page, interactionId as string);
  assert.ok(replayPlan);
  assert.ok((replayPlan?.steps.length || 0) > 0);
});

test("computeSpecDiff detects interaction additions", () => {
  const previous = compilePrdToProtoSpec({
    projectId: "trace-project",
    content: PRD_FIXTURE_V1,
    sourceType: "markdown",
  });
  const next = compilePrdToProtoSpec({
    projectId: "trace-project",
    content: PRD_FIXTURE_V2,
    sourceType: "markdown",
  });

  const diff = computeSpecDiff(previous.spec, next.spec);
  assert.equal(diff.hasChanges, true);
  assert.ok(diff.summary.interactionsAdded > 0);
});

test("computeSpecDiff detects interaction modifications with stable ids", () => {
  const previous = compilePrdToProtoSpec({
    projectId: "trace-project",
    content: PRD_FIXTURE_V1,
    sourceType: "markdown",
  });
  const next = compilePrdToProtoSpec({
    projectId: "trace-project",
    content: PRD_FIXTURE_MODIFIED,
    sourceType: "markdown",
  });

  const diff = computeSpecDiff(previous.spec, next.spec);
  assert.equal(diff.hasChanges, true);
  assert.equal(diff.summary.interactionsAdded, 0);
  assert.equal(diff.summary.interactionsRemoved, 0);
  assert.ok(diff.summary.interactionsModified > 0);
  assert.ok(diff.interactionIdsModified.length > 0);
});

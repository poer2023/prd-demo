import test from "node:test";
import assert from "node:assert/strict";
import { compilePrdToProtoSpec } from "@/lib/prd-compiler";
import { runQualityGate } from "@/lib/quality-gate";

const QUALITY_FIXTURE = `# 订单页
## 页面 列表
- 列表展示订单
### 交互
- 点击订单 -> navigate: /orders/1
### 验收标准
- 用户可查看订单列表`;

test("quality gate passes for valid compiled spec", async () => {
  const compiled = compilePrdToProtoSpec({
    projectId: "quality-project",
    content: QUALITY_FIXTURE,
    sourceType: "markdown",
  });

  const report = await runQualityGate(compiled.spec);
  assert.equal(report.passed, true);
  assert.equal(report.checks.every((check) => check.passed), true);
});

test("quality gate fails when interaction targetNodeId is missing", async () => {
  const compiled = compilePrdToProtoSpec({
    projectId: "quality-project",
    content: QUALITY_FIXTURE,
    sourceType: "markdown",
  });
  const firstPage = compiled.spec.pages[0];
  if (!firstPage || firstPage.interactions.length === 0) {
    throw new Error("fixture should generate interactions");
  }
  delete firstPage.interactions[0].targetNodeId;

  const report = await runQualityGate(compiled.spec);
  assert.equal(report.passed, false);
  const traceability = report.checks.find((check) => check.name === "traceability");
  assert.ok(traceability);
  assert.equal(traceability.passed, false);
  assert.ok(traceability.details.some((item) => item.includes("missing targetNodeId")));
});

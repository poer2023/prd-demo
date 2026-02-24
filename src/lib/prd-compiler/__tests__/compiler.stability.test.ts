import test from "node:test";
import assert from "node:assert/strict";
import { compilePrdToProtoSpec } from "../compiler";

const STABILITY_FIXTURE = `# 稳定性测试页
## 页面
- 页面类型: 表单
- 字段: name
- 字段: email
- 字段: submit
## 交互
- 点击提交 -> submit form
## 样式
- primary: #2563EB
- background: #F8FAFC`;

function stablePayload(input: unknown): string {
  return JSON.stringify(input);
}

test("compiler output is stable for identical input", () => {
  const outputs: string[] = [];

  for (let i = 0; i < 20; i += 1) {
    const result = compilePrdToProtoSpec({
      projectId: "stability-project",
      content: STABILITY_FIXTURE,
      sourceType: "markdown",
    });

    outputs.push(
      stablePayload({
        id: result.spec.id,
        pages: result.spec.pages,
        tokens: result.spec.tokens,
        traces: result.spec.traces,
      })
    );
  }

  const baseline = outputs[0];
  outputs.forEach((item, index) => {
    assert.equal(item, baseline, `output mismatch at iteration ${index}`);
  });
});

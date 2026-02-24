import test from "node:test";
import assert from "node:assert/strict";
import { compilePrdToProtoSpec } from "../compiler";

const FORM_FIXTURE = `# 用户反馈表单页
## 页面
- 页面类型: 表单
- 字段: name
- 字段: email
- 字段: submit
### 交互
- 点击提交 -> submit form`;

const LIST_FIXTURE = `# 订单列表页
## 页面
- 页面类型: 列表
- 列表展示订单号与状态
### 交互
- 点击行 -> navigate: /orders/detail`;

const DETAIL_FIXTURE = `# 订单详情页
## 页面
- 页面类型: 详情
- 展示订单详情与状态
### 交互
- 点击返回 -> navigate: /orders`;

test("compiler renders form page with form container", () => {
  const output = compilePrdToProtoSpec({
    projectId: "test-project",
    content: FORM_FIXTURE,
    sourceType: "markdown",
  });
  const root = output.spec.pages[0]?.root;
  const interaction = output.spec.pages[0]?.interactions[0];
  assert.ok(root, "root node should exist");
  assert.ok(root.children.some((node) => node.id.endsWith("_form")), "form container should be generated");
  assert.equal(interaction?.targetNodeId?.endsWith("_field_3"), true, "submit interaction should target submit button");
});

test("compiler renders list page with list container", () => {
  const output = compilePrdToProtoSpec({
    projectId: "test-project",
    content: LIST_FIXTURE,
    sourceType: "markdown",
  });
  const root = output.spec.pages[0]?.root;
  assert.ok(root, "root node should exist");
  assert.ok(root.children.some((node) => node.id.endsWith("_list")), "list container should be generated");
});

test("compiler renders detail page without form/list containers", () => {
  const output = compilePrdToProtoSpec({
    projectId: "test-project",
    content: DETAIL_FIXTURE,
    sourceType: "markdown",
  });
  const root = output.spec.pages[0]?.root;
  assert.ok(root, "root node should exist");
  assert.equal(root.children.some((node) => node.id.endsWith("_form")), false);
  assert.equal(root.children.some((node) => node.id.endsWith("_list")), false);
});

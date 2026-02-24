# Phase B 交付任务板（文件级）

## 1. 目标

将当前骨架编译器升级为稳定、可回归、可解释的生成引擎，并严格遵守 Phase A 契约。

硬约束:
- 不允许绕过 `src/lib/protospec` 契约。
- AI 仅可补全字段，不可直接产出未校验结构。

## 2. 工作包拆分

### B1. 语义提取规则模块化

新增:
- `src/lib/prd-compiler/rules/page-classifier.ts`
- `src/lib/prd-compiler/rules/component-extractor.ts`
- `src/lib/prd-compiler/rules/field-extractor.ts`
- `src/lib/prd-compiler/rules/flow-extractor.ts`

改造:
- `src/lib/prd-compiler/compiler.ts`（改为 orchestrator）
- `src/lib/prd-compiler/types.ts`（补充中间语义类型）

完成标准:
- 编译器主流程不再内嵌大段规则逻辑。

### B2. 三类页面模板稳定生成

新增:
- `src/lib/prd-compiler/templates/form-page.ts`
- `src/lib/prd-compiler/templates/list-page.ts`
- `src/lib/prd-compiler/templates/detail-page.ts`

改造:
- `src/lib/prd-compiler/compiler.ts`（按分类选择模板）

完成标准:
- 给定相同 PRD 输入，三类页面输出结构稳定。

### B3. 约束冲突解析

新增:
- `src/lib/prd-compiler/conflicts/types.ts`
- `src/lib/prd-compiler/conflicts/resolver.ts`

改造:
- `src/lib/prd-compiler/errors.ts`（补充冲突错误码）
- `src/lib/prd-compiler/compiler.ts`（接入 resolver）

完成标准:
- 样式约束和组件能力冲突时，返回确定性错误或降级决策。

### B4. AI 补全受控化

新增:
- `src/lib/prd-compiler/enrichment/types.ts`
- `src/lib/prd-compiler/enrichment/guard.ts`
- `src/lib/prd-compiler/enrichment/service.ts`（可先 mock）

改造:
- `src/lib/prd-compiler/compiler.ts`

完成标准:
- AI 输出必须经过 guard；guard 不通过则回退规则路径。

### B5. 置信度与人工确认点

改造:
- `src/lib/prd-compiler/types.ts`（新增 confidence/report）
- `src/lib/prd-compiler/compiler.ts`
- `src/lib/platform/jobs/types.ts`（可选回传确认点）

完成标准:
- 输出含 `confidence: number` 与 `needsHumanReview: boolean`。

### B6. 可回归测试基线

新增:
- `src/lib/prd-compiler/__fixtures__/form.md`
- `src/lib/prd-compiler/__fixtures__/list.md`
- `src/lib/prd-compiler/__fixtures__/detail.md`
- `src/lib/prd-compiler/__tests__/compiler.stability.test.ts`
- `src/lib/prd-compiler/__tests__/compiler.templates.test.ts`

完成标准:
- 同输入连续编译 N 次（建议 20）结构哈希一致。

## 3. 执行顺序（最短路径）

1. B1
2. B2
3. B3
4. B5
5. B4
6. B6

说明:
- B4 排在 B5 后，先把规则路径和质量评估做稳定，再引入 AI 补全，降低噪声。

## 4. 验收清单

- 通过 `pnpm exec tsc --noEmit`
- 通过 `pnpm lint`（允许既有 warning）
- 新增测试全部通过
- `POST /api/compiler/jobs` 到 `GET /api/compiler/specs/{id}` 端到端可用

## 5. 风险与预案

- 风险: PRD 文本缺失关键块导致分类不稳。
- 预案: 在 normalizer 增加缺失提示 warning，并触发 `needsHumanReview`。

- 风险: 引入 AI 补全后输出抖动。
- 预案: 只允许补全文本字段；结构节点 ID 由规则路径生成。


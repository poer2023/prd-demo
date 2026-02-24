# PRD -> 页面 余下阶段执行计划（Phase B-F）

## 1. 当前基线

- 基线日期: 2026-02-24
- 已完成: Phase A、Phase B、Phase C、Phase D
- 进行中: Phase E（Schema/Traceability/Replay gate + CI 阻断已完成）
- 代码基线: `main` 分支，提交 `ea4680d`

## 2. 并行推进策略（可多 Agent 同步）

目标是在不突破 Phase A 契约边界的前提下，把 B-F 拆成可并发的独立工作流。

- Stream 1（Compiler 语义）: Phase B 主线，负责 PRD 语义提取、冲突解析、稳定生成。
- Stream 2（Runtime 渲染）: 先做 Phase C 的渲染器骨架与白名单组件，不依赖完整 B 语义规则。
- Stream 3（质量与可观测）: Phase E 已接入 C/D，继续补齐 Playwright 与视觉回归。
- Stream 4（追踪与回放）: 先定义 Phase D 的 trace/replay 数据接口，等待 B/C 输出稳定 ID 后接线。

并行约束:
- B 不得绕过 A 的 ProtoSpec 契约。
- C/D/E 只能消费 `src/lib/protospec` 的公开类型，不允许自定义旁路结构。
- 所有 Stream 的接口改动必须通过契约变更记录（`docs/architecture`）。

## 3. 阶段排期（含检查点）

### Phase B: 2026-02-24 ~ 2026-03-06

交付:
- 语义提取规则可稳定识别表单页、列表页、详情页。
- 增加约束冲突解析器与错误码。
- AI 补全路径限定为“字段补全/文案补全”，不可直接生成绕过契约结构。
- 编译结果包含 `confidence` 与 `needsHumanReview`。

DoD:
- 同一输入多次编译，输出结构一致。
- 至少 3 套 PRD 样例通过稳定性测试。

### Phase C: 2026-03-09 ~ 2026-03-20

交付:
- Runtime Renderer（白名单 + 插槽）。
- Token Compiler 与 CSS Variables 注入。
- 页面级覆盖与主题切换。
- 节点锁定与重生成 merge 策略。

DoD:
- 修改 PRD 样式约束后，无需改业务代码即可生效。

### Phase D: 2026-03-23 ~ 2026-03-27

交付:
- trace map 索引。
- 状态机回放器。
- 结构 diff + 交互 diff。

DoD:
- 点击 PRD 条款可定位到组件或交互节点，并完成回放。

### Phase E: 2026-03-30 ~ 2026-04-03

交付:
- Schema Gate（已完成）。
- Traceability + Replay Gate（已完成）。
- CI 发布阻断（已完成）。
- Playwright 交互回归（待完成）。
- 视觉回归（截图基线，待完成）。

DoD:
- 任一 gate 失败时，发布流水线阻断。

### Phase F: 2026-04-06 ~ 2026-04-17

交付:
- C2ME 迁移。
- EssayPass 迁移。
- 旧映射退场清单。

DoD:
- 两条主路径运行在 ProtoSpec 驱动链路，旧路径只保留回滚开关。

## 4. 里程碑

- M2（B 完成）: 三类页面可稳定生成。
- M3（C 完成）: 样式由 PRD 驱动。
- M4（D 完成）: 条款映射与交互回放可用。
- M5（E 完成）: 发布 gate 可阻断。
- M6（F 完成）: 存量页面迁移收敛。

## 5. 协作机制（多 Agent 版）

建议使用 4 个并发执行单元（人或会话均可）:

1. Agent-B（编译器）
- 负责目录: `src/lib/prd-compiler`, `src/lib/protospec`
- 输出: 编译器规则、冲突解析、测试样例

2. Agent-C（渲染器）
- 负责目录: `src/lib/runtime`（新建）, `src/components/proto-runtime`（新建）
- 输出: 渲染器骨架、token 注入、锁定策略

3. Agent-D（追踪回放）
- 负责目录: `src/lib/trace`（新建）, `src/lib/replay`（新建）
- 输出: trace 索引、replay 引擎、diff 模块

4. Agent-E（质量闸门）
- 负责目录: `tests/e2e`, `tests/visual`, `.github/workflows`
- 输出: e2e/视觉回归、CI gate

合并顺序:
1. B -> C
2. C -> D
3. C/D -> E
4. 全部稳定后进入 F

## 6. 本周开工清单（2026-02-24 起）

- Day 1: Phase B 规则模块拆分 + PRD 样例集落盘。
- Day 2: 三类页面提取规则 + 冲突解析 V1。
- Day 3: confidence + 人工确认点 + 稳定性测试。
- Day 4: B 阶段收口、文档更新、准备切 C。

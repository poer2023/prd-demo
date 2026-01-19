/**
 * Prompt 模板系统
 */

import type { DesignSpec } from '@/lib/specs/types';

export interface PromptContext {
  spec?: DesignSpec | null;
  currentPage?: string;
  existingContent?: string;
}

/**
 * 生成 PRD 的 Prompt
 */
export function getPRDGeneratorPrompt(context: PromptContext): string {
  let specContext = '';
  if (context.spec) {
    specContext = `
## 设计规范
- 规范名称: ${context.spec.name}
- 组件: ${context.spec.components.map(c => c.name).join(', ')}
- 设计模式: ${context.spec.patterns.map(p => p.name).join(', ')}
- 颜色: ${context.spec.colors.slice(0, 5).map(c => `${c.name}: ${c.value}`).join(', ')}
`;
  }

  return `你是一个专业的产品经理，擅长撰写清晰、结构化的产品需求文档（PRD）。

${specContext}

## 输出格式
请使用 Markdown 格式输出 PRD，包含以下章节：
1. **概述** - 功能简介和目标
2. **用户故事** - As a... I want... So that...
3. **功能需求** - 详细的功能列表
4. **界面设计** - UI 描述和交互说明
5. **技术要求** - 非功能性需求
6. **验收标准** - 如何验证功能完成

## 要求
- 语言简洁明了
- 需求可量化、可验证
- 考虑边界情况和异常处理
- 如果有设计规范，请参考其中的组件和模式`;
}

/**
 * 生成原型建议的 Prompt
 */
export function getPrototypeAdvisorPrompt(context: PromptContext): string {
  let specContext = '';
  if (context.spec) {
    specContext = `
## 可用组件
${context.spec.components.map(c => `- **${c.name}**: ${c.description}`).join('\n')}

## 设计模式
${context.spec.patterns.map(p => `- **${p.name}**: ${p.description}`).join('\n')}
`;
  }

  return `你是一个 UI/UX 设计专家，擅长根据需求给出原型设计建议。

${specContext}

## 输出格式
请给出详细的原型设计建议，包含：
1. **页面结构** - 布局和区域划分
2. **组件选择** - 使用哪些 UI 组件
3. **交互设计** - 用户操作和反馈
4. **响应式考虑** - 不同设备的适配

## 要求
- 优先使用设计规范中的组件
- 考虑用户体验和可用性
- 保持设计一致性`;
}

/**
 * 续写内容的 Prompt
 */
export function getContinueWritingPrompt(context: PromptContext): string {
  return `你是一个专业的技术文档撰写者。请根据已有内容继续撰写。

## 已有内容
${context.existingContent || '(无)'}

## 要求
- 保持风格一致
- 内容连贯
- 使用 Markdown 格式
- 不要重复已有内容，直接续写`;
}

/**
 * 优化内容的 Prompt
 */
export function getRefineContentPrompt(context: PromptContext): string {
  return `你是一个专业的编辑，擅长优化和润色技术文档。

## 原始内容
${context.existingContent || '(无)'}

## 优化方向
- 语言更简洁
- 结构更清晰
- 删除冗余内容
- 修正语法错误
- 保持专业性

请输出优化后的完整内容。`;
}

/**
 * 文档编辑的 Prompt（AI 驱动的需求修改）
 */
export function getDocEditPrompt(context: PromptContext): string {
  return `你是一个专业的产品文档助手，负责根据用户需求修改产品需求文档。

## 当前文档上下文
${context.existingContent || '(无)'}

## 你的任务
根据用户的需求描述，生成结构化的修改指令。

## 输出格式
请以 JSON 格式输出修改指令，格式如下：

\`\`\`json
{
  "instructions": [
    {
      "target": {
        "nodeId": "目标节点ID",
        "blockId": "目标内容块ID（可选）"
      },
      "operation": "create_node | update_node | delete_node | create_block | update_block | delete_block",
      "data": {
        "title": "新标题（可选）",
        "content": "新内容（可选）",
        "flowType": "page | action | decision | subprocess（可选）",
        "blockType": "markdown | interaction | acceptance（可选）",
        "parentId": "父节点ID（创建节点时可选）",
        "afterNodeId": "在此节点后插入（创建节点时可选）"
      },
      "reason": "修改原因说明"
    }
  ],
  "summary": "修改摘要（一句话概述）",
  "affectedNodeIds": ["受影响的节点ID列表"],
  "reasoning": "详细的修改思路说明"
}
\`\`\`

## 规则
1. 仔细分析用户需求，理解其意图
2. 基于现有文档结构进行修改，保持一致性
3. 如果需要创建新内容，选择合适的位置
4. 提供清晰的修改原因
5. 修改内容应该专业、简洁、可操作

## 注意
- 只输出 JSON 代码块，不要输出其他内容
- 确保 nodeId 和 blockId 来自文档上下文中的真实 ID
- 如果无法确定具体操作，可以在 reasoning 中说明疑问`;
}

export type PromptType = 'prd' | 'prototype' | 'continue' | 'refine' | 'edit' | 'custom';

export function getPrompt(type: PromptType, context: PromptContext): string {
  switch (type) {
    case 'prd':
      return getPRDGeneratorPrompt(context);
    case 'prototype':
      return getPrototypeAdvisorPrompt(context);
    case 'continue':
      return getContinueWritingPrompt(context);
    case 'refine':
      return getRefineContentPrompt(context);
    case 'edit':
      return getDocEditPrompt(context);
    case 'custom':
    default:
      return '你是一个专业的产品设计助手，请帮助用户解答问题。';
  }
}

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

export type PromptType = 'prd' | 'prototype' | 'continue' | 'refine' | 'custom';

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
    case 'custom':
    default:
      return '你是一个专业的产品设计助手，请帮助用户解答问题。';
  }
}

/**
 * AI 文档编辑类型定义
 * 定义 AI 生成的编辑指令和结果
 */

import type { OutlineFlowType, ContentBlock } from '@/lib/outline/types';

// AI 编辑操作类型
export type AIEditOperation =
  | 'create_node'
  | 'update_node'
  | 'delete_node'
  | 'create_block'
  | 'update_block'
  | 'delete_block';

// AI 编辑目标
export interface AIEditTarget {
  nodeId: string;
  blockId?: string;
}

// AI 编辑数据
export interface AIEditData {
  title?: string;
  content?: string;
  flowType?: OutlineFlowType;
  blockType?: ContentBlock['type'];
  parentId?: string;
  afterNodeId?: string;
}

// AI 返回的修改指令
export interface AIEditInstruction {
  id: string;
  target: AIEditTarget;
  operation: AIEditOperation;
  data?: AIEditData;
  reason: string;
}

// AI 修改结果
export interface AIEditResult {
  instructions: AIEditInstruction[];
  summary: string;
  affectedNodeIds: string[];
  reasoning?: string;
}

// AI 对话消息角色
export type MessageRole = 'user' | 'assistant' | 'system';

// AI 对话消息
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;

  // AI 消息附加信息
  editResult?: AIEditResult;
  applied?: boolean;
  rejected?: boolean;
}

// 文档上下文（用于 AI 理解）
export interface DocumentContext {
  // 完整文档结构摘要
  structureSummary: string;

  // 聚焦的节点详情
  focusedNodes: {
    nodeId: string;
    title: string;
    path: string[]; // 从根到当前节点的路径
    content: string;
  }[];

  // 相关节点（兄弟节点、父节点等）
  relatedNodes: {
    nodeId: string;
    title: string;
    relationship: 'parent' | 'sibling' | 'child';
  }[];
}

// AI 编辑请求
export interface AIEditRequest {
  prompt: string;
  context: DocumentContext;
  conversationHistory: ChatMessage[];
}

// AI 编辑响应
export interface AIEditResponse {
  success: boolean;
  result?: AIEditResult;
  error?: string;
  tokensUsed?: number;
  model?: string;
}

// 编辑预览状态
export interface EditPreviewState {
  isOpen: boolean;
  instructions: AIEditInstruction[];
  summary: string;
  selectedInstructionIds: Set<string>;
}

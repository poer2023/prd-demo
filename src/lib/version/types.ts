/**
 * 版本管理类型定义
 * 支持文档变更追踪、版本快照和回滚
 */

import type { ContentBlock, OutlineNode, OutlineFlowType } from '@/lib/outline/types';

// Block 级别变更
export interface BlockChange {
  blockId: string;
  type: 'add' | 'update' | 'delete';
  before?: ContentBlock;
  after?: ContentBlock;
}

// 节点级别变更
export interface NodeChange {
  nodeId: string;
  type: 'add' | 'update' | 'delete';
  titleChange?: { before: string; after: string };
  flowTypeChange?: { before: OutlineFlowType; after: OutlineFlowType };
  blockChanges: BlockChange[];
}

// AI 元数据
export interface AIMetadata {
  prompt: string;
  model: string;
  tokensUsed: number;
  reasoning?: string;
}

// 版本快照
export interface Version {
  id: string;
  timestamp: string;
  source: 'user' | 'ai';

  // AI 元数据（仅当 source 为 'ai' 时存在）
  aiMetadata?: AIMetadata;

  // 变更记录
  changes: NodeChange[];

  // 变更摘要
  summary: string;

  // 完整状态快照（用于回滚）
  snapshot: {
    nodes: Record<string, OutlineNode>;
    rootIds: string[];
  };
}

// 版本比较结果
export interface VersionDiff {
  fromVersion: string;
  toVersion: string;
  changes: NodeChange[];
  summary: string;
}

// 版本状态
export interface VersionState {
  versions: Version[];
  currentVersionId: string | null;
  maxVersions: number; // 最大保存版本数
}

// 创建版本的参数
export interface CreateVersionParams {
  source: 'user' | 'ai';
  changes: NodeChange[];
  summary?: string;
  aiMetadata?: AIMetadata;
}

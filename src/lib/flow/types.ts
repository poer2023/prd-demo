/**
 * 流程图类型定义
 */

import type { Node, Edge } from '@xyflow/react';

// 节点类型
export type FlowNodeType = 'page' | 'decision' | 'action' | 'start' | 'end';

// 自定义节点数据 - 使用 index signature 兼容 React Flow
export interface PageNodeData {
  label: string;
  description?: string;
  path?: string;
  components?: string[];
  [key: string]: unknown;
}

export interface DecisionNodeData {
  label: string;
  condition?: string;
  [key: string]: unknown;
}

export interface ActionNodeData {
  label: string;
  action?: string;
  target?: string;
  [key: string]: unknown;
}

export interface StartEndNodeData {
  label: string;
  [key: string]: unknown;
}

export type FlowNodeData = PageNodeData | DecisionNodeData | ActionNodeData | StartEndNodeData;

// 类型化的节点
export type FlowNode = Node<FlowNodeData, FlowNodeType>;

// 边类型
export type FlowEdgeType = 'default' | 'conditional';

export interface FlowEdgeData {
  label?: string;
  condition?: string;
  [key: string]: unknown;
}

export type FlowEdge = Edge<FlowEdgeData>;

// 完整的流程图数据
export interface FlowData {
  id: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: string;
  updatedAt: string;
}

// AI 生成请求
export interface GenerateFlowRequest {
  requirement: string;
  specId?: string;
  existingFlow?: FlowData;
}

// AI 生成响应
export interface GenerateFlowResponse {
  nodes: Array<{
    id: string;
    type: FlowNodeType;
    label: string;
    description?: string;
    position?: { x: number; y: number };
  }>;
  edges: Array<{
    source: string;
    target: string;
    label?: string;
    condition?: string;
  }>;
}

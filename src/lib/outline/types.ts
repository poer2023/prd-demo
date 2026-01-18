/**
 * 大纲节点类型定义
 * 大纲即骨架，每个节点展开即是详细文档+嵌入式原型
 */

// 大纲节点的流程图类型
export type OutlineFlowType = 'page' | 'action' | 'decision' | 'subprocess';

// 内容块类型
export interface MarkdownBlock {
  type: 'markdown';
  id: string;
  content: string;
}

export interface PrototypeComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: PrototypeComponent[];
  interactions?: Interaction[];
}

export interface Interaction {
  id: string;
  trigger: string;
  action: string;
  target?: string;
}

export interface PrototypeBlock {
  type: 'prototype';
  id: string;
  components: PrototypeComponent[];
}

export interface InteractionRule {
  id: string;
  trigger: string;
  response: string;
}

export interface InteractionBlock {
  type: 'interaction';
  id: string;
  rules: InteractionRule[];
}

export interface AcceptanceCriterion {
  id: string;
  description: string;
  completed: boolean;
}

export interface AcceptanceBlock {
  type: 'acceptance';
  id: string;
  criteria: AcceptanceCriterion[];
}

// 文档中的原型引用 Block
export interface PrototypeRefBlock {
  type: 'prototype-ref';
  id: string;
  prototypeId: string; // 关联的原型 ID
  title: string;
  thumbnail?: string; // 缩略图 URL
}

// 原型中的文档引用 Block
export interface DocRefBlock {
  type: 'doc-ref';
  id: string;
  docId: string; // 关联的文档节点 ID
  title: string;
  excerpt: string; // 文档摘要
}

export type ContentBlock = MarkdownBlock | PrototypeBlock | InteractionBlock | AcceptanceBlock | PrototypeRefBlock | DocRefBlock;

// 大纲节点（同时是流程节点）
export interface OutlineNode {
  id: string;
  title: string;
  level: number;
  order: number;
  parentId: string | null;

  // 流程图属性
  flowType: OutlineFlowType;

  // 内容区块
  contentBlocks: ContentBlock[];

  // 子节点 ID 列表（用于快速访问）
  childIds: string[];

  // 元数据
  createdAt: string;
  updatedAt: string;
}

// 视图模式
export type ViewMode = 'outline' | 'flow' | 'focus';

// 大纲状态
export interface OutlineState {
  nodes: Record<string, OutlineNode>;
  rootIds: string[]; // 顶级节点 ID 列表
  selectedNodeId: string | null;
  expandedNodeIds: Set<string>;
  viewMode: ViewMode;
  isFlowLocked: boolean; // 流程图锁定模式
}

// 创建新节点的参数
export interface CreateNodeParams {
  title: string;
  parentId?: string | null;
  flowType?: OutlineFlowType;
  afterNodeId?: string; // 在某个节点之后插入
}

// 更新节点的参数
export interface UpdateNodeParams {
  id: string;
  title?: string;
  flowType?: OutlineFlowType;
  contentBlocks?: ContentBlock[];
}

// 移动节点的参数
export interface MoveNodeParams {
  nodeId: string;
  targetParentId: string | null;
  targetIndex: number;
}

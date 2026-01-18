/**
 * 大纲到流程图转换工具
 * 将大纲结构自动转换为 ReactFlow 节点和边
 */

import type { OutlineNode } from '@/lib/outline/types';
import type { FlowNode, FlowEdge, FlowNodeType } from '@/lib/flow/types';

// 将大纲节点类型映射到流程节点类型
const mapFlowType = (outlineType: OutlineNode['flowType']): FlowNodeType => {
  switch (outlineType) {
    case 'page':
      return 'page';
    case 'action':
      return 'action';
    case 'decision':
      return 'decision';
    case 'subprocess':
      return 'page'; // 子流程用页面节点表示
    default:
      return 'page';
  }
};

interface ConvertOptions {
  startX?: number;
  startY?: number;
  horizontalGap?: number;
  verticalGap?: number;
}

/**
 * 将大纲节点转换为流程图节点和边
 */
export function convertOutlineToFlow(
  nodes: Record<string, OutlineNode>,
  rootIds: string[],
  options: ConvertOptions = {}
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const {
    startX = 250,
    startY = 50,
    horizontalGap = 200,
    verticalGap = 100,
  } = options;

  const flowNodes: FlowNode[] = [];
  const flowEdges: FlowEdge[] = [];

  let currentY = startY;

  // 递归处理节点
  const processNode = (
    nodeId: string,
    level: number,
    parentFlowId: string | null,
    siblingIndex: number,
    siblingCount: number
  ) => {
    const node = nodes[nodeId];
    if (!node) return;

    // 计算位置
    const levelWidth = siblingCount * horizontalGap;
    const x = startX - levelWidth / 2 + siblingIndex * horizontalGap + horizontalGap / 2;
    const y = currentY;

    const flowNode: FlowNode = {
      id: `flow_${nodeId}`,
      type: mapFlowType(node.flowType),
      position: { x, y },
      data: {
        label: node.title,
        description: node.contentBlocks
          .filter((b) => b.type === 'markdown')
          .map((b) => (b as { content: string }).content.slice(0, 100))
          .join(' '),
      },
    };

    flowNodes.push(flowNode);

    // 创建从父节点到当前节点的边
    if (parentFlowId) {
      flowEdges.push({
        id: `edge_${parentFlowId}_${flowNode.id}`,
        source: parentFlowId,
        target: flowNode.id,
        animated: true,
      });
    }

    // 处理子节点
    if (node.childIds.length > 0) {
      currentY += verticalGap;
      node.childIds.forEach((childId, index) => {
        processNode(childId, level + 1, flowNode.id, index, node.childIds.length);
      });
    }
  };

  // 处理根节点
  rootIds.forEach((rootId, index) => {
    processNode(rootId, 0, null, index, rootIds.length);
    currentY += verticalGap;
  });

  return { nodes: flowNodes, edges: flowEdges };
}

/**
 * 简化版转换 - 仅用于缩略图显示
 */
export function convertOutlineToSimpleFlow(
  nodes: Record<string, OutlineNode>,
  rootIds: string[]
): { nodes: Array<{ id: string; label: string; level: number }>; edges: Array<{ source: string; target: string }> } {
  const simpleNodes: Array<{ id: string; label: string; level: number }> = [];
  const simpleEdges: Array<{ source: string; target: string }> = [];

  const processNode = (nodeId: string, level: number, parentId: string | null) => {
    const node = nodes[nodeId];
    if (!node) return;

    simpleNodes.push({
      id: nodeId,
      label: node.title,
      level,
    });

    if (parentId) {
      simpleEdges.push({
        source: parentId,
        target: nodeId,
      });
    }

    node.childIds.forEach((childId) => {
      processNode(childId, level + 1, nodeId);
    });
  };

  rootIds.forEach((rootId) => {
    processNode(rootId, 0, null);
  });

  return { nodes: simpleNodes, edges: simpleEdges };
}

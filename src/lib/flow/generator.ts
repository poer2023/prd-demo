/**
 * AI 流程图生成器
 */

import type { FlowNode, FlowEdge, GenerateFlowResponse } from './types';
import type { DesignSpec } from '@/lib/specs/types';

const FLOW_GENERATION_PROMPT = `你是一个产品流程设计专家。根据用户的需求描述，生成一个清晰的产品流程图。

输出格式必须是严格的 JSON，包含 nodes 和 edges 两个数组：

{
  "nodes": [
    { "id": "start", "type": "start", "label": "开始" },
    { "id": "page1", "type": "page", "label": "页面名称", "description": "页面描述" },
    { "id": "decision1", "type": "decision", "label": "判断条件" },
    { "id": "action1", "type": "action", "label": "操作名称" },
    { "id": "end", "type": "end", "label": "结束" }
  ],
  "edges": [
    { "source": "start", "target": "page1" },
    { "source": "page1", "target": "decision1" },
    { "source": "decision1", "target": "action1", "label": "是" },
    { "source": "decision1", "target": "end", "label": "否" },
    { "source": "action1", "target": "end" }
  ]
}

节点类型说明：
- start: 流程起点
- end: 流程终点
- page: 页面节点，需要 label 和可选的 description
- decision: 决策节点，用于分支判断
- action: 操作节点，表示用户行为或系统操作

要求：
1. 必须有一个 start 节点和至少一个 end 节点
2. 所有节点必须连通
3. decision 节点应该有多个出边（表示不同分支）
4. 保持流程简洁，通常 5-15 个节点为宜
5. 只输出 JSON，不要有其他内容`;

/**
 * 调用 LLM 生成流程图
 */
export async function generateFlowFromRequirement(
  requirement: string,
  spec?: DesignSpec | null,
  config?: {
    provider: string;
    apiKey: string;
    baseUrl?: string;
    model: string;
  }
): Promise<{ nodes: FlowNode[]; edges: FlowEdge[] }> {
  // 构建上下文
  let context = '';
  if (spec) {
    context = `\n\n设计规范上下文：
- 规范名称: ${spec.name}
- 组件列表: ${spec.components.map(c => c.name).join(', ')}
- 页面模式: ${spec.patterns.map(p => p.name).join(', ')}
请在生成流程时参考这些组件和模式。`;
  }

  const messages = [
    { role: 'system' as const, content: FLOW_GENERATION_PROMPT + context },
    { role: 'user' as const, content: `需求描述：${requirement}` },
  ];

  // 如果没有配置，从 localStorage 获取
  let llmConfig = config;
  if (!llmConfig && typeof window !== 'undefined') {
    const stored = localStorage.getItem('llm-settings');
    if (stored) {
      llmConfig = JSON.parse(stored);
    }
  }

  if (!llmConfig?.apiKey) {
    throw new Error('请先在设置页面配置 LLM API');
  }

  const response = await fetch('/api/llm/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      config: llmConfig,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`生成失败: ${error}`);
  }

  const data = await response.json();
  const content = data.content;

  // 解析 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('无法解析 AI 响应');
  }

  const flowData: GenerateFlowResponse = JSON.parse(jsonMatch[0]);

  // 转换为 React Flow 格式
  return convertToReactFlow(flowData);
}

/**
 * 将 AI 响应转换为 React Flow 格式
 */
function convertToReactFlow(data: GenerateFlowResponse): { nodes: FlowNode[]; edges: FlowEdge[] } {
  // 自动布局位置
  const nodePositions = calculatePositions(data.nodes, data.edges);

  const nodes: FlowNode[] = data.nodes.map((node, index) => ({
    id: node.id,
    type: node.type,
    position: nodePositions[node.id] || { x: 250, y: index * 120 + 50 },
    data: {
      label: node.label,
      description: node.description,
    },
  }));

  const edges: FlowEdge[] = data.edges.map((edge, index) => ({
    id: `edge_${index}`,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: true,
    style: { stroke: '#888' },
  }));

  return { nodes, edges };
}

/**
 * 计算节点位置（简单的层级布局）
 */
function calculatePositions(
  nodes: GenerateFlowResponse['nodes'],
  edges: GenerateFlowResponse['edges']
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // 构建邻接表
  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();

  for (const edge of edges) {
    if (!children.has(edge.source)) children.set(edge.source, []);
    children.get(edge.source)!.push(edge.target);

    if (!parents.has(edge.target)) parents.set(edge.target, []);
    parents.get(edge.target)!.push(edge.source);
  }

  // 找到起点（没有父节点的节点）
  const startNodes = nodes.filter(n => !parents.has(n.id) || parents.get(n.id)!.length === 0);

  // BFS 分层
  const levels: string[][] = [];
  const visited = new Set<string>();
  let currentLevel = startNodes.map(n => n.id);

  while (currentLevel.length > 0) {
    levels.push(currentLevel);
    currentLevel.forEach(id => visited.add(id));

    const nextLevel: string[] = [];
    for (const nodeId of currentLevel) {
      const nodeChildren = children.get(nodeId) || [];
      for (const child of nodeChildren) {
        if (!visited.has(child) && !nextLevel.includes(child)) {
          nextLevel.push(child);
        }
      }
    }
    currentLevel = nextLevel;
  }

  // 添加未访问的节点
  const unvisited = nodes.filter(n => !visited.has(n.id));
  if (unvisited.length > 0) {
    levels.push(unvisited.map(n => n.id));
  }

  // 计算位置
  const levelHeight = 120;
  const nodeWidth = 200;
  const centerX = 300;

  levels.forEach((level, levelIndex) => {
    const startX = centerX - ((level.length - 1) * nodeWidth) / 2;
    level.forEach((nodeId, nodeIndex) => {
      positions[nodeId] = {
        x: startX + nodeIndex * nodeWidth,
        y: 50 + levelIndex * levelHeight,
      };
    });
  });

  return positions;
}

export { convertToReactFlow, calculatePositions };

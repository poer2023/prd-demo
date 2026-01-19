/**
 * AI 文档编辑服务
 * 负责构建文档上下文、生成修改指令、应用修改
 */

import type { OutlineNode, ContentBlock } from '@/lib/outline/types';
import type {
  AIEditInstruction,
  AIEditResult,
  DocumentContext,
  ChatMessage,
  AIEditRequest,
  AIEditResponse,
} from './types';
import type { BatchOperation } from '@/stores/outlineStore';
import { createLLMClient } from '@/lib/llm/client';
import type { LLMConfig } from '@/lib/llm/types';
import { getDocEditPrompt } from '@/lib/prompts/templates';

// 生成唯一 ID
const generateId = () => `instr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * AI 文档服务类
 */
export class AIDocService {
  private llmConfig: LLMConfig;

  constructor(config?: LLMConfig) {
    this.llmConfig = config || {
      provider: 'claude',
      model: 'claude-sonnet-4-20250514',
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
    };
  }

  /**
   * 构建文档上下文供 AI 理解
   */
  buildDocumentContext(
    nodes: Record<string, OutlineNode>,
    rootIds: string[],
    focusNodeIds: string[]
  ): DocumentContext {
    // 构建结构摘要
    const structureSummary = this.buildStructureSummary(nodes, rootIds);

    // 构建聚焦节点详情
    const focusedNodes = focusNodeIds.map((nodeId) => {
      const node = nodes[nodeId];
      if (!node) return null;

      return {
        nodeId,
        title: node.title,
        path: this.getNodePath(nodes, nodeId),
        content: this.extractNodeContent(node),
      };
    }).filter(Boolean) as DocumentContext['focusedNodes'];

    // 构建相关节点
    const relatedNodes: DocumentContext['relatedNodes'] = [];
    for (const nodeId of focusNodeIds) {
      const node = nodes[nodeId];
      if (!node) continue;

      // 添加父节点
      if (node.parentId && nodes[node.parentId]) {
        relatedNodes.push({
          nodeId: node.parentId,
          title: nodes[node.parentId].title,
          relationship: 'parent',
        });
      }

      // 添加子节点
      for (const childId of node.childIds) {
        if (nodes[childId]) {
          relatedNodes.push({
            nodeId: childId,
            title: nodes[childId].title,
            relationship: 'child',
          });
        }
      }

      // 添加兄弟节点
      const siblings = node.parentId
        ? nodes[node.parentId]?.childIds || []
        : rootIds;
      for (const siblingId of siblings) {
        if (siblingId !== nodeId && nodes[siblingId]) {
          relatedNodes.push({
            nodeId: siblingId,
            title: nodes[siblingId].title,
            relationship: 'sibling',
          });
        }
      }
    }

    return { structureSummary, focusedNodes, relatedNodes };
  }

  /**
   * 构建结构摘要
   */
  private buildStructureSummary(
    nodes: Record<string, OutlineNode>,
    rootIds: string[]
  ): string {
    const lines: string[] = ['# 文档结构\n'];

    const traverse = (ids: string[], indent: number = 0) => {
      for (const id of ids) {
        const node = nodes[id];
        if (!node) continue;

        const prefix = '  '.repeat(indent);
        const typeIcon = this.getFlowTypeIcon(node.flowType);
        lines.push(`${prefix}- ${typeIcon} ${node.title} (ID: ${node.id})`);

        if (node.childIds.length > 0) {
          traverse(node.childIds, indent + 1);
        }
      }
    };

    traverse(rootIds);
    return lines.join('\n');
  }

  /**
   * 获取流程类型图标
   */
  private getFlowTypeIcon(flowType: string): string {
    const icons: Record<string, string> = {
      page: '📄',
      action: '⚡',
      decision: '🔀',
      subprocess: '📦',
    };
    return icons[flowType] || '📄';
  }

  /**
   * 获取节点路径
   */
  private getNodePath(nodes: Record<string, OutlineNode>, nodeId: string): string[] {
    const path: string[] = [];
    let current = nodes[nodeId];

    while (current) {
      path.unshift(current.title);
      current = current.parentId ? nodes[current.parentId] : null!;
    }

    return path;
  }

  /**
   * 提取节点内容
   */
  private extractNodeContent(node: OutlineNode): string {
    const parts: string[] = [];

    for (const block of node.contentBlocks) {
      switch (block.type) {
        case 'markdown':
          parts.push(block.content);
          break;
        case 'interaction':
          parts.push('\n### 交互规则\n');
          for (const rule of block.rules) {
            parts.push(`- 触发: ${rule.trigger} → 响应: ${rule.response}`);
          }
          break;
        case 'acceptance':
          parts.push('\n### 验收标准\n');
          for (const criterion of block.criteria) {
            const status = criterion.completed ? '✅' : '⬜';
            parts.push(`- ${status} ${criterion.description}`);
          }
          break;
      }
    }

    return parts.join('\n');
  }

  /**
   * 生成修改指令
   */
  async generateEditInstructions(
    request: AIEditRequest
  ): Promise<AIEditResponse> {
    try {
      const client = createLLMClient(this.llmConfig);

      // 构建系统提示
      const systemPrompt = getDocEditPrompt({
        existingContent: JSON.stringify(request.context, null, 2),
      });

      // 构建消息历史
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...request.conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content: request.prompt },
      ];

      // 调用 LLM
      const response = await client.chat(messages);

      // 解析响应
      const result = this.parseAIResponse(response.content);

      return {
        success: true,
        result,
        tokensUsed: response.usage?.totalTokens,
        model: this.llmConfig.model,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 解析 AI 响应
   */
  private parseAIResponse(content: string): AIEditResult {
    // 尝试从响应中提取 JSON
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return {
          instructions: (parsed.instructions || []).map((instr: AIEditInstruction) => ({
            ...instr,
            id: instr.id || generateId(),
          })),
          summary: parsed.summary || '已生成修改指令',
          affectedNodeIds: parsed.affectedNodeIds || [],
          reasoning: parsed.reasoning,
        };
      } catch {
        // JSON 解析失败，使用文本模式
      }
    }

    // 如果无法解析 JSON，返回文本建议
    return {
      instructions: [],
      summary: content.slice(0, 200),
      affectedNodeIds: [],
      reasoning: content,
    };
  }

  /**
   * 将修改指令转换为批量操作
   */
  instructionsToBatchOperations(instructions: AIEditInstruction[]): BatchOperation[] {
    const operations: BatchOperation[] = [];

    for (const instruction of instructions) {
      switch (instruction.operation) {
        case 'create_node':
          operations.push({
            type: 'create',
            params: {
              title: instruction.data?.title || '新节点',
              parentId: instruction.data?.parentId,
              flowType: instruction.data?.flowType,
              afterNodeId: instruction.data?.afterNodeId,
            },
          });
          break;

        case 'update_node':
          operations.push({
            type: 'update',
            nodeId: instruction.target.nodeId,
            params: {
              id: instruction.target.nodeId,
              title: instruction.data?.title,
              flowType: instruction.data?.flowType,
            },
          });
          break;

        case 'delete_node':
          operations.push({
            type: 'delete',
            nodeId: instruction.target.nodeId,
          });
          break;

        case 'update_block':
          // Block 更新需要特殊处理，这里先跳过
          // 实际实现时需要通过 updateContentBlock
          break;
      }
    }

    return operations;
  }

  /**
   * 更新 LLM 配置
   */
  setConfig(config: Partial<LLMConfig>) {
    this.llmConfig = { ...this.llmConfig, ...config };
  }
}

// 导出单例
export const aiDocService = new AIDocService();

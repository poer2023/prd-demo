/**
 * 版本管理服务
 * 负责创建版本快照、计算差异、生成摘要
 */

import type { OutlineNode, OutlineState, ContentBlock } from '@/lib/outline/types';
import type {
  Version,
  NodeChange,
  BlockChange,
  CreateVersionParams,
  VersionDiff,
  AIMetadata,
} from './types';

// 生成唯一 ID
const generateVersionId = () => `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * 版本服务类
 */
export class VersionService {
  /**
   * 创建版本快照
   */
  createVersion(
    state: Pick<OutlineState, 'nodes' | 'rootIds'>,
    params: CreateVersionParams
  ): Version {
    const { source, changes, summary, aiMetadata } = params;

    return {
      id: generateVersionId(),
      timestamp: new Date().toISOString(),
      source,
      aiMetadata,
      changes,
      summary: summary || this.generateSummary(changes),
      snapshot: {
        nodes: JSON.parse(JSON.stringify(state.nodes)), // Deep clone
        rootIds: [...state.rootIds],
      },
    };
  }

  /**
   * 计算两个状态之间的差异
   */
  computeChanges(
    before: Pick<OutlineState, 'nodes' | 'rootIds'>,
    after: Pick<OutlineState, 'nodes' | 'rootIds'>
  ): NodeChange[] {
    const changes: NodeChange[] = [];
    const allNodeIds = new Set([
      ...Object.keys(before.nodes),
      ...Object.keys(after.nodes),
    ]);

    for (const nodeId of allNodeIds) {
      const beforeNode = before.nodes[nodeId];
      const afterNode = after.nodes[nodeId];

      if (!beforeNode && afterNode) {
        // 新增节点
        changes.push({
          nodeId,
          type: 'add',
          blockChanges: afterNode.contentBlocks.map((block) => ({
            blockId: block.id,
            type: 'add' as const,
            after: block,
          })),
        });
      } else if (beforeNode && !afterNode) {
        // 删除节点
        changes.push({
          nodeId,
          type: 'delete',
          blockChanges: beforeNode.contentBlocks.map((block) => ({
            blockId: block.id,
            type: 'delete' as const,
            before: block,
          })),
        });
      } else if (beforeNode && afterNode) {
        // 检查节点是否有变化
        const nodeChange = this.computeNodeChange(beforeNode, afterNode);
        if (nodeChange) {
          changes.push(nodeChange);
        }
      }
    }

    return changes;
  }

  /**
   * 计算单个节点的变化
   */
  private computeNodeChange(before: OutlineNode, after: OutlineNode): NodeChange | null {
    const blockChanges = this.computeBlockChanges(before.contentBlocks, after.contentBlocks);
    const titleChanged = before.title !== after.title;
    const flowTypeChanged = before.flowType !== after.flowType;

    if (!titleChanged && !flowTypeChanged && blockChanges.length === 0) {
      return null;
    }

    return {
      nodeId: before.id,
      type: 'update',
      titleChange: titleChanged ? { before: before.title, after: after.title } : undefined,
      flowTypeChange: flowTypeChanged
        ? { before: before.flowType, after: after.flowType }
        : undefined,
      blockChanges,
    };
  }

  /**
   * 计算内容块的变化
   */
  private computeBlockChanges(
    beforeBlocks: ContentBlock[],
    afterBlocks: ContentBlock[]
  ): BlockChange[] {
    const changes: BlockChange[] = [];
    const beforeMap = new Map(beforeBlocks.map((b) => [b.id, b]));
    const afterMap = new Map(afterBlocks.map((b) => [b.id, b]));

    // 检查删除和更新
    for (const [id, beforeBlock] of beforeMap) {
      const afterBlock = afterMap.get(id);
      if (!afterBlock) {
        changes.push({ blockId: id, type: 'delete', before: beforeBlock });
      } else if (!this.blocksEqual(beforeBlock, afterBlock)) {
        changes.push({ blockId: id, type: 'update', before: beforeBlock, after: afterBlock });
      }
    }

    // 检查新增
    for (const [id, afterBlock] of afterMap) {
      if (!beforeMap.has(id)) {
        changes.push({ blockId: id, type: 'add', after: afterBlock });
      }
    }

    return changes;
  }

  /**
   * 比较两个内容块是否相等
   */
  private blocksEqual(a: ContentBlock, b: ContentBlock): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  /**
   * 计算两个版本之间的差异
   */
  computeDiff(v1: Version, v2: Version): VersionDiff {
    const changes = this.computeChanges(v1.snapshot, v2.snapshot);
    return {
      fromVersion: v1.id,
      toVersion: v2.id,
      changes,
      summary: this.generateSummary(changes),
    };
  }

  /**
   * 生成变更摘要
   */
  generateSummary(changes: NodeChange[]): string {
    if (changes.length === 0) {
      return '无变更';
    }

    const stats = {
      nodesAdded: 0,
      nodesUpdated: 0,
      nodesDeleted: 0,
      blocksAdded: 0,
      blocksUpdated: 0,
      blocksDeleted: 0,
    };

    for (const change of changes) {
      switch (change.type) {
        case 'add':
          stats.nodesAdded++;
          break;
        case 'update':
          stats.nodesUpdated++;
          break;
        case 'delete':
          stats.nodesDeleted++;
          break;
      }

      for (const blockChange of change.blockChanges) {
        switch (blockChange.type) {
          case 'add':
            stats.blocksAdded++;
            break;
          case 'update':
            stats.blocksUpdated++;
            break;
          case 'delete':
            stats.blocksDeleted++;
            break;
        }
      }
    }

    const parts: string[] = [];

    if (stats.nodesAdded > 0) parts.push(`新增 ${stats.nodesAdded} 个节点`);
    if (stats.nodesUpdated > 0) parts.push(`更新 ${stats.nodesUpdated} 个节点`);
    if (stats.nodesDeleted > 0) parts.push(`删除 ${stats.nodesDeleted} 个节点`);

    if (parts.length === 0) {
      // 只有 block 级别的变更
      const blockParts: string[] = [];
      if (stats.blocksAdded > 0) blockParts.push(`新增 ${stats.blocksAdded} 个内容块`);
      if (stats.blocksUpdated > 0) blockParts.push(`更新 ${stats.blocksUpdated} 个内容块`);
      if (stats.blocksDeleted > 0) blockParts.push(`删除 ${stats.blocksDeleted} 个内容块`);
      return blockParts.join('，') || '无变更';
    }

    return parts.join('，');
  }

  /**
   * 获取受影响的节点 ID 列表
   */
  getAffectedNodeIds(changes: NodeChange[]): string[] {
    return changes.map((change) => change.nodeId);
  }

  /**
   * 从变更中提取 Markdown 内容的文本差异（用于显示）
   */
  extractMarkdownDiff(blockChange: BlockChange): { before: string; after: string } | null {
    if (blockChange.type === 'update') {
      const beforeBlock = blockChange.before;
      const afterBlock = blockChange.after;

      if (beforeBlock?.type === 'markdown' && afterBlock?.type === 'markdown') {
        return {
          before: beforeBlock.content,
          after: afterBlock.content,
        };
      }
    }
    return null;
  }
}

// 导出单例
export const versionService = new VersionService();

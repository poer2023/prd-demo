/**
 * 原型同步服务
 * 监听文档变化，自动同步更新原型
 */

import { debounce } from 'lodash-es';
import type { OutlineNode } from '@/lib/outline/types';
import { PrototypeGenerator } from '@/lib/prototype/generator/PrototypeGenerator';

// 同步状态
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

// 同步事件监听器
type SyncListener = (status: SyncStatus, nodeIds: string[]) => void;

/**
 * 原型同步服务类
 */
export class PrototypeSyncService {
  private generator: PrototypeGenerator;
  private listeners: Set<SyncListener> = new Set();
  private pendingNodeIds: Set<string> = new Set();
  private status: SyncStatus = 'idle';
  private debounceMs: number;

  constructor(designSystemId: string = 'default', debounceMs: number = 1000) {
    this.generator = new PrototypeGenerator(designSystemId);
    this.debounceMs = debounceMs;
  }

  /**
   * 监听文档变化（防抖触发原型更新）
   */
  onDocumentChange = debounce(
    (changedNodeIds: string[], nodes: Record<string, OutlineNode>) => {
      // 将变更的节点加入待同步队列
      changedNodeIds.forEach((id) => this.pendingNodeIds.add(id));

      // 触发同步
      this.syncPrototypes(nodes);
    },
    1000, // 1秒防抖
    { leading: false, trailing: true }
  );

  /**
   * 同步原型
   */
  async syncPrototypes(nodes: Record<string, OutlineNode>): Promise<void> {
    if (this.pendingNodeIds.size === 0) return;

    const nodeIds = Array.from(this.pendingNodeIds);
    this.pendingNodeIds.clear();

    this.setStatus('syncing', nodeIds);

    try {
      // 为每个变更的节点重新生成原型
      const results = await Promise.all(
        nodeIds.map(async (nodeId) => {
          const node = nodes[nodeId];
          if (!node) return null;

          try {
            // 只为 page 类型的节点生成原型
            if (node.flowType === 'page') {
              return this.generator.generatePagePrototype(node);
            }
            return null;
          } catch (error) {
            console.error(`Failed to generate prototype for node ${nodeId}:`, error);
            return null;
          }
        })
      );

      const successCount = results.filter(Boolean).length;
      console.log(`[PrototypeSyncService] Synced ${successCount}/${nodeIds.length} prototypes`);

      this.setStatus('success', nodeIds);

      // 短暂显示成功状态后恢复 idle
      setTimeout(() => {
        if (this.status === 'success') {
          this.setStatus('idle', []);
        }
      }, 2000);
    } catch (error) {
      console.error('[PrototypeSyncService] Sync failed:', error);
      this.setStatus('error', nodeIds);
    }
  }

  /**
   * 强制同步指定节点
   */
  async forceSyncNodes(
    nodeIds: string[],
    nodes: Record<string, OutlineNode>
  ): Promise<void> {
    nodeIds.forEach((id) => this.pendingNodeIds.add(id));
    await this.syncPrototypes(nodes);
  }

  /**
   * 设置状态并通知监听器
   */
  private setStatus(status: SyncStatus, nodeIds: string[]) {
    this.status = status;
    this.listeners.forEach((listener) => listener(status, nodeIds));
  }

  /**
   * 获取当前状态
   */
  getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * 添加状态监听器
   */
  addListener(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 移除状态监听器
   */
  removeListener(listener: SyncListener) {
    this.listeners.delete(listener);
  }

  /**
   * 清理资源
   */
  destroy() {
    this.onDocumentChange.cancel();
    this.listeners.clear();
    this.pendingNodeIds.clear();
  }
}

// 导出单例
export const prototypeSyncService = new PrototypeSyncService();

/**
 * 设计系统注册表
 * 管理多个设计系统的注册、获取和切换
 */

import type { DesignSystem } from './types';

class DesignSystemRegistry {
  private systems: Map<string, DesignSystem> = new Map();
  private activeId: string = 'default';
  private listeners: Set<() => void> = new Set();

  /**
   * 注册一个设计系统
   */
  register(system: DesignSystem): void {
    this.systems.set(system.id, system);
    this.notifyListeners();
  }

  /**
   * 获取指定 ID 的设计系统
   */
  get(id: string): DesignSystem | undefined {
    return this.systems.get(id);
  }

  /**
   * 设置当前激活的设计系统
   */
  setActive(id: string): void {
    if (!this.systems.has(id)) {
      console.warn(`Design system "${id}" not found, keeping current active: "${this.activeId}"`);
      return;
    }
    this.activeId = id;
    this.notifyListeners();
  }

  /**
   * 获取当前激活的设计系统
   */
  getActive(): DesignSystem {
    const active = this.systems.get(this.activeId);
    if (!active) {
      throw new Error(`Active design system "${this.activeId}" not found. Make sure to register at least one design system.`);
    }
    return active;
  }

  /**
   * 获取当前激活的设计系统 ID
   */
  getActiveId(): string {
    return this.activeId;
  }

  /**
   * 列出所有已注册的设计系统
   */
  list(): DesignSystem[] {
    return Array.from(this.systems.values());
  }

  /**
   * 检查是否有注册的设计系统
   */
  hasAny(): boolean {
    return this.systems.size > 0;
  }

  /**
   * 卸载指定的设计系统
   */
  unload(id: string): void {
    if (id === this.activeId) {
      console.warn(`Cannot unload active design system "${id}". Switch to another first.`);
      return;
    }
    this.systems.delete(id);
    this.notifyListeners();
  }

  /**
   * 订阅设计系统变化
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * 热加载设计系统（从 URL 加载）
   * 预留接口，未来可扩展
   */
  async loadFromUrl(_url: string): Promise<void> {
    // TODO: 实现远程加载设计系统
    console.warn('loadFromUrl is not yet implemented');
  }
}

// 全局单例
export const designSystemRegistry = new DesignSystemRegistry();

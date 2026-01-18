/**
 * 设计规范存储
 * 使用 localStorage 进行项目级规范存储
 */

import type { DesignSpec, DesignSpecSummary } from './types';

const STORAGE_KEY = 'design-specs';

/**
 * 获取所有规范的摘要列表
 */
export function getSpecList(): DesignSpecSummary[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const specs: DesignSpec[] = JSON.parse(stored);
    return specs.map(spec => ({
      id: spec.id,
      name: spec.name,
      version: spec.version,
      description: spec.description,
      updatedAt: spec.updatedAt,
      tokenCount: {
        colors: spec.colors.length,
        typography: spec.typography.length,
        spacing: spec.spacing.length,
        components: spec.components.length,
        patterns: spec.patterns.length,
        pages: spec.pages.length,
      },
    }));
  } catch {
    return [];
  }
}

/**
 * 获取单个规范的完整数据
 */
export function getSpec(id: string): DesignSpec | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const specs: DesignSpec[] = JSON.parse(stored);
    return specs.find(s => s.id === id) || null;
  } catch {
    return null;
  }
}

/**
 * 保存规范
 */
export function saveSpec(spec: DesignSpec): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  let specs: DesignSpec[] = [];

  if (stored) {
    try {
      specs = JSON.parse(stored);
    } catch {
      specs = [];
    }
  }

  // 更新或添加
  const existingIndex = specs.findIndex(s => s.id === spec.id);
  if (existingIndex >= 0) {
    specs[existingIndex] = { ...spec, updatedAt: new Date().toISOString() };
  } else {
    specs.push(spec);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(specs));
}

/**
 * 删除规范
 */
export function deleteSpec(id: string): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;

  try {
    const specs: DesignSpec[] = JSON.parse(stored);
    const filtered = specs.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

/**
 * 获取当前活跃的规范 ID
 */
export function getActiveSpecId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('active-spec-id');
}

/**
 * 设置当前活跃的规范
 */
export function setActiveSpec(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('active-spec-id', id);
}

/**
 * 获取当前活跃的规范
 */
export function getActiveSpec(): DesignSpec | null {
  const id = getActiveSpecId();
  if (!id) return null;
  return getSpec(id);
}

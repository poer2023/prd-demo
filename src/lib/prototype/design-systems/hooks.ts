/**
 * 设计系统 React Hooks
 */

'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { designSystemRegistry } from './registry';
import type { DesignSystem } from './types';

/**
 * 获取当前激活的设计系统
 */
export function useDesignSystem(): DesignSystem {
  const subscribe = useCallback((callback: () => void) => {
    return designSystemRegistry.subscribe(callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return designSystemRegistry.getActive();
  }, []);

  const getServerSnapshot = useCallback(() => {
    return designSystemRegistry.getActive();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * 获取所有已注册的设计系统列表
 */
export function useDesignSystemList(): DesignSystem[] {
  const subscribe = useCallback((callback: () => void) => {
    return designSystemRegistry.subscribe(callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return designSystemRegistry.list();
  }, []);

  const getServerSnapshot = useCallback(() => {
    return designSystemRegistry.list();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * 获取当前激活的设计系统 ID
 */
export function useActiveDesignSystemId(): string {
  const subscribe = useCallback((callback: () => void) => {
    return designSystemRegistry.subscribe(callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return designSystemRegistry.getActiveId();
  }, []);

  const getServerSnapshot = useCallback(() => {
    return designSystemRegistry.getActiveId();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * 切换设计系统的 hook
 */
export function useSetDesignSystem(): (id: string) => void {
  return useCallback((id: string) => {
    designSystemRegistry.setActive(id);
  }, []);
}

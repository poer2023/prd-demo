'use client';

/**
 * 同步状态指示器
 * 显示原型同步状态
 */

import React, { useState, useEffect } from 'react';
import { prototypeSyncService, type SyncStatus } from '@/lib/prototype/sync-service';

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncedIds, setLastSyncedIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = prototypeSyncService.addListener((newStatus, nodeIds) => {
      setStatus(newStatus);
      if (nodeIds.length > 0) {
        setLastSyncedIds(nodeIds);
      }
    });

    return unsubscribe;
  }, []);

  if (status === 'idle') return null;

  const statusConfig = {
    syncing: {
      icon: '🔄',
      text: '同步中...',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    success: {
      icon: '✓',
      text: '已同步',
      className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
    error: {
      icon: '⚠',
      text: '同步失败',
      className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return null;

  return (
    <div
      className={`fixed bottom-[420px] right-4 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 ${config.className} shadow-md z-40 transition-all duration-300`}
    >
      <span className={status === 'syncing' ? 'animate-spin' : ''}>{config.icon}</span>
      <span>{config.text}</span>
      {lastSyncedIds.length > 0 && status === 'success' && (
        <span className="text-xs opacity-70">({lastSyncedIds.length} 个节点)</span>
      )}
    </div>
  );
}

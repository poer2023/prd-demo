'use client';

/**
 * 版本时间线组件
 * 显示版本历史，支持回滚操作
 */

import React, { useState } from 'react';
import { useVersionStore } from '@/stores/versionStore';
import { useOutlineStore } from '@/stores/outlineStore';
import type { Version } from '@/lib/version/types';

interface VersionTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDiff: (version: Version) => void;
}

export function VersionTimeline({ isOpen, onClose, onViewDiff }: VersionTimelineProps) {
  const { versions, currentVersionId, rollbackTo, getVersion } = useVersionStore();
  const { restoreFromSnapshot } = useOutlineStore();
  const [confirmRollback, setConfirmRollback] = useState<string | null>(null);

  if (!isOpen) return null;

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 处理回滚
  const handleRollback = (versionId: string) => {
    const snapshot = rollbackTo(versionId);
    if (snapshot) {
      restoreFromSnapshot(snapshot);
    }
    setConfirmRollback(null);
  };

  // 获取版本影响的节点数量
  const getAffectedCount = (version: Version) => {
    return version.changes.length;
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-40 flex flex-col">
      {/* 标题 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-white">版本历史</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          ✕
        </button>
      </div>

      {/* 版本列表 */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4">
            <span className="text-4xl mb-2">📜</span>
            <p className="text-center">暂无版本历史</p>
            <p className="text-sm text-center mt-1">修改文档后将自动创建版本</p>
          </div>
        ) : (
          <div className="py-2">
            {versions.map((version, index) => (
              <div key={version.id} className="relative">
                {/* 时间线 */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                <div
                  className={`relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    currentVersionId === version.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {/* 时间线节点 */}
                  <div
                    className={`absolute left-5 top-4 w-3 h-3 rounded-full border-2 ${
                      index === 0
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                    }`}
                  />

                  <div className="ml-6">
                    {/* 版本信息 */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        v{versions.length - index}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(version.timestamp)}
                      </span>
                    </div>

                    {/* 来源标识 */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          version.source === 'ai'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {version.source === 'ai' ? '🤖 AI' : '👤 用户'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        影响 {getAffectedCount(version)} 个节点
                      </span>
                    </div>

                    {/* 摘要 */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {version.summary}
                    </p>

                    {/* AI 提示词（如果有） */}
                    {version.aiMetadata?.prompt && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                        提示: {version.aiMetadata.prompt}
                      </p>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => onViewDiff(version)}
                        className="text-xs text-blue-500 hover:text-blue-600"
                      >
                        查看变更
                      </button>
                      {index > 0 && (
                        <>
                          {confirmRollback === version.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleRollback(version.id)}
                                className="text-xs text-red-500 hover:text-red-600"
                              >
                                确认回滚
                              </button>
                              <button
                                onClick={() => setConfirmRollback(null)}
                                className="text-xs text-gray-500 hover:text-gray-600"
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmRollback(version.id)}
                              className="text-xs text-orange-500 hover:text-orange-600"
                            >
                              回滚
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        共 {versions.length} 个版本
      </div>
    </div>
  );
}

'use client';

/**
 * Diff 视图组件
 * 显示 Markdown 内容的差异对比
 */

import React from 'react';
import type { Version, NodeChange, BlockChange } from '@/lib/version/types';
import { useOutlineStore } from '@/stores/outlineStore';

interface DiffViewerProps {
  isOpen: boolean;
  version: Version | null;
  onClose: () => void;
}

export function DiffViewer({ isOpen, version, onClose }: DiffViewerProps) {
  const { nodes } = useOutlineStore();

  if (!isOpen || !version) return null;

  // 获取变更类型的样式
  const getChangeStyle = (type: 'add' | 'update' | 'delete') => {
    switch (type) {
      case 'add':
        return 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700';
      case 'update':
        return 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700';
      case 'delete':
        return 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700';
    }
  };

  // 获取变更类型的标签
  const getChangeLabel = (type: 'add' | 'update' | 'delete') => {
    switch (type) {
      case 'add':
        return { text: '新增', color: 'text-green-700 dark:text-green-400' };
      case 'update':
        return { text: '修改', color: 'text-blue-700 dark:text-blue-400' };
      case 'delete':
        return { text: '删除', color: 'text-red-700 dark:text-red-400' };
    }
  };

  // 渲染 Markdown 内容差异
  const renderContentDiff = (blockChange: BlockChange) => {
    const before = blockChange.before?.type === 'markdown' ? blockChange.before.content : '';
    const after = blockChange.after?.type === 'markdown' ? blockChange.after.content : '';

    if (blockChange.type === 'add') {
      return (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
          <div className="text-xs text-green-600 dark:text-green-400 mb-1">+ 新增内容</div>
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
            {after}
          </pre>
        </div>
      );
    }

    if (blockChange.type === 'delete') {
      return (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <div className="text-xs text-red-600 dark:text-red-400 mb-1">- 删除内容</div>
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono line-through opacity-60">
            {before}
          </pre>
        </div>
      );
    }

    // 更新：显示前后对比
    return (
      <div className="space-y-2">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <div className="text-xs text-red-600 dark:text-red-400 mb-1">- 修改前</div>
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
            {before}
          </pre>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
          <div className="text-xs text-green-600 dark:text-green-400 mb-1">+ 修改后</div>
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
            {after}
          </pre>
        </div>
      </div>
    );
  };

  // 渲染节点变更
  const renderNodeChange = (change: NodeChange) => {
    const label = getChangeLabel(change.type);
    const nodeTitle = change.type === 'delete'
      ? version.snapshot.nodes[change.nodeId]?.title || change.nodeId
      : nodes[change.nodeId]?.title || change.nodeId;

    return (
      <div
        key={change.nodeId}
        className={`p-4 rounded-lg border ${getChangeStyle(change.type)} mb-4`}
      >
        {/* 节点标题 */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-sm font-medium ${label.color}`}>
            {label.text}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {nodeTitle}
          </span>
        </div>

        {/* 标题变更 */}
        {change.titleChange && (
          <div className="mb-3 p-2 bg-white/50 dark:bg-black/20 rounded">
            <div className="text-xs text-gray-500 mb-1">标题变更</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="line-through text-red-600 dark:text-red-400">
                {change.titleChange.before}
              </span>
              <span>→</span>
              <span className="text-green-600 dark:text-green-400">
                {change.titleChange.after}
              </span>
            </div>
          </div>
        )}

        {/* 流程类型变更 */}
        {change.flowTypeChange && (
          <div className="mb-3 p-2 bg-white/50 dark:bg-black/20 rounded">
            <div className="text-xs text-gray-500 mb-1">类型变更</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-600 dark:text-red-400">
                {change.flowTypeChange.before}
              </span>
              <span>→</span>
              <span className="text-green-600 dark:text-green-400">
                {change.flowTypeChange.after}
              </span>
            </div>
          </div>
        )}

        {/* 内容块变更 */}
        {change.blockChanges.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500">内容变更 ({change.blockChanges.length})</div>
            {change.blockChanges.map((blockChange) => (
              <div key={blockChange.blockId}>
                {renderContentDiff(blockChange)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              版本变更详情
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {version.summary} · {new Date(version.timestamp).toLocaleString('zh-CN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            ✕
          </button>
        </div>

        {/* 变更列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {version.changes.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              无变更记录
            </div>
          ) : (
            version.changes.map(renderNodeChange)
          )}
        </div>

        {/* AI 元数据（如果有） */}
        {version.aiMetadata && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">AI 生成</span> · 模型: {version.aiMetadata.model}
              {version.aiMetadata.tokensUsed > 0 && ` · Tokens: ${version.aiMetadata.tokensUsed}`}
            </div>
            {version.aiMetadata.prompt && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                提示: {version.aiMetadata.prompt}
              </div>
            )}
          </div>
        )}

        {/* 关闭按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

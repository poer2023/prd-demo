"use client";

import { useCallback } from 'react';
import { useOutlineStore } from '@/stores/outlineStore';
import type { OutlineNode } from '@/lib/outline/types';

// 节点图标
const getNodeIcon = (flowType: OutlineNode['flowType']) => {
  switch (flowType) {
    case 'page':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'action':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'decision':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'subprocess':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
  }
};

interface OutlineNodeItemProps {
  node: OutlineNode;
  depth?: number;
}

function OutlineNodeItem({ node, depth = 0 }: OutlineNodeItemProps) {
  const {
    nodes,
    selectedNodeId,
    expandedNodeIds,
    selectNode,
    toggleNode,
    createNode,
    deleteNode,
  } = useOutlineStore();

  const isSelected = selectedNodeId === node.id;
  const isExpanded = expandedNodeIds.has(node.id);
  const hasChildren = node.childIds.length > 0;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  }, [node.id, selectNode]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNode(node.id);
  }, [node.id, toggleNode]);

  const handleAddChild = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    createNode({
      title: '新节点',
      parentId: node.id,
    });
    // 确保父节点展开
    if (!expandedNodeIds.has(node.id)) {
      toggleNode(node.id);
    }
  }, [node.id, createNode, expandedNodeIds, toggleNode]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定删除 "${node.title}" 吗？`)) {
      deleteNode(node.id);
    }
  }, [node.id, node.title, deleteNode]);

  return (
    <div>
      <div
        className={`group flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : 'hover:bg-[var(--nav-hover)] text-[var(--foreground)]'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {/* 展开/折叠按钮 */}
        <button
          onClick={handleToggle}
          className={`w-5 h-5 flex items-center justify-center mr-1 text-[var(--text-muted)] hover:text-[var(--foreground)] ${
            !hasChildren ? 'invisible' : ''
          }`}
        >
          <svg
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* 节点图标 */}
        <span className="mr-2 text-[var(--text-muted)]">
          {getNodeIcon(node.flowType)}
        </span>

        {/* 节点标题 */}
        <span className="flex-1 text-sm truncate">{node.title}</span>

        {/* 操作按钮（hover 时显示） */}
        <div className="hidden group-hover:flex items-center gap-1">
          <button
            onClick={handleAddChild}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded"
            title="添加子节点"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
            title="删除节点"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 子节点 */}
      {hasChildren && isExpanded && (
        <div>
          {node.childIds.map((childId) => {
            const childNode = nodes[childId];
            return childNode ? (
              <OutlineNodeItem key={childId} node={childNode} depth={depth + 1} />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

interface OutlinePanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function OutlinePanel({ isCollapsed = false, onToggleCollapse }: OutlinePanelProps) {
  const { nodes, rootIds, createNode, expandAll, collapseAll } = useOutlineStore();

  const handleAddRootNode = useCallback(() => {
    createNode({
      title: '新模块',
      parentId: null,
    });
  }, [createNode]);

  // 折叠状态
  if (isCollapsed) {
    return (
      <div className="w-10 h-full flex flex-col items-center py-4 border-r border-[var(--border-color)] bg-[var(--background)]">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md"
          title="展开大纲"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 h-full overflow-hidden flex flex-col border-r border-[var(--border-color)] bg-[var(--background)]">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-medium text-[var(--foreground)]">📋 大纲</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={expandAll}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded"
            title="展开全部"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button
            onClick={collapseAll}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded"
            title="折叠全部"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded"
            title="收起"
          >
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 大纲树 */}
      <div className="flex-1 overflow-y-auto p-2">
        {rootIds.map((id) => {
          const node = nodes[id];
          return node ? <OutlineNodeItem key={id} node={node} /> : null;
        })}
      </div>

      {/* 底部操作栏 */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <button
          onClick={handleAddRootNode}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加节点
        </button>
      </div>
    </aside>
  );
}

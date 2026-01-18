"use client";

import { useCallback } from 'react';
import { useOutlineStore } from '@/stores/outlineStore';
import type { OutlineNode, ContentBlock, MarkdownBlock, InteractionBlock, AcceptanceBlock } from '@/lib/outline/types';

// Markdown 块渲染
function MarkdownBlockRenderer({ block, nodeId }: { block: MarkdownBlock; nodeId: string }) {
  const { updateContentBlock } = useOutlineStore();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContentBlock(nodeId, block.id, { content: e.target.value });
  }, [nodeId, block.id, updateContentBlock]);

  return (
    <div className="mb-6">
      <textarea
        value={block.content}
        onChange={handleChange}
        className="w-full min-h-[150px] p-4 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] font-mono text-sm resize-y focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="输入 Markdown 内容..."
      />
    </div>
  );
}

// 交互说明块渲染
function InteractionBlockRenderer({ block }: { block: InteractionBlock }) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        交互说明
      </h4>
      <div className="space-y-2">
        {block.rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800"
          >
            <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded">
              触发
            </span>
            <span className="text-sm text-[var(--foreground)]">{rule.trigger}</span>
            <svg className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="text-sm text-[var(--foreground)]">{rule.response}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 验收标准块渲染
function AcceptanceBlockRenderer({ block, nodeId }: { block: AcceptanceBlock; nodeId: string }) {
  const { updateContentBlock } = useOutlineStore();

  const handleToggle = useCallback((criterionId: string) => {
    const updatedCriteria = block.criteria.map((c) =>
      c.id === criterionId ? { ...c, completed: !c.completed } : c
    );
    updateContentBlock(nodeId, block.id, { criteria: updatedCriteria });
  }, [nodeId, block.id, block.criteria, updateContentBlock]);

  const completedCount = block.criteria.filter((c) => c.completed).length;

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        验收标准
        <span className="text-xs text-[var(--text-muted)]">
          ({completedCount}/{block.criteria.length})
        </span>
      </h4>
      <div className="space-y-2">
        {block.criteria.map((criterion) => (
          <label
            key={criterion.id}
            className="flex items-center gap-3 p-3 bg-[var(--nav-hover)] rounded-lg cursor-pointer hover:bg-[var(--border-color)] transition"
          >
            <input
              type="checkbox"
              checked={criterion.completed}
              onChange={() => handleToggle(criterion.id)}
              className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
            />
            <span
              className={`text-sm ${
                criterion.completed
                  ? 'text-[var(--text-muted)] line-through'
                  : 'text-[var(--foreground)]'
              }`}
            >
              {criterion.description}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// 原型预览块（占位）
function PrototypeBlockRenderer() {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        原型预览
      </h4>
      <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-8 text-center">
        <div className="text-[var(--text-muted)]">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <p className="text-sm">嵌入式原型编辑器</p>
          <p className="text-xs mt-1">点击添加组件</p>
        </div>
      </div>
    </div>
  );
}

// 内容块渲染器
function ContentBlockRenderer({ block, nodeId }: { block: ContentBlock; nodeId: string }) {
  switch (block.type) {
    case 'markdown':
      return <MarkdownBlockRenderer block={block} nodeId={nodeId} />;
    case 'interaction':
      return <InteractionBlockRenderer block={block} />;
    case 'acceptance':
      return <AcceptanceBlockRenderer block={block} nodeId={nodeId} />;
    case 'prototype':
      return <PrototypeBlockRenderer />;
    default:
      return null;
  }
}

// 节点类型标签
const flowTypeLabels: Record<OutlineNode['flowType'], { label: string; color: string }> = {
  page: { label: '页面', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  action: { label: '操作', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  decision: { label: '决策', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  subprocess: { label: '子流程', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
};

interface ContentAreaProps {
  isFocusMode?: boolean;
  onExitFocus?: () => void;
}

export function ContentArea({ isFocusMode = false, onExitFocus }: ContentAreaProps) {
  const { nodes, selectedNodeId, updateNode, addContentBlock } = useOutlineStore();

  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedNodeId) {
      updateNode({ id: selectedNodeId, title: e.target.value });
    }
  }, [selectedNodeId, updateNode]);

  const handleAddBlock = useCallback((type: ContentBlock['type']) => {
    if (!selectedNodeId) return;

    const blockId = `block_${Date.now()}`;
    let newBlock: ContentBlock;

    switch (type) {
      case 'markdown':
        newBlock = { type: 'markdown', id: blockId, content: '' };
        break;
      case 'interaction':
        newBlock = { type: 'interaction', id: blockId, rules: [] };
        break;
      case 'acceptance':
        newBlock = { type: 'acceptance', id: blockId, criteria: [] };
        break;
      case 'prototype':
        newBlock = { type: 'prototype', id: blockId, components: [] };
        break;
      default:
        return;
    }

    addContentBlock(selectedNodeId, newBlock);
  }, [selectedNodeId, addContentBlock]);

  // 无选中节点时的空状态
  if (!selectedNode) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center text-[var(--text-muted)]">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>选择一个节点查看详情</p>
          <p className="text-sm mt-1">从左侧大纲中选择</p>
        </div>
      </div>
    );
  }

  const typeInfo = flowTypeLabels[selectedNode.flowType];

  return (
    <div className={`flex-1 overflow-y-auto ${isFocusMode ? 'px-16 py-8' : 'px-8 py-6'}`}>
      <div className={`${isFocusMode ? 'max-w-4xl mx-auto' : ''}`}>
        {/* 聚焦模式退出按钮 */}
        {isFocusMode && onExitFocus && (
          <button
            onClick={onExitFocus}
            className="fixed top-24 right-8 flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] bg-[var(--background)] border border-[var(--border-color)] rounded-lg shadow-sm hover:shadow transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            退出聚焦
          </button>
        )}

        {/* 节点头部 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-0.5 text-xs rounded ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              更新于 {new Date(selectedNode.updatedAt).toLocaleString('zh-CN')}
            </span>
          </div>
          <input
            type="text"
            value={selectedNode.title}
            onChange={handleTitleChange}
            className="text-2xl font-semibold text-[var(--foreground)] bg-transparent border-none outline-none w-full focus:ring-0"
            placeholder="节点标题"
          />
        </div>

        {/* 内容块列表 */}
        <div className="space-y-4">
          {selectedNode.contentBlocks.map((block) => (
            <ContentBlockRenderer key={block.id} block={block} nodeId={selectedNode.id} />
          ))}
        </div>

        {/* 添加内容块按钮 */}
        <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-muted)] mb-3">添加内容块</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAddBlock('markdown')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] bg-[var(--nav-hover)] hover:bg-[var(--border-color)] rounded-md transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              文本/Markdown
            </button>
            <button
              onClick={() => handleAddBlock('prototype')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] bg-[var(--nav-hover)] hover:bg-[var(--border-color)] rounded-md transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              原型组件
            </button>
            <button
              onClick={() => handleAddBlock('interaction')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] bg-[var(--nav-hover)] hover:bg-[var(--border-color)] rounded-md transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              交互说明
            </button>
            <button
              onClick={() => handleAddBlock('acceptance')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] bg-[var(--nav-hover)] hover:bg-[var(--border-color)] rounded-md transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              验收标准
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

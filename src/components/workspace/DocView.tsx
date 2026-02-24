"use client";

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useOutlineStore } from '@/stores/outlineStore';
import type { OutlineNode, ContentBlock, MarkdownBlock, InteractionBlock, AcceptanceBlock, PrototypeRefBlock as PrototypeRefBlockType, DocRefBlock as DocRefBlockType } from '@/lib/outline/types';
import { PrototypeRefBlock } from '@/components/blocks/PrototypeRefBlock';
import { DocRefBlock } from '@/components/blocks/DocRefBlock';

// 动态导入 Tiptap 编辑器避免 SSR 问题
const TiptapEditor = dynamic(
  () => import('@/components/editor/TiptapEditor').then(mod => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-32 bg-[var(--nav-hover)] rounded-lg" />
    ),
  }
);

// 动态导入 Markdown 渲染器（支持 Mermaid）
const MarkdownRenderer = dynamic(
  () => import('@/components/editor/MarkdownRenderer').then(mod => mod.MarkdownRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-32 bg-[var(--nav-hover)] rounded-lg" />
    ),
  }
);

interface DocViewProps {
  mode: 'full' | 'summary';
  nodeId?: string;
  onClose?: () => void;
}

// Node type labels for display
const flowTypeLabels: Record<OutlineNode['flowType'], { label: string; color: string }> = {
  page: { label: '页面', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  action: { label: '操作', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  decision: { label: '决策', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  subprocess: { label: '子流程', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
};

// Markdown block renderer - 支持查看和编辑模式
function MarkdownBlockRenderer({ block, nodeId }: { block: MarkdownBlock; nodeId: string }) {
  const { updateContentBlock } = useOutlineStore();
  const { isLoggedIn } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [rawContent, setRawContent] = useState(block.content);

  // 同步外部内容变化
  useCallback(() => {
    if (!isEditing) {
      setRawContent(block.content);
    }
  }, [block.content, isEditing]);

  const handleSave = useCallback(() => {
    updateContentBlock(nodeId, block.id, { content: rawContent });
    setIsEditing(false);
  }, [nodeId, block.id, rawContent, updateContentBlock]);

  const handleCancel = useCallback(() => {
    setRawContent(block.content);
    setIsEditing(false);
  }, [block.content]);

  // 检测内容是否包含 mermaid 代码块
  const hasMermaid = block.content.includes('```mermaid');

  // 编辑模式：对于包含 Mermaid 的内容，使用纯文本编辑器保持原始 Markdown
  if (isEditing) {
    if (hasMermaid) {
      // 使用纯文本编辑器编辑原始 Markdown
      return (
        <div className="mb-4">
          <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
            <div className="bg-[var(--nav-hover)] px-3 py-2 text-xs text-[var(--text-muted)] flex items-center justify-between">
              <span>Markdown 源码编辑</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 text-[var(--text-muted)] hover:text-[var(--foreground)] transition"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  保存
                </button>
              </div>
            </div>
            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              className="w-full h-64 p-4 bg-[var(--background)] text-[var(--foreground)] font-mono text-sm resize-y outline-none"
              placeholder="输入 Markdown 内容..."
            />
          </div>
        </div>
      );
    }

    // 普通内容使用 TiptapEditor
    return (
      <div className="mb-4 relative group">
        <TiptapEditor
          content={block.content}
          onChange={(content) => updateContentBlock(nodeId, block.id, { content })}
          placeholder="输入内容，选中文字显示格式工具栏..."
        />
        <button
          onClick={() => setIsEditing(false)}
          className="absolute top-2 right-2 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] bg-[var(--background)] border border-[var(--border-color)] rounded opacity-0 group-hover:opacity-100 transition"
        >
          完成
        </button>
      </div>
    );
  }

  // 查看模式
  return (
    <div className="mb-4 relative group">
      {hasMermaid ? (
        // Mermaid 内容：编辑按钮在 MermaidBlock 组件内部显示
        <MarkdownRenderer
          content={block.content}
          className="prose-content"
          isLoggedIn={isLoggedIn}
          onEditMermaid={isLoggedIn ? () => setIsEditing(true) : undefined}
        />
      ) : (
        // 普通内容：登录状态下点击进入编辑
        <div onClick={isLoggedIn ? () => setIsEditing(true) : undefined} className={isLoggedIn ? "cursor-text" : ""}>
          <TiptapEditor
            content={block.content}
            onChange={(content) => {
              if (!isLoggedIn) return;
              updateContentBlock(nodeId, block.id, { content });
            }}
            placeholder="输入内容，选中文字显示格式工具栏..."
            editable={isLoggedIn}
          />
          {isLoggedIn && (
            <div className="absolute top-2 right-2 px-2 py-1 text-xs text-[var(--text-muted)] bg-[var(--background)] border border-[var(--border-color)] rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
              点击编辑
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 交互说明块渲染
function InteractionBlockRenderer({ block, nodeId }: { block: InteractionBlock; nodeId: string }) {
  const { updateContentBlock } = useOutlineStore();

  const handleAddRule = useCallback(() => {
    const newRule = {
      id: `rule_${Date.now()}`,
      trigger: '',
      response: '',
    };
    updateContentBlock(nodeId, block.id, {
      rules: [...block.rules, newRule],
    });
  }, [nodeId, block.id, block.rules, updateContentBlock]);

  const handleUpdateRule = useCallback((ruleId: string, field: 'trigger' | 'response', value: string) => {
    const updatedRules = block.rules.map(rule =>
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    );
    updateContentBlock(nodeId, block.id, { rules: updatedRules });
  }, [nodeId, block.id, block.rules, updateContentBlock]);

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        交互说明
      </h4>
      <div className="space-y-3">
        {block.rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800"
          >
            <input
              type="text"
              value={rule.trigger}
              onChange={(e) => handleUpdateRule(rule.id, 'trigger', e.target.value)}
              placeholder="触发条件..."
              className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <svg className="w-4 h-4 text-purple-400 flex-shrink-0 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <input
              type="text"
              value={rule.response}
              onChange={(e) => handleUpdateRule(rule.id, 'response', e.target.value)}
              placeholder="响应行为..."
              className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        ))}
        <button
          onClick={handleAddRule}
          className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
        >
          + 添加交互规则
        </button>
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

  const handleAddCriterion = useCallback(() => {
    const newCriterion = {
      id: `ac_${Date.now()}`,
      description: '',
      completed: false,
    };
    updateContentBlock(nodeId, block.id, {
      criteria: [...block.criteria, newCriterion],
    });
  }, [nodeId, block.id, block.criteria, updateContentBlock]);

  const handleUpdateDescription = useCallback((criterionId: string, description: string) => {
    const updatedCriteria = block.criteria.map((c) =>
      c.id === criterionId ? { ...c, description } : c
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
            <input
              type="text"
              value={criterion.description}
              onChange={(e) => handleUpdateDescription(criterion.id, e.target.value)}
              placeholder="输入验收标准..."
              className={`flex-1 bg-transparent border-none outline-none text-sm ${
                criterion.completed
                  ? 'text-[var(--text-muted)] line-through'
                  : 'text-[var(--foreground)]'
              }`}
            />
          </label>
        ))}
        <button
          onClick={handleAddCriterion}
          className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 pl-3"
        >
          + 添加验收标准
        </button>
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

// 原型引用块渲染器
function PrototypeRefBlockRenderer({ block }: { block: PrototypeRefBlockType }) {
  return (
    <div className="mb-6">
      <PrototypeRefBlock
        prototypeId={block.prototypeId}
        title={block.title}
        thumbnail={block.thumbnail}
      />
    </div>
  );
}

// 文档引用块渲染器
function DocRefBlockRenderer({ block }: { block: DocRefBlockType }) {
  return (
    <div className="mb-6">
      <DocRefBlock
        docId={block.docId}
        title={block.title}
        excerpt={block.excerpt}
      />
    </div>
  );
}

// 内容块渲染器
function ContentBlockRenderer({ block, nodeId }: { block: ContentBlock; nodeId: string }) {
  switch (block.type) {
    case 'markdown':
      return <MarkdownBlockRenderer block={block} nodeId={nodeId} />;
    case 'interaction':
      return <InteractionBlockRenderer block={block} nodeId={nodeId} />;
    case 'acceptance':
      return <AcceptanceBlockRenderer block={block} nodeId={nodeId} />;
    case 'prototype':
      return <PrototypeBlockRenderer />;
    case 'prototype-ref':
      return <PrototypeRefBlockRenderer block={block} />;
    case 'doc-ref':
      return <DocRefBlockRenderer block={block} />;
    default:
      return null;
  }
}

// Summary view - shows title and first paragraph excerpt
function DocSummaryView({ node }: { node: OutlineNode }) {
  const typeInfo = flowTypeLabels[node.flowType];

  // Extract first paragraph from markdown content
  const excerpt = useMemo(() => {
    const markdownBlock = node.contentBlocks.find(b => b.type === 'markdown') as MarkdownBlock | undefined;
    if (!markdownBlock?.content) return '';

    // Get first non-empty line that's not a heading
    const lines = markdownBlock.content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        return trimmed.length > 100 ? trimmed.slice(0, 100) + '...' : trimmed;
      }
    }
    return '';
  }, [node.contentBlocks]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 text-xs rounded ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 line-clamp-2">
        {node.title}
      </h3>
      {excerpt && (
        <p className="text-sm text-[var(--text-muted)] line-clamp-3">
          {excerpt}
        </p>
      )}
      <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-muted)]">
        <span>{node.contentBlocks.length} 个内容块</span>
        <span>更新于 {new Date(node.updatedAt).toLocaleDateString('zh-CN')}</span>
      </div>
    </div>
  );
}

// Full view - shows complete editable content with Notion-like editing
function DocFullView({ node, onClose }: { node: OutlineNode; onClose?: () => void }) {
  const { updateNode, addContentBlock } = useOutlineStore();

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode({ id: node.id, title: e.target.value });
  }, [node.id, updateNode]);

  const handleAddBlock = useCallback((type: ContentBlock['type']) => {
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
      case 'prototype-ref':
        newBlock = {
          type: 'prototype-ref',
          id: blockId,
          prototypeId: 'login-v2',
          title: '登录页原型'
        };
        break;
      default:
        return;
    }

    addContentBlock(node.id, newBlock);
  }, [node.id, addContentBlock]);

  return (
    <div className="h-full relative">
      <div className="max-w-3xl mx-auto px-8 py-6">
        {/* Close button for split mode */}
        {onClose && (
          <button
            onClick={onClose}
            className="fixed top-28 right-8 flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] bg-[var(--background)] border border-[var(--border-color)] rounded-lg shadow-sm hover:shadow transition z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            关闭
          </button>
        )}

        {/* Node title - Notion style, no header bar */}
        <div className="mb-8">
          <input
            type="text"
            value={node.title}
            onChange={handleTitleChange}
            className="text-3xl font-bold text-[var(--foreground)] bg-transparent border-none outline-none w-full focus:ring-0 placeholder:text-[var(--text-muted)]"
            placeholder="无标题"
          />
        </div>

        {/* Content blocks - Notion style */}
        <div className="space-y-1">
          {node.contentBlocks.map((block) => (
            <ContentBlockRenderer key={block.id} block={block} nodeId={node.id} />
          ))}
        </div>

        {/* Add content block - subtle hover menu */}
        <div className="mt-8 group">
          <div className="flex items-center gap-2 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleAddBlock('markdown')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加文本
            </button>
            <button
              onClick={() => handleAddBlock('interaction')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md transition"
            >
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              交互说明
            </button>
            <button
              onClick={() => handleAddBlock('acceptance')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md transition"
            >
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              验收标准
            </button>
            <button
              onClick={() => handleAddBlock('prototype-ref')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md transition"
            >
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              原型引用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocView({ mode, nodeId, onClose }: DocViewProps) {
  const { nodes, selectedNodeId } = useOutlineStore();

  // Use provided nodeId or fall back to selected node from store
  const targetNodeId = nodeId ?? selectedNodeId;
  const node = targetNodeId ? nodes[targetNodeId] : null;

  // Empty state when no node is selected
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center">
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

  return (
    <div className="h-full relative bg-[var(--background)]">
      {mode === 'summary' ? (
        <DocSummaryView node={node} />
      ) : (
        <DocFullView node={node} onClose={onClose} />
      )}
    </div>
  );
}

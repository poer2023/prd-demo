"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { FloatingChat } from '@/components/chat/FloatingChat';
import { SplitPane } from '@/components/workspace/SplitPane';
import { DocView } from '@/components/workspace/DocView';
import { PrototypeView } from '@/components/workspace/PrototypeView';
import { CommandPanel } from '@/components/ai/CommandPanel';
import { ChangePreview } from '@/components/ai/ChangePreview';
import { VersionTimeline } from '@/components/version/VersionTimeline';
import { DiffViewer } from '@/components/version/DiffViewer';
import { SyncIndicator } from '@/components/prototype/SyncIndicator';
import { useOutlineStore } from '@/stores/outlineStore';
import { useSplitStore } from '@/stores/splitStore';
import { useChatStore } from '@/stores/chatStore';
import { prototypeSyncService } from '@/lib/prototype/sync-service';
import type { AIEditResult } from '@/lib/ai-doc/types';
import type { Version } from '@/lib/version/types';

export default function WorkspacePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPanelOpen, setIsCommandPanelOpen] = useState(false);
  const [isVersionTimelineOpen, setIsVersionTimelineOpen] = useState(false);
  const [changePreviewResult, setChangePreviewResult] = useState<AIEditResult | null>(null);
  const [diffViewerVersion, setDiffViewerVersion] = useState<Version | null>(null);

  const {
    nodes,
    rootIds,
    selectedNodeId,
    updateContentBlock
  } = useOutlineStore();

  const {
    workspaceView,
    splitState,
    setLeftRatio,
    closeSplit,
  } = useSplitStore();

  const { openEditPreview } = useChatStore();

  // 监听文档变化，触发原型同步
  useEffect(() => {
    // 当节点变化时触发同步
    const nodeIds = Object.keys(nodes);
    if (nodeIds.length > 0) {
      // 只在有变化时同步（这里简化处理，实际应该比较前后状态）
      // prototypeSyncService.onDocumentChange(nodeIds, nodes);
    }
  }, [nodes]);

  // 处理 AI 插入内容
  const handleInsertContent = useCallback((content: string) => {
    if (selectedNodeId) {
      const node = nodes[selectedNodeId];
      if (node && node.contentBlocks.length > 0) {
        const firstMarkdownBlock = node.contentBlocks.find(b => b.type === 'markdown');
        if (firstMarkdownBlock) {
          updateContentBlock(selectedNodeId, firstMarkdownBlock.id, {
            content: (firstMarkdownBlock as { content: string }).content + '\n\n' + content
          });
        }
      }
    }
  }, [selectedNodeId, nodes, updateContentBlock]);

  // 获取当前选中节点的内容用于 AI 上下文
  const existingContent = useMemo(() => {
    if (!selectedNodeId) return '';
    const node = nodes[selectedNodeId];
    if (!node) return '';
    return node.contentBlocks
      .filter(b => b.type === 'markdown')
      .map(b => (b as { content: string }).content)
      .join('\n\n');
  }, [selectedNodeId, nodes]);

  // 根据 ratio 决定显示模式
  const getPrototypeMode = useCallback((isLeft: boolean): 'full' | 'thumbnail' => {
    if (isLeft && splitState.leftRatio < 0.3) return 'thumbnail';
    if (!isLeft && splitState.leftRatio > 0.7) return 'thumbnail';
    return 'full';
  }, [splitState.leftRatio]);

  // 渲染分屏左侧内容
  const renderLeftContent = useCallback(() => {
    if (splitState.leftContent === 'doc') {
      return <DocView mode="full" />;
    } else {
      return (
        <PrototypeView
          mode={getPrototypeMode(true)}
          prototypeId={splitState.activeBlockId}
          onClose={closeSplit}
        />
      );
    }
  }, [splitState, getPrototypeMode, closeSplit]);

  // 渲染分屏右侧内容
  const renderRightContent = useCallback(() => {
    if (splitState.rightContent === 'prototype') {
      return (
        <PrototypeView
          mode={getPrototypeMode(false)}
          prototypeId={splitState.activeBlockId}
          onClose={closeSplit}
        />
      );
    } else {
      return <DocView mode="full" />;
    }
  }, [splitState, getPrototypeMode, closeSplit]);

  // 打开变更预览
  const handleOpenChangePreview = useCallback((result: AIEditResult) => {
    setChangePreviewResult(result);
    openEditPreview(result.instructions, result.summary);
  }, [openEditPreview]);

  // 关闭变更预览
  const handleCloseChangePreview = useCallback(() => {
    setChangePreviewResult(null);
  }, []);

  // 应用变更后的回调
  const handleApplyChanges = useCallback(() => {
    // 触发原型同步
    const affectedIds = changePreviewResult?.affectedNodeIds || [];
    if (affectedIds.length > 0) {
      prototypeSyncService.onDocumentChange(affectedIds, nodes);
    }
  }, [changePreviewResult, nodes]);

  // 查看版本差异
  const handleViewDiff = useCallback((version: Version) => {
    setDiffViewerVersion(version);
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K 打开 AI 面板
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPanelOpen((prev) => !prev);
      }
      // Cmd/Ctrl + H 打开版本历史
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setIsVersionTimelineOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header 包含视图切换器 */}
      <Header projectName="Workspace" showViewSwitcher={true} />

      {/* 主体布局 */}
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        {/* 左侧边栏：页面列表 + 文档大纲 */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* 文档模式：文档内容居中 */}
        {workspaceView === 'doc' && (
          <main className="flex-1 min-w-0 overflow-y-auto pb-[400px]">
            <DocView mode="full" />
          </main>
        )}

        {/* 原型模式：全屏原型编辑器 */}
        {workspaceView === 'prototype' && (
          <main className="flex-1 min-w-0 overflow-hidden pb-[400px]">
            <PrototypeView mode="full" />
          </main>
        )}

        {/* 对照模式：分屏视图 */}
        {workspaceView === 'split' && (
          <main className="flex-1 min-w-0 overflow-hidden pb-[400px]">
            <SplitPane
              leftRatio={splitState.leftRatio}
              onRatioChange={setLeftRatio}
              leftContent={renderLeftContent()}
              rightContent={renderRightContent()}
            />
          </main>
        )}
      </div>

      {/* 版本历史按钮 */}
      <button
        onClick={() => setIsVersionTimelineOpen(true)}
        className="fixed right-4 top-20 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2 z-30"
        title="版本历史 (Cmd+H)"
      >
        <span>📜</span>
        <span className="hidden sm:inline">版本历史</span>
      </button>

      {/* AI 命令面板（底部抽屉） */}
      <CommandPanel
        isOpen={isCommandPanelOpen}
        onToggle={() => setIsCommandPanelOpen(!isCommandPanelOpen)}
        onOpenChangePreview={handleOpenChangePreview}
      />

      {/* 变更预览对话框 */}
      <ChangePreview
        isOpen={changePreviewResult !== null}
        result={changePreviewResult}
        onClose={handleCloseChangePreview}
        onApply={handleApplyChanges}
      />

      {/* 版本时间线（右侧抽屉） */}
      <VersionTimeline
        isOpen={isVersionTimelineOpen}
        onClose={() => setIsVersionTimelineOpen(false)}
        onViewDiff={handleViewDiff}
      />

      {/* Diff 查看器 */}
      <DiffViewer
        isOpen={diffViewerVersion !== null}
        version={diffViewerVersion}
        onClose={() => setDiffViewerVersion(null)}
      />

      {/* 原型同步指示器 */}
      <SyncIndicator />

      {/* 浮动 AI 聊天（可选，保留原有功能） */}
      {!isCommandPanelOpen && (
        <FloatingChat
          onInsertContent={selectedNodeId ? handleInsertContent : undefined}
          existingContent={existingContent}
        />
      )}
    </div>
  );
}

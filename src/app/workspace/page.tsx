"use client";

import { useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { FloatingChat } from '@/components/chat/FloatingChat';
import { SplitPane } from '@/components/workspace/SplitPane';
import { DocView } from '@/components/workspace/DocView';
import { PrototypeView } from '@/components/workspace/PrototypeView';
import { useOutlineStore } from '@/stores/outlineStore';
import { useSplitStore } from '@/stores/splitStore';

export default function WorkspacePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const {
    nodes,
    selectedNodeId,
    updateContentBlock
  } = useOutlineStore();

  const {
    workspaceView,
    splitState,
    setLeftRatio,
    closeSplit,
  } = useSplitStore();

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
          <main className="flex-1 min-w-0 overflow-y-auto">
            <DocView mode="full" />
          </main>
        )}

        {/* 原型模式：全屏原型编辑器 */}
        {workspaceView === 'prototype' && (
          <main className="flex-1 min-w-0 overflow-hidden">
            <PrototypeView mode="full" />
          </main>
        )}

        {/* 对照模式：分屏视图 */}
        {workspaceView === 'split' && (
          <main className="flex-1 min-w-0 overflow-hidden">
            <SplitPane
              leftRatio={splitState.leftRatio}
              onRatioChange={setLeftRatio}
              leftContent={renderLeftContent()}
              rightContent={renderRightContent()}
            />
          </main>
        )}
      </div>

      {/* 浮动 AI 聊天 */}
      <FloatingChat
        onInsertContent={selectedNodeId ? handleInsertContent : undefined}
        existingContent={existingContent}
      />
    </div>
  );
}

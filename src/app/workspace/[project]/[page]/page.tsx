"use client";

import { use, useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { SplitPane } from '@/components/workspace/SplitPane';
import { FloatingChat } from '@/components/chat/FloatingChat';
import { CommandPanel } from '@/components/ai/CommandPanel';
import { ChangePreview } from '@/components/ai/ChangePreview';
import { VersionTimeline } from '@/components/version/VersionTimeline';
import { DiffViewer } from '@/components/version/DiffViewer';
import { SyncIndicator } from '@/components/prototype/SyncIndicator';
import { findPageConfig } from '@/config/docs';
import { getDocSource } from '@/config/doc-sources';
import { useOutlineStore } from '@/stores/outlineStore';
import { useChatStore } from '@/stores/chatStore';
import { prototypeSyncService } from '@/lib/prototype/sync-service';
import type { AIEditResult } from '@/lib/ai-doc/types';
import type { Version } from '@/lib/version/types';

// 动态导入 Markdown 渲染器
const MarkdownRenderer = dynamic(
  () => import('@/components/editor/MarkdownRenderer').then(mod => mod.MarkdownRenderer),
  { ssr: false, loading: () => <div className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
);

// 动态导入 EssayPass 原型组件
const EssayPassPrototype = dynamic(
  () => import('@/components/prototypes/essaypass/EssayPassPrototype'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
);

// EssayPass 表单页原型
const EssayFormPage = dynamic(
  () => import('@/components/prototypes/essaypass/EssayFormPage'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
);

// EssayPass 待支付页原型
const OrderConfirmationPage = dynamic(
  () => import('@/components/prototypes/essaypass/OrderConfirmationPage'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
);

// EssayPass Hero 区域原型
const HeroPage = dynamic(
  () => import('@/components/prototypes/essaypass/HeroPage'),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
);

// 动态导入 C2ME 的 DocView 组件（使用 outlineStore）
const DocView = dynamic(
  () => import('@/components/workspace/DocView').then(mod => mod.DocView),
  { ssr: false, loading: () => <div className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
);

// 动态导入 C2ME 的原型视图
const PrototypeView = dynamic(
  () => import('@/components/workspace/PrototypeView').then(mod => mod.PrototypeView),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
);

type ViewMode = 'doc' | 'prototype' | 'split';
type PrototypeMode = 'static' | 'runtime';

interface WorkspacePageProps {
  params: Promise<{
    project: string;
    page: string;
  }>;
}

// C2ME 页面 slug 到 outlineStore nodeId 的映射
const c2mePageToNodeId: Record<string, string> = {
  'overview': 'node_overview',
  'telegram': 'node_telegram',
  'commands': 'node_commands',
  'messages': 'node_messages',
  'permissions': 'node_permissions',
  'project': 'node_project',
  'filebrowser': 'node_filebrowser',
  'desktop': 'node_desktop',
  'metrics': 'node_metrics',
  'simulator': 'node_simulator',
  'workers': 'node_workers',
};

// EssayPass 文档视图 - 从 Obsidian 读取 Markdown
function EssayPassDocView({ project, page }: { project: string; page: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);

  const pageConfig = findPageConfig(project, page);
  const docSource = getDocSource(project, page);

  useEffect(() => {
    async function fetchDoc() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/doc?project=${project}&page=${page}`);
        const data = await res.json();

        if (res.ok && data.content) {
          setContent(data.content);
          setFilePath(data.filePath);
        } else {
          setError(data.error || '文档未找到');
          setContent(null);
        }
      } catch {
        setError('加载文档失败');
        setContent(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDoc();
  }, [project, page]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            {pageConfig?.title || page}
          </h1>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 mb-2">
              {error || '文档未找到'}
            </p>
            {docSource && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                预期路径: {docSource.docPath}
              </p>
            )}
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              请在 Obsidian 中创建对应的 Markdown 文档
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-6">
        {/* 文件路径提示 */}
        {filePath && (
          <div className="mb-4 text-xs text-[var(--muted-foreground)] flex items-center gap-2">
            <span>📄</span>
            <span className="truncate">{filePath}</span>
          </div>
        )}

        {/* Markdown 内容 */}
        <div className="prose dark:prose-invert max-w-none">
          <MarkdownRenderer content={content} className="prose-content" />
        </div>
      </div>
    </div>
  );
}

// C2ME 文档视图包装器 - 同步 nodeId 到 outlineStore
function C2MEDocView({ page }: { page: string }) {
  const { selectNode } = useOutlineStore();
  const nodeId = c2mePageToNodeId[page] || 'node_overview';

  // 当页面变化时，同步选中状态到 outlineStore
  useEffect(() => {
    selectNode(nodeId);
  }, [nodeId, selectNode]);

  return (
    <div className="h-full overflow-y-auto">
      <DocView mode="full" nodeId={nodeId} />
    </div>
  );
}

// 统一的文档视图 - 根据项目类型选择
function DocContentView({ project, page }: { project: string; page: string }) {
  // C2ME 项目使用 outlineStore
  if (project === 'c2me') {
    return <C2MEDocView page={page} />;
  }

  // EssayPass 项目使用 Obsidian Markdown
  if (project === 'essaypass') {
    return <EssayPassDocView project={project} page={page} />;
  }

  // 其他项目显示占位
  const pageConfig = findPageConfig(project, page);
  return (
    <div className="h-full flex items-center justify-center text-[var(--muted-foreground)]">
      <div className="text-center">
        <p className="text-lg mb-2">{pageConfig?.title || page}</p>
        <p className="text-sm">文档开发中...</p>
      </div>
    </div>
  );
}

// 统一的原型视图 - 根据项目类型选择
function PrototypeContentView({
  project,
  page,
  prototypeMode,
}: {
  project: string;
  page: string;
  prototypeMode: PrototypeMode;
}) {
  // C2ME 项目使用 PrototypeView，根据页面推断原型ID
  if (project === 'c2me') {
    // 页面到原型ID的映射
    const pageToPrototypeId: Record<string, string> = {
      'commands': 'telegram-commands',
      'messages': 'telegram-messages',
      'permissions': 'telegram-permissions',
      'project': 'telegram-project',
      'filebrowser': 'telegram-filebrowser',
      'metrics': 'desktop-metrics',
      'simulator': 'desktop-simulator',
    };

    const staticPrototypeId = pageToPrototypeId[page];
    const runtimeNodeId = c2mePageToNodeId[page] || 'node_overview';
    const prototypeId = prototypeMode === 'runtime' ? `runtime:${runtimeNodeId}` : staticPrototypeId;

    return (
      <div className="h-full">
        <PrototypeView mode="full" prototypeId={prototypeId} />
      </div>
    );
  }

  // EssayPass 项目 - 根据页面显示对应原型
  if (project === 'essaypass') {
    // 页面到原型组件的映射
    switch (page) {
      case 'hero':
        return <div className="h-full"><HeroPage /></div>;
      case 'essay-form':
        return <div className="h-full"><EssayFormPage /></div>;
      case 'order-confirmation':
        return <div className="h-full"><OrderConfirmationPage /></div>;
      default:
        // 其他页面显示完整原型
        return <div className="h-full"><EssayPassPrototype /></div>;
    }
  }

  // 其他项目显示占位
  const pageConfig = findPageConfig(project, page);
  return (
    <div className="h-full flex items-center justify-center text-[var(--muted-foreground)]">
      <div className="text-center">
        <p className="text-lg mb-2">{pageConfig?.title || page}</p>
        <p className="text-sm">原型开发中...</p>
      </div>
    </div>
  );
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const { project, page } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOutlineDrivenProject = project === 'c2me';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isCommandPanelOpen, setIsCommandPanelOpen] = useState(false);
  const [isVersionTimelineOpen, setIsVersionTimelineOpen] = useState(false);
  const [changePreviewResult, setChangePreviewResult] = useState<AIEditResult | null>(null);
  const [diffViewerVersion, setDiffViewerVersion] = useState<Version | null>(null);

  const { nodes, selectedNodeId, updateContentBlock } = useOutlineStore();
  const { openEditPreview } = useChatStore();

  // 从 URL query 获取视图模式，默认为 doc
  const viewFromUrl = (searchParams.get('view') as ViewMode) || 'doc';
  const currentView = viewFromUrl;
  const prototypeMode = (searchParams.get('proto') as PrototypeMode) || 'static';

  const handlePrototypeModeChange = useCallback((mode: PrototypeMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === 'static') {
      params.delete('proto');
    } else {
      params.set('proto', mode);
    }

    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(nextUrl);
  }, [pathname, router, searchParams]);

  const existingContent = useMemo(() => {
    if (!selectedNodeId) return '';
    const node = nodes[selectedNodeId];
    if (!node) return '';
    return node.contentBlocks
      .filter((block) => block.type === 'markdown')
      .map((block) => (block as { content: string }).content)
      .join('\n\n');
  }, [selectedNodeId, nodes]);

  const handleInsertContent = useCallback((content: string) => {
    if (!selectedNodeId) return;
    const node = nodes[selectedNodeId];
    if (!node) return;

    const firstMarkdownBlock = node.contentBlocks.find((block) => block.type === 'markdown');
    if (!firstMarkdownBlock) return;

    updateContentBlock(selectedNodeId, firstMarkdownBlock.id, {
      content: (firstMarkdownBlock as { content: string }).content + '\n\n' + content,
    });
  }, [selectedNodeId, nodes, updateContentBlock]);

  const handleOpenChangePreview = useCallback((result: AIEditResult) => {
    setChangePreviewResult(result);
    openEditPreview(result.instructions, result.summary);
  }, [openEditPreview]);

  const handleCloseChangePreview = useCallback(() => {
    setChangePreviewResult(null);
  }, []);

  const handleApplyChanges = useCallback(() => {
    const affectedIds = changePreviewResult?.affectedNodeIds || [];
    if (affectedIds.length > 0) {
      prototypeSyncService.onDocumentChange(affectedIds, nodes);
    }
  }, [changePreviewResult, nodes]);

  const handleViewDiff = useCallback((version: Version) => {
    setDiffViewerVersion(version);
  }, []);

  useEffect(() => {
    if (!isOutlineDrivenProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPanelOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setIsVersionTimelineOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOutlineDrivenProject]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <Header projectName={project} showViewSwitcher={true} />

      {/* 主体布局 */}
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        {/* 左侧边栏 */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          projectSlug={project}
        />

        {/* 文档模式 */}
        {currentView === 'doc' && (
          <main className="flex-1 min-w-0 overflow-hidden">
            <DocContentView project={project} page={page} />
          </main>
        )}

        {/* 原型模式 */}
        {currentView === 'prototype' && (
          <main className="flex-1 min-w-0 overflow-auto">
            <PrototypeContentView project={project} page={page} prototypeMode={prototypeMode} />
          </main>
        )}

        {/* 对照模式 */}
        {currentView === 'split' && (
          <main className="flex-1 min-w-0 overflow-hidden">
            <SplitPane
              leftRatio={splitRatio}
              onRatioChange={setSplitRatio}
              leftContent={<DocContentView project={project} page={page} />}
              rightContent={<PrototypeContentView project={project} page={page} prototypeMode={prototypeMode} />}
            />
          </main>
        )}
      </div>

      {isOutlineDrivenProject && (currentView === 'prototype' || currentView === 'split') && (
        <div className="fixed right-4 top-36 z-30 flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => handlePrototypeModeChange('static')}
            className={`px-3 py-1.5 text-xs rounded-md transition ${
              prototypeMode === 'static'
                ? 'bg-[var(--nav-hover)] text-[var(--foreground)]'
                : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
            }`}
            title="使用手写静态原型组件"
          >
            Static
          </button>
          <button
            onClick={() => handlePrototypeModeChange('runtime')}
            className={`px-3 py-1.5 text-xs rounded-md transition ${
              prototypeMode === 'runtime'
                ? 'bg-[var(--nav-hover)] text-[var(--foreground)]'
                : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
            }`}
            title="使用 PRD -> ProtoSpec -> Runtime 渲染"
          >
            Runtime
          </button>
        </div>
      )}

      {isOutlineDrivenProject && (
        <button
          onClick={() => setIsVersionTimelineOpen(true)}
          className="fixed right-4 top-20 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2 z-30"
          title="版本历史 (Cmd+H)"
        >
          <span>📜</span>
          <span className="hidden sm:inline">版本历史</span>
        </button>
      )}

      {isOutlineDrivenProject && (
        <CommandPanel
          isOpen={isCommandPanelOpen}
          onToggle={() => setIsCommandPanelOpen(!isCommandPanelOpen)}
          onOpenChangePreview={handleOpenChangePreview}
        />
      )}

      {isOutlineDrivenProject && (
        <ChangePreview
          isOpen={changePreviewResult !== null}
          result={changePreviewResult}
          onClose={handleCloseChangePreview}
          onApply={handleApplyChanges}
        />
      )}

      {isOutlineDrivenProject && (
        <VersionTimeline
          isOpen={isVersionTimelineOpen}
          onClose={() => setIsVersionTimelineOpen(false)}
          onViewDiff={handleViewDiff}
        />
      )}

      {isOutlineDrivenProject && (
        <DiffViewer
          isOpen={diffViewerVersion !== null}
          version={diffViewerVersion}
          onClose={() => setDiffViewerVersion(null)}
        />
      )}

      {isOutlineDrivenProject && <SyncIndicator />}

      {(!isOutlineDrivenProject || !isCommandPanelOpen) && (
        <FloatingChat
          onInsertContent={isOutlineDrivenProject && selectedNodeId ? handleInsertContent : undefined}
          existingContent={isOutlineDrivenProject ? existingContent : undefined}
        />
      )}
    </div>
  );
}

"use client";

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useOutlineStore } from '@/stores/outlineStore';
import { getNavTreeByProject } from '@/config/docs';
import type { OutlineNode } from '@/lib/outline/types';

// 文档大纲缓存 - 避免重复请求
const outlineCache = new Map<string, { level: number; text: string; id: string }[]>();

// 从内容提取标题（支持 Markdown 和 HTML 格式）
// 跳过第一个 H1 标题（因为页面顶部已有标题）
export function extractHeadings(content: string): { level: number; text: string; id: string }[] {
  if (!content) return [];
  const headings: { level: number; text: string; id: string }[] = [];
  let index = 0;
  let firstH1Skipped = false;

  // 尝试从 Markdown 格式提取 (# ## ###)
  const mdMatches = content.matchAll(/^(#{1,3})\s+(.+)$/gm);
  for (const match of mdMatches) {
    const level = match[1].length;
    const text = match[2].trim();

    // 跳过第一个 H1 标题
    if (level === 1 && !firstH1Skipped) {
      firstH1Skipped = true;
      continue;
    }

    headings.push({ level, text, id: `toc-${index}` });
    index++;
  }

  // 如果没有找到 Markdown 标题，尝试从 HTML 格式提取
  if (headings.length === 0 && !firstH1Skipped) {
    const htmlMatches = content.matchAll(/<h([1-3])>(.*?)<\/h\1>/gi);
    for (const match of htmlMatches) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]+>/g, '').trim();

      if (level === 1 && !firstH1Skipped) {
        firstH1Skipped = true;
        continue;
      }

      if (text) {
        headings.push({ level, text, id: `toc-${index}` });
        index++;
      }
    }
  }

  return headings;
}

// 文档大纲组件 - 用于悬浮显示
export function DocumentOutline({ node, onHeadingClick }: { node: OutlineNode; onHeadingClick?: (text: string, level: number) => void }) {
  const { selectNode, selectedNodeId } = useOutlineStore();

  const headings = useMemo(() => {
    const markdownBlocks = node.contentBlocks.filter(
      (b): b is { type: 'markdown'; id: string; content: string } => b.type === 'markdown'
    );
    const allContent = markdownBlocks.map(b => b.content).join('\n');
    return extractHeadings(allContent);
  }, [node.contentBlocks]);

  const handleClick = useCallback((text: string, level: number) => {
    // 如果当前显示的不是这个节点，先切换到这个节点
    if (selectedNodeId !== node.id) {
      selectNode(node.id);
      // 等待 DOM 更新后再滚动
      setTimeout(() => {
        scrollToHeading(text, level);
      }, 100);
    } else {
      scrollToHeading(text, level);
    }

    onHeadingClick?.(text, level);
  }, [selectedNodeId, node.id, selectNode, onHeadingClick]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="py-2 w-40">
      <div className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">本页大纲</div>
      {headings.map((heading, index) => (
        <button
          key={`${heading.id}-${index}`}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(heading.text, heading.level);
          }}
          className="w-full text-left px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-md truncate"
          style={{ paddingLeft: `${(heading.level - 1) * 8 + 12}px` }}
          title={heading.text}
        >
          {heading.text}
        </button>
      ))}
    </div>
  );
}

// 滚动到指定标题
function scrollToHeading(text: string, level: number) {
  const contentArea = document.querySelector('.tiptap-content, .markdown-content');
  if (!contentArea) return;

  const headingElements = contentArea.querySelectorAll(`h${level}`);
  for (const el of headingElements) {
    const elText = el.textContent?.trim();
    if (elText === text) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    }
  }
}

// 页面列表项 - 简化版，hover 时在右侧弹出大纲
function PageItem({ node, depth = 0 }: { node: OutlineNode; depth?: number }) {
  const { nodes, selectedNodeId, selectNode } = useOutlineStore();
  const [showOutline, setShowOutline] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const itemRef = React.useRef<HTMLDivElement>(null);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const isSelected = selectedNodeId === node.id;
  const hasChildren = node.childIds.length > 0;

  // 检查是否有大纲内容
  const hasOutline = useMemo(() => {
    const markdownBlocks = node.contentBlocks.filter(
      (b): b is { type: 'markdown'; id: string; content: string } => b.type === 'markdown'
    );
    const allContent = markdownBlocks.map(b => b.content).join('\n');
    return extractHeadings(allContent).length > 0;
  }, [node.contentBlocks]);

  const handleMouseEnter = useCallback(() => {
    // 清除隐藏定时器
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (hasOutline && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.top,
        left: rect.right,
      });
      setShowOutline(true);
    }
  }, [hasOutline]);

  const handleMouseLeave = useCallback(() => {
    // 延迟隐藏，给用户时间移动到弹窗
    hideTimeoutRef.current = setTimeout(() => {
      setShowOutline(false);
    }, 150);
  }, []);

  const handlePopupMouseEnter = useCallback(() => {
    // 鼠标进入弹窗，取消隐藏
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handlePopupMouseLeave = useCallback(() => {
    // 鼠标离开弹窗，立即隐藏
    setShowOutline(false);
  }, []);

  return (
    <div>
      <div
        ref={itemRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
            isSelected
              ? 'bg-gray-200 dark:bg-gray-700 text-[var(--foreground)]'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--foreground)]'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => selectNode(node.id)}
        >
          <span className="flex-1 text-sm truncate">{node.title}</span>
        </div>

        {/* Hover 时在右侧弹出大纲 - 使用 fixed 定位避免被裁剪 */}
        {hasOutline && showOutline && (
          <div
            className="fixed z-[100] bg-[var(--background)] border border-[var(--border-color)] rounded-lg shadow-lg"
            style={{ top: popupPosition.top, left: popupPosition.left }}
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          >
            <DocumentOutline node={node} />
          </div>
        )}
      </div>

      {/* 子节点始终展开 */}
      {hasChildren && (
        <div>
          {node.childIds.map((childId) => {
            const childNode = nodes[childId];
            return childNode ? (
              <PageItem key={childId} node={childNode} depth={depth + 1} />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

interface NavItem {
  slug: string;
  title: string;
  href: string;
  children?: NavItem[];
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  navItems?: NavItem[];
  projectSlug?: string;
}

// 静态文档大纲组件 - 用于悬浮显示（从 API 获取内容）
function StaticDocumentOutline({
  projectSlug,
  pageSlug,
  onHeadingClick
}: {
  projectSlug: string;
  pageSlug: string;
  onHeadingClick?: (text: string, level: number) => void;
}) {
  const [headings, setHeadings] = useState<{ level: number; text: string; id: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `${projectSlug}/${pageSlug}`;

    // 检查缓存
    if (outlineCache.has(cacheKey)) {
      setHeadings(outlineCache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    // 从 API 获取文档内容
    async function fetchOutline() {
      try {
        const res = await fetch(`/api/doc?project=${projectSlug}&page=${pageSlug}`);
        const data = await res.json();

        if (res.ok && data.content) {
          const extracted = extractHeadings(data.content);
          outlineCache.set(cacheKey, extracted);
          setHeadings(extracted);
        }
      } catch (e) {
        console.error('Failed to fetch outline:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchOutline();
  }, [projectSlug, pageSlug]);

  const handleClick = useCallback((text: string, level: number) => {
    // 滚动到对应标题
    scrollToHeading(text, level);
    onHeadingClick?.(text, level);
  }, [onHeadingClick]);

  if (loading) {
    return (
      <div className="py-2 w-40">
        <div className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">加载中...</div>
      </div>
    );
  }

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="py-2 w-40">
      <div className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">本页大纲</div>
      {headings.map((heading, index) => (
        <button
          key={`${heading.id}-${index}`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleClick(heading.text, heading.level);
          }}
          className="w-full text-left px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-md truncate"
          style={{ paddingLeft: `${(heading.level - 1) * 8 + 12}px` }}
          title={heading.text}
        >
          {heading.text}
        </button>
      ))}
    </div>
  );
}

// 静态导航项组件 - 支持 workspace 路由和 hover 大纲
function StaticNavItem({ item, depth = 0, currentPath, projectSlug }: { item: NavItem; depth?: number; currentPath: string; projectSlug?: string }) {
  // 如果有 projectSlug，生成 workspace 路由
  const href = projectSlug ? `/workspace/${projectSlug}/${item.slug}` : item.href;
  const isActive = currentPath === href || currentPath.includes(`/${item.slug}`);
  const hasChildren = item.children && item.children.length > 0;

  // Hover 大纲状态
  const [showOutline, setShowOutline] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const itemRef = React.useRef<HTMLDivElement>(null);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    // 清除隐藏定时器
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (projectSlug && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.top,
        left: rect.right,
      });
      setShowOutline(true);
    }
  }, [projectSlug]);

  const handleMouseLeave = useCallback(() => {
    // 延迟隐藏，给用户时间移动到弹窗
    hideTimeoutRef.current = setTimeout(() => {
      setShowOutline(false);
    }, 150);
  }, []);

  const handlePopupMouseEnter = useCallback(() => {
    // 鼠标进入弹窗，取消隐藏
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handlePopupMouseLeave = useCallback(() => {
    // 鼠标离开弹窗，立即隐藏
    setShowOutline(false);
  }, []);

  return (
    <div>
      <div
        ref={itemRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <a
          href={href}
          className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
            isActive
              ? 'bg-gray-200 dark:bg-gray-700 text-[var(--foreground)]'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--foreground)]'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          <span className="flex-1 text-sm truncate">{item.title}</span>
        </a>

        {/* Hover 时在右侧弹出大纲 - 使用 fixed 定位避免被裁剪 */}
        {projectSlug && showOutline && (
          <div
            className="fixed z-[100] bg-[var(--background)] border border-[var(--border-color)] rounded-lg shadow-lg"
            style={{ top: popupPosition.top, left: popupPosition.left }}
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          >
            <StaticDocumentOutline projectSlug={projectSlug} pageSlug={item.slug} />
          </div>
        )}
      </div>

      {hasChildren && (
        <div>
          {item.children!.map((child) => (
            <StaticNavItem key={child.slug} item={child} depth={depth + 1} currentPath={currentPath} projectSlug={projectSlug} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ isCollapsed = false, onToggleCollapse, navItems, projectSlug }: SidebarProps) {
  const { nodes, rootIds, createNode } = useOutlineStore();
  const pathname = usePathname();

  // 根据 projectSlug 获取项目导航树
  const projectNavItems = useMemo(() => {
    if (navItems && navItems.length > 0) return navItems;
    if (projectSlug) return getNavTreeByProject(projectSlug);
    return [];
  }, [navItems, projectSlug]);

  const handleAddRootNode = useCallback(() => {
    createNode({
      title: '新页面',
      parentId: null,
    });
  }, [createNode]);

  // 折叠状态
  if (isCollapsed) {
    return (
      <div className="w-10 h-full flex flex-col items-center py-4 border-r border-[var(--border-color)] bg-[var(--background)]">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          title="展开侧边栏"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <aside className="w-60 h-full overflow-visible flex flex-col border-r border-[var(--border-color)] bg-[var(--background)]">
      {/* 页面列表区域 */}
      <div className="flex-1 overflow-y-auto overflow-x-visible px-2 py-3">
        {/* 如果有项目导航，使用静态导航 */}
        {projectNavItems.length > 0 ? (
          <>
            {projectNavItems.map((item) => (
              <StaticNavItem key={item.slug} item={item} currentPath={pathname} projectSlug={projectSlug} />
            ))}
          </>
        ) : (
          <>
            {/* 否则使用 outlineStore 的动态导航 */}
            {rootIds.map((id) => {
              const node = nodes[id];
              return node ? <PageItem key={id} node={node} /> : null;
            })}

            {/* 添加页面按钮 */}
            <button
              onClick={handleAddRootNode}
              className="w-full flex items-center gap-2 px-3 py-1.5 mt-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加页面
            </button>
          </>
        )}
      </div>

      {/* 底部折叠按钮 */}
      <div className="flex-shrink-0 p-2 border-t border-[var(--border-color)]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
        >
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          收起
        </button>
      </div>
    </aside>
  );
}

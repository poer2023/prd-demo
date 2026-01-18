# Workspace 页面 Docs 风格重构计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 Workspace 页面改造为与 `/docs` 完全一致的三栏布局，支持左右侧边栏可伸缩。

**Architecture:**
- 左侧：项目/文档目录导航（可折叠）
- 中间：主内容区（PRD编辑器/流程图/原型）
- 右侧：页面目录 TOC（可折叠）
- 底部：浮动 AI 聊天框（已实现，需统一风格）

**Tech Stack:** Next.js 16, React, TailwindCSS, CSS Variables

---

## Task 1: 创建可伸缩侧边栏组件

**Files:**
- Create: `src/components/layout/CollapsibleSidebar.tsx`

**Step 1: 创建 CollapsibleSidebar 组件**

基于现有 `Sidebar.tsx` 样式，添加折叠/展开功能。

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  slug: string;
  title: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

interface CollapsibleSidebarProps {
  items: NavItem[];
  position: "left" | "right";
  title?: string;
  lastUpdated?: string;
  defaultCollapsed?: boolean;
}

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div className={`flex items-center ${depth > 0 ? "ml-4" : ""}`}>
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-5 h-5 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--foreground)]"
          >
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <Link
          href={item.href}
          className={`flex-1 py-1.5 px-2 text-sm rounded transition ${
            isActive
              ? "bg-[#e8e8e8] dark:bg-[var(--nav-active)] text-[var(--foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)]"
          } ${!hasChildren ? "ml-5" : ""}`}
        >
          <span className="flex items-center gap-2">
            {item.icon}
            {item.title}
          </span>
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {item.children!.map((child) => (
            <NavItemComponent key={child.slug} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CollapsibleSidebar({
  items,
  position,
  title,
  lastUpdated,
  defaultCollapsed = false
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // 折叠状态 - 显示小条
  if (isCollapsed) {
    return (
      <div
        className={`w-10 h-[calc(100vh-80px)] sticky top-20 flex flex-col items-center py-4 border-${position === 'left' ? 'r' : 'l'} border-[var(--border-color)] bg-[var(--background)]`}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md"
          title={position === 'left' ? '展开导航' : '展开目录'}
        >
          <svg
            className={`w-4 h-4 ${position === 'left' ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  // 展开状态
  return (
    <aside
      className={`w-72 h-[calc(100vh-80px)] overflow-y-auto sticky top-20 py-6 ${
        position === 'left' ? 'pl-6 pr-4 border-r' : 'pl-4 pr-6 border-l'
      } border-[var(--border-color)] bg-[var(--background)]`}
    >
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="text-sm font-medium text-[var(--foreground)]">{title}</h3>
        )}
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded"
          title="收起"
        >
          <svg
            className={`w-4 h-4 ${position === 'left' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {lastUpdated && (
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Last updated: {lastUpdated}
        </p>
      )}

      <nav className="space-y-0.5">
        {items.map((item) => (
          <NavItemComponent key={item.slug} item={item} />
        ))}
      </nav>
    </aside>
  );
}
```

**Step 2: 验证组件创建成功**

Run: `npm run build`
Expected: 编译成功，无类型错误

---

## Task 2: 创建右侧可伸缩目录组件

**Files:**
- Create: `src/components/layout/CollapsibleTOC.tsx`

**Step 1: 创建 CollapsibleTOC 组件**

基于 `TableOfContents.tsx` 样式，添加折叠功能。

```tsx
"use client";

import { useState } from "react";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface CollapsibleTOCProps {
  items: TOCItem[];
  activeId?: string;
  defaultCollapsed?: boolean;
}

export function CollapsibleTOC({
  items,
  activeId,
  defaultCollapsed = false
}: CollapsibleTOCProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  if (items.length === 0) return null;

  // 折叠状态
  if (isCollapsed) {
    return (
      <div className="w-10 h-[calc(100vh-80px)] sticky top-20 flex flex-col items-center py-4 border-l border-[var(--border-color)] bg-[var(--background)]">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md"
          title="展开目录"
        >
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  // 展开状态
  return (
    <aside className="w-64 h-[calc(100vh-80px)] overflow-y-auto sticky top-20 py-6 px-6 border-l border-[var(--border-color)] bg-[var(--background)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--foreground)]">On this page</h3>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded"
          title="收起"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block text-sm py-0.5 transition ${
              item.level > 1 ? "pl-3" : ""
            } ${
              activeId === item.id
                ? "text-[var(--foreground)] font-medium"
                : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}
```

**Step 2: 验证组件创建成功**

Run: `npm run build`
Expected: 编译成功

---

## Task 3: 更新 FloatingChat 风格

**Files:**
- Modify: `src/components/chat/FloatingChat.tsx`

**Step 1: 统一 FloatingChat 的样式变量**

更新为使用与 docs 相同的 CSS 变量和样式。

主要更改：
1. 圆角使用 `rounded-lg` 保持一致
2. 边框使用 `border-[var(--border-color)]`
3. 背景使用 `bg-[var(--background)]`
4. 文字颜色使用 `text-[var(--foreground)]` 和 `text-[var(--text-muted)]`
5. hover 状态使用 `hover:bg-[var(--nav-hover)]`

---

## Task 4: 重构 Workspace 页面布局

**Files:**
- Modify: `src/app/workspace/page.tsx`

**Step 1: 导入新组件并重构布局**

```tsx
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar';
import { CollapsibleTOC } from '@/components/layout/CollapsibleTOC';
import { FloatingChat } from '@/components/chat/FloatingChat';
import { getActiveSpec } from '@/lib/specs/store';
import type { DesignSpec } from '@/lib/specs/types';

// 动态导入 FlowEditor
const FlowEditor = dynamic(
  () => import('@/components/flow/FlowEditor').then(mod => mod.FlowEditor),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-[var(--text-muted)]">Loading...</div> }
);

type TabType = 'prd' | 'flow' | 'prototype';

// 左侧导航数据
const leftNavItems = [
  {
    slug: 'documents',
    title: '文档',
    href: '#',
    children: [
      { slug: 'prd', title: 'PRD 文档', href: '#prd' },
      { slug: 'spec', title: '技术规格', href: '#spec' },
      { slug: 'api', title: 'API 文档', href: '#api' },
    ]
  },
  {
    slug: 'designs',
    title: '设计',
    href: '#',
    children: [
      { slug: 'flow', title: '流程图', href: '#flow' },
      { slug: 'prototype', title: '原型', href: '#prototype' },
      { slug: 'wireframe', title: '线框图', href: '#wireframe' },
    ]
  },
  {
    slug: 'resources',
    title: '资源',
    href: '#',
    children: [
      { slug: 'assets', title: '素材', href: '#assets' },
      { slug: 'references', title: '参考', href: '#references' },
    ]
  }
];

// 右侧目录数据（根据当前 tab 动态生成）
const getTocItems = (tab: TabType) => {
  switch (tab) {
    case 'prd':
      return [
        { id: 'overview', title: '概述', level: 1 },
        { id: 'user-stories', title: '用户故事', level: 1 },
        { id: 'requirements', title: '功能需求', level: 1 },
        { id: 'non-functional', title: '非功能需求', level: 2 },
        { id: 'timeline', title: '时间线', level: 1 },
      ];
    case 'flow':
      return [
        { id: 'main-flow', title: '主流程', level: 1 },
        { id: 'sub-flows', title: '子流程', level: 1 },
        { id: 'error-handling', title: '异常处理', level: 2 },
      ];
    case 'prototype':
      return [
        { id: 'screens', title: '页面列表', level: 1 },
        { id: 'interactions', title: '交互说明', level: 1 },
      ];
    default:
      return [];
  }
};

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<TabType>('prd');
  const [prdContent, setPrdContent] = useState('');
  const [activeSpec, setActiveSpec] = useState<DesignSpec | null>(null);

  useEffect(() => {
    setActiveSpec(getActiveSpec());
  }, []);

  const handleInsertContent = (content: string) => {
    setPrdContent(prev => prev + '\n\n' + content);
  };

  const tocItems = getTocItems(activeTab);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header projectName="Workspace" />

      <div className="flex">
        {/* 左侧可伸缩导航 */}
        <CollapsibleSidebar
          items={leftNavItems}
          position="left"
          title="项目文档"
          lastUpdated="2025-01-18"
        />

        {/* 主内容区 */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* 页面标题 */}
            <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-6">
              {activeTab === 'prd' ? 'PRD 文档' : activeTab === 'flow' ? '流程图' : '原型'}
            </h1>

            {/* Tab 切换 - DeepWiki 风格 */}
            <div className="flex items-center gap-1 mb-6">
              {[
                { id: 'prd', label: 'PRD 文档' },
                { id: 'flow', label: '流程图' },
                { id: 'prototype', label: '原型' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2 text-sm rounded-md transition ${
                    activeTab === tab.id
                      ? 'bg-[#e8e8e8] dark:bg-[var(--nav-active)] text-[var(--foreground)] font-medium'
                      : 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 内容区 - 细边框卡片风格 */}
            <div className="border border-[var(--border-color)] rounded-lg bg-[var(--background)]">
              {activeTab === 'prd' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-[var(--foreground)]">编辑器</h2>
                    <button
                      onClick={() => {
                        const blob = new Blob([prdContent], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'prd.md';
                        a.click();
                      }}
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] px-3 py-1.5 rounded-md hover:bg-[var(--nav-hover)] transition"
                      disabled={!prdContent}
                    >
                      导出 Markdown
                    </button>
                  </div>
                  <textarea
                    value={prdContent}
                    onChange={(e) => setPrdContent(e.target.value)}
                    placeholder="# 产品需求文档

## 概述
描述产品功能和目标...

## 用户故事
As a [用户角色], I want [功能], so that [价值]...

## 功能需求
1. 功能点 1
2. 功能点 2

使用底部 AI 助手生成内容，然后插入到这里。"
                    className="w-full h-[500px] p-4 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--border-color)]"
                  />
                </div>
              )}

              {activeTab === 'flow' && (
                <div className="h-[600px]">
                  <FlowEditor />
                </div>
              )}

              {activeTab === 'prototype' && (
                <div className="h-[500px] flex items-center justify-center text-[var(--text-muted)]">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <p>原型预览功能</p>
                    <p className="text-sm mt-1">即将推出...</p>
                  </div>
                </div>
              )}
            </div>

            {/* 规范信息 */}
            <div className="mt-6 text-xs text-[var(--text-secondary)]">
              {activeSpec ? (
                <span>当前规范: {activeSpec.name}</span>
              ) : (
                <span className="text-yellow-600">未选择设计规范</span>
              )}
              {activeTab === 'prd' && <span className="ml-4">{prdContent.length} 字符</span>}
            </div>
          </div>
        </main>

        {/* 右侧可伸缩目录 */}
        <CollapsibleTOC items={tocItems} />
      </div>

      {/* 浮动 AI 聊天 */}
      <FloatingChat
        onInsertContent={activeTab === 'prd' ? handleInsertContent : undefined}
        existingContent={prdContent}
      />
    </div>
  );
}
```

**Step 2: 验证页面编译成功**

Run: `npm run build`
Expected: 编译成功

---

## Task 5: 更新 FloatingChat 样式一致性

**Files:**
- Modify: `src/components/chat/FloatingChat.tsx`

**Step 1: 更新展开按钮样式**

将浮动按钮样式更新为与 docs 风格一致：
- 使用 `bg-[var(--foreground)]` 替代 `bg-blue-500`
- 使用 `text-[var(--background)]` 替代 `text-white`

**Step 2: 更新对话框样式**

- Header 使用 `border-b border-[var(--border-color)]`
- 消息气泡使用统一的颜色变量
- 输入框使用 `focus:ring-1 focus:ring-[var(--border-color)]`

---

## Task 6: 验证和测试

**Step 1: 运行开发服务器**

Run: `npm run dev`

**Step 2: 验证功能**

访问 http://localhost:3000/workspace 验证：
- [ ] 左侧导航显示正确，可折叠/展开
- [ ] 右侧目录显示正确，可折叠/展开
- [ ] Tab 切换正常
- [ ] 主内容区全宽显示
- [ ] 浮动聊天框正常工作
- [ ] 整体风格与 /docs 一致

**Step 3: 生产构建验证**

Run: `npm run build`
Expected: 编译成功，无警告

---

## 布局对比

```
Before (旧布局):
┌─────────────────────────────────┬──────────┐
│          Main Content           │  Chat    │
│         (with tabs)             │  Panel   │
└─────────────────────────────────┴──────────┘

After (新布局 - Docs 风格):
┌────────┬─────────────────────────┬────────┐
│  Nav   │      Main Content       │  TOC   │
│ (可折叠) │    (DeepWiki 风格)      │ (可折叠) │
└────────┴─────────────────────────┴────────┘
                    ┌─────────┐
                    │ AI Chat │ (浮动)
                    └─────────┘
```

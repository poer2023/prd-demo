"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { TableOfContents } from "./TableOfContents";
import { DeviceToolbar } from "./DeviceToolbar";
import { DeviceFrame } from "./DeviceFrame";
import { defaultDevice } from "@/config/devices";

interface Version {
  id: string;
  label: string;
  date: string;
}

interface State {
  id: string;
  label: string;
}

interface Decision {
  date: string;
  content: string;
}

interface NavItem {
  slug: string;
  title: string;
  href: string;
  children?: NavItem[];
}

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface DocLayoutProps {
  children: (props: { version: string; state: string }) => React.ReactNode;
  title: string;
  description?: string;
  versions?: Version[];
  defaultVersion?: string;
  states?: State[];
  defaultState?: string;
  decisions?: Decision[];
  navItems?: NavItem[];
  tocItems?: TOCItem[];
  lastUpdated?: string;
  projectSlug?: string; // 项目标识，用于切换侧边栏导航
}

export function DocLayout({
  children,
  title,
  description,
  versions = [],
  defaultVersion,
  states = [],
  defaultState,
  decisions = [],
  navItems = [],
  tocItems = [],
  lastUpdated,
  projectSlug,
}: DocLayoutProps) {
  const [currentVersion, setCurrentVersion] = useState(defaultVersion || versions[0]?.id);
  const [currentState, setCurrentState] = useState(defaultState || states[0]?.id);
  const [currentDevice, setCurrentDevice] = useState(defaultDevice);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion, setCompareVersion] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSection, setActiveSection] = useState<"prototype" | "decisions">("prototype");

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
      if (e.key === "f" && !e.metaKey && !e.ctrlKey && e.target === document.body) {
        setIsFullscreen(!isFullscreen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // 构建 TOC
  const pageToc: TOCItem[] = [
    { id: "prototype", title: "原型预览", level: 1 },
    ...versions.map(v => ({ id: `version-${v.id}`, title: v.label, level: 2 })),
    { id: "decisions", title: "决策日志", level: 1 },
    ...decisions.slice(0, 5).map((d, i) => ({ id: `decision-${i}`, title: d.content.slice(0, 20) + "...", level: 2 })),
  ];

  if (isFullscreen) {
    return (
      <div className="h-screen bg-[var(--background)] flex flex-col">
        <div className="bg-[var(--background)] border-b border-[var(--border-color)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium text-[var(--foreground)]">{title}</span>
            <div className="flex items-center gap-2">
              {states.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentState(s.id)}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    s.id === currentState
                      ? "bg-[var(--nav-active)] text-[var(--foreground)] font-medium"
                      : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DeviceToolbar currentDevice={currentDevice} onDeviceChange={setCurrentDevice} />
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md"
              title="退出全屏 (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-[var(--background-secondary)] p-8">
          <DeviceFrame deviceId={currentDevice}>
            {children({ version: currentVersion, state: currentState })}
          </DeviceFrame>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--background)]">
      <Header />
      <div className="flex flex-1 min-h-0">
        {/* 左侧边栏 - 固定不滚动 */}
        <div className="flex-shrink-0">
          <Sidebar navItems={navItems} projectSlug={projectSlug} />
        </div>

        {/* 主内容区 - 唯一可滚动区域 */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* 页面标题 */}
            <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-6">{title}</h1>

            {/* DeepWiki 风格：折叠面板 */}
            <div className="border border-[var(--border-color)] rounded-lg mb-8">
              <button className="w-full px-4 py-3 flex items-center gap-2 text-sm text-[var(--text-muted)] hover:bg-[var(--nav-hover)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Relevant source files
              </button>
            </div>

            {description && (
              <p className="text-[var(--text-primary)] mb-6 leading-relaxed">{description}</p>
            )}

            {/* 原型预览区 */}
            <section id="prototype" className="mb-10">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">原型预览</h2>

              {/* 版本切换 - Tab 样式 */}
              {versions.length > 0 && (
                <div className="flex items-center gap-1 mb-4">
                  {versions.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setCurrentVersion(v.id)}
                      className={`px-4 py-2 text-sm rounded-md transition ${
                        v.id === currentVersion
                          ? "bg-[var(--nav-active-bg)] text-[var(--foreground)] font-medium"
                          : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)]"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}

              {/* 原型展示 - 细边框卡片 */}
              <div className="border border-[var(--border-color)] rounded-lg p-6 bg-[var(--background)]">
                <DeviceFrame deviceId={currentDevice}>
                  {children({ version: currentVersion, state: currentState })}
                </DeviceFrame>
              </div>
            </section>

            {/* 决策日志 */}
            {decisions.length > 0 && (
              <section id="decisions" className="mb-10">
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">决策日志</h2>
                <div>
                  {decisions.map((d, i) => (
                    <div
                      key={i}
                      id={`decision-${i}`}
                      className="flex gap-4 py-3 border-b border-[var(--border-color)] last:border-b-0"
                    >
                      <div className="text-sm text-[var(--text-secondary)] whitespace-nowrap">{d.date}</div>
                      <div className="text-sm text-[var(--text-primary)]">{d.content}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        {/* 右侧目录 */}
        <TableOfContents items={pageToc} />
      </div>
    </div>
  );
}

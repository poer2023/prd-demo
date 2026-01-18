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
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-900">{title}</span>
            <div className="flex items-center gap-2">
              {states.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentState(s.id)}
                  className={`px-3 py-1 text-sm rounded-full transition ${
                    s.id === currentState
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="退出全屏 (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <DeviceFrame deviceId={currentDevice}>
            {children({ version: currentVersion, state: currentState })}
          </DeviceFrame>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        {/* 左侧边栏 */}
        <Sidebar items={navItems} lastUpdated={lastUpdated} />

        {/* 主内容区 */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* 页面标题 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              {description && (
                <p className="text-gray-600">{description}</p>
              )}
            </div>

            {/* 原型预览区 */}
            <section id="prototype" className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">原型预览</h2>
                <div className="flex items-center gap-2">
                  <DeviceToolbar currentDevice={currentDevice} onDeviceChange={setCurrentDevice} />
                  {versions.length > 1 && (
                    <button
                      onClick={() => {
                        if (compareMode) {
                          setCompareMode(false);
                          setCompareVersion(null);
                        } else {
                          setCompareMode(true);
                          const currentIdx = versions.findIndex(v => v.id === currentVersion);
                          const compareIdx = currentIdx < versions.length - 1 ? currentIdx + 1 : 0;
                          setCompareVersion(versions[compareIdx].id);
                        }
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg transition ${
                        compareMode
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {compareMode ? "退出对比" : "对比"}
                    </button>
                  )}
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    title="全屏预览 (F)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 状态切换 */}
              {states.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500">状态：</span>
                  {states.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentState(s.id)}
                      className={`px-3 py-1 text-sm rounded-full transition ${
                        s.id === currentState
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* 版本切换 */}
              {versions.length > 0 && !compareMode && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-sm text-gray-500">版本：</span>
                  {versions.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setCurrentVersion(v.id)}
                      className={`px-3 py-1 text-sm rounded-full transition ${
                        v.id === currentVersion
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}

              {/* 原型展示 */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                {compareMode && compareVersion ? (
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <div className="text-center mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          {versions.find(v => v.id === currentVersion)?.label}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                        {children({ version: currentVersion, state: currentState })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-center mb-3">
                        <select
                          value={compareVersion}
                          onChange={(e) => setCompareVersion(e.target.value)}
                          className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full border-none cursor-pointer"
                        >
                          {versions.filter(v => v.id !== currentVersion).map(v => (
                            <option key={v.id} value={v.id}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="bg-white rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                        {children({ version: compareVersion, state: currentState })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <DeviceFrame deviceId={currentDevice}>
                    {children({ version: currentVersion, state: currentState })}
                  </DeviceFrame>
                )}
              </div>
            </section>

            {/* 决策日志 */}
            {decisions.length > 0 && (
              <section id="decisions" className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">决策日志</h2>
                <div className="space-y-4">
                  {decisions.map((d, i) => (
                    <div
                      key={i}
                      id={`decision-${i}`}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="text-sm text-gray-400 whitespace-nowrap">{d.date}</div>
                      <div className="text-sm text-gray-700">{d.content}</div>
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

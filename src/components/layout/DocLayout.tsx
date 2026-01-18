"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDocsNav } from "@/config/docs";
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

interface DocLayoutProps {
  children: (props: { version: string; state: string }) => React.ReactNode;
  title: string;
  description?: string;
  versions?: Version[];
  defaultVersion?: string;
  states?: State[];
  defaultState?: string;
  decisions?: Decision[];
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
}: DocLayoutProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"info" | "versions" | "decisions">("info");
  const [currentVersion, setCurrentVersion] = useState(defaultVersion || versions[0]?.id);
  const [currentState, setCurrentState] = useState(defaultState || states[0]?.id);
  const [currentDevice, setCurrentDevice] = useState(defaultDevice);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion, setCompareVersion] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      {!isFullscreen && (
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
          {/* 文档目录 */}
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              文档目录
            </h2>
            <nav className="space-y-1">
              {getDocsNav().map((doc) => {
                const isActive = pathname === doc.href;
                return (
                  <Link
                    key={doc.slug}
                    href={doc.href}
                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        isActive ? "bg-blue-500" :
                        doc.status === "approved" ? "bg-green-400" :
                        doc.status === "review" ? "bg-yellow-400" : "bg-gray-300"
                      }`}
                    />
                    {doc.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Tab 切换 */}
          <div className="flex border-b border-gray-100">
            {[
              { id: "info", label: "说明" },
              { id: "versions", label: "版本" },
              { id: "decisions", label: "决策" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-3 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 内容 */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "info" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                      {currentVersion}
                    </span>
                    {currentState && (
                      <span className="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                        {states.find(s => s.id === currentState)?.label}
                      </span>
                    )}
                  </div>
                </div>
                {description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                )}
              </div>
            )}

            {activeTab === "versions" && (
              <div className="space-y-2">
                {versions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setCurrentVersion(v.id)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      v.id === currentVersion
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900">{v.label}</span>
                      {v.id === currentVersion && (
                        <span className="text-xs text-blue-600">当前</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{v.date}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === "decisions" && (
              <div className="space-y-3">
                {decisions.map((d, i) => (
                  <div key={i} className="border-l-2 border-blue-200 pl-3 py-1">
                    <span className="text-xs text-gray-400 block">{d.date}</span>
                    <p className="text-sm text-gray-700 mt-1">{d.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 原型主区域 */}
      <main className="flex-1 flex flex-col">
        {/* 工具栏 */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {states.length > 0 && (
              <>
                <span className="text-xs text-gray-500 mr-1">状态：</span>
                {states.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentState(s.id)}
                    className={`px-3 py-1.5 text-sm rounded-full transition ${
                      s.id === currentState
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </>
            )}
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
                className={`px-3 py-1.5 text-sm rounded-full transition ml-4 ${
                  compareMode
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {compareMode ? "退出对比" : "版本对比"}
              </button>
            )}
          </div>
          <div className="flex items-center">
            <DeviceToolbar currentDevice={currentDevice} onDeviceChange={setCurrentDevice} />
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition ml-2"
              title={isFullscreen ? "退出全屏 (Esc)" : "全屏预览 (F)"}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 原型展示区 */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          {compareMode && compareVersion ? (
            <div className="flex gap-8 h-full">
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {versions.find(v => v.id === currentVersion)?.label || currentVersion}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm p-4">
                  {children({ version: currentVersion, state: currentState })}
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-4">
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
                <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm p-4">
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
      </main>
    </div>
  );
}

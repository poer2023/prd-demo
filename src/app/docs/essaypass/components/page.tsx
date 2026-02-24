"use client";

import { DocLayout } from "@/components/layout";
import { essaypassNavTree } from "@/config/docs";

export default function ComponentsPage() {
  return (
    <DocLayout
      title="通用组件"
      description="EssayPass 项目的通用组件库，包含 Header、MobileFrame、Modal 等。"
      versions={[
        { id: "v1", label: "V1 - 组件库", date: "2025-01-19" },
      ]}
      defaultVersion="v1"
      states={[
        { id: "light", label: "浅色" },
        { id: "dark", label: "深色" },
      ]}
      defaultState="light"
      decisions={[
        { date: "01-19", content: "Header 添加 Web/Mobile 切换按钮" },
        { date: "01-18", content: "Modal 弹窗支持多尺寸" },
        { date: "01-17", content: "MobileFrame 组件用于移动端预览" },
        { date: "01-15", content: "统一组件设计规范" },
      ]}
      navItems={essaypassNavTree}
      projectSlug="essaypass"
      lastUpdated="2025-01-19"
    >
      {({ state }) => (
        <div className={`space-y-6 ${state === "dark" ? "dark" : ""}`}>
          {/* Header 组件 */}
          <section id="header" className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Header 组件</h3>
            <div className={`p-4 rounded-lg border ${
              state === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  <span className={`font-bold ${state === "dark" ? "text-white" : "text-gray-900"}`}>
                    EssayPass
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button className="px-3 py-1 bg-white dark:bg-gray-700 rounded text-sm shadow-sm">Web</button>
                    <button className="px-3 py-1 text-gray-500 text-sm">Mobile</button>
                  </div>
                  <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded text-sm">
                    EN / 中
                  </button>
                  <span className="text-gray-400">⚙️</span>
                </div>
              </div>
            </div>
          </section>

          {/* MobileFrame 组件 */}
          <section id="mobile-frame" className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white">MobileFrame 组件</h3>
            <div className="flex justify-center">
              <div className={`w-64 rounded-3xl p-2 ${
                state === "dark" ? "bg-gray-800" : "bg-gray-900"
              }`}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
                  {/* 状态栏 */}
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 flex items-center justify-between px-4 text-xs">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                  {/* 内容区 */}
                  <div className="h-48 p-4 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500">Mobile Preview</span>
                  </div>
                  {/* Home Indicator */}
                  <div className="h-8 flex items-center justify-center">
                    <div className="w-24 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Modal 组件 */}
          <section id="modal" className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Modal 弹窗</h3>
            <div className="relative p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="absolute inset-0 bg-black/30 rounded-lg" />
              <div className={`relative mx-auto max-w-sm p-6 rounded-lg shadow-xl ${
                state === "dark" ? "bg-gray-900" : "bg-white"
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`font-medium ${state === "dark" ? "text-white" : "text-gray-900"}`}>
                    确认提交
                  </h4>
                  <button className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <p className={`text-sm mb-4 ${state === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  确定要提交这篇论文吗？提交后将开始生成。
                </p>
                <div className="flex gap-2 justify-end">
                  <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    取消
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    确认
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </DocLayout>
  );
}

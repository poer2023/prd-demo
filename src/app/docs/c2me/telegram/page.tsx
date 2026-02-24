"use client";

import { DocLayout } from "@/components/layout";
import { c2meNavTree } from "@/config/docs";

export default function TelegramBotPage() {
  return (
    <DocLayout
      title="Telegram Bot"
      description="Telegram Bot 是用户与 Claude Code 交互的主要入口，支持文本消息、图片、文件等多种输入方式。专为移动端优化，提供自然的权限控制和可视化差异显示。"
      versions={[
        { id: "v1", label: "V1 - 完整版", date: "2025-01-19" },
      ]}
      defaultVersion="v1"
      states={[
        { id: "features", label: "功能特性" },
        { id: "flow", label: "消息流程" },
      ]}
      defaultState="features"
      decisions={[
        { date: "01-18", content: "自然权限控制：内联键盘批准/拒绝" },
        { date: "01-17", content: "可视化差异显示：全面的 diff 视图" },
        { date: "01-16", content: "集成文件浏览器" },
        { date: "01-15", content: "基本操作支持：/clear, /abort, /plan" },
      ]}
      navItems={c2meNavTree}
      projectSlug="c2me"
      lastUpdated="2025-01-19"
    >
      {({ state }) => (
        <div className="space-y-4">
          {state === "features" ? (
            <>
              <section className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🔒", title: "自然权限控制", desc: "通过直观的内联键盘批准或拒绝工具操作" },
                  { icon: "📊", title: "可视化差异", desc: "所有代码编辑操作显示全面的 diff 视图" },
                  { icon: "📁", title: "文件浏览器", desc: "直接在 Telegram 内探索项目目录" },
                  { icon: "⚡", title: "快捷命令", desc: "/clear, /abort, /plan 等快捷操作" },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </section>

              <section className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Handler 架构</h3>
                <div className="grid grid-cols-4 gap-2">
                  {["CommandHandler", "MessageHandler", "CallbackHandler", "ToolHandler", "FileBrowserHandler", "ProjectHandler", "ProgressControlHandler", "KeyboardFactory"].map((handler) => (
                    <span key={handler} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs text-center">
                      {handler}
                    </span>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">消息处理流程</h3>
              <div className="space-y-3">
                {[
                  { step: "1", title: "用户发送消息", desc: "Telegram → TelegramHandler" },
                  { step: "2", title: "获取会话", desc: "TelegramHandler → Storage" },
                  { step: "3", title: "添加到消息流", desc: "ClaudeManager.addMessageToStream()" },
                  { step: "4", title: "Claude 响应", desc: "SDK 流式返回结果" },
                  { step: "5", title: "发送给用户", desc: "TelegramHandler → Telegram" },
                  { step: "6", title: "更新会话", desc: "Storage 持久化" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {item.step}
                    </span>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </DocLayout>
  );
}

"use client";

import { DocLayout } from "@/components/layout";
import { c2meNavTree } from "@/config/docs";

export default function C2MEOverviewPage() {
  return (
    <DocLayout
      title="C2ME 项目概述"
      description="C2ME (Claude to Me) 是一个 Telegram Bot，集成 Claude Code SDK，提供 AI 编程助手功能。使用 Telegram 轮询模式，可在任何有互联网连接的计算机上运行。"
      versions={[
        { id: "v1.0", label: "V1.0 - 完整版", date: "2025-01-19" },
      ]}
      defaultVersion="v1.0"
      states={[
        { id: "overview", label: "概览" },
        { id: "architecture", label: "架构图" },
      ]}
      defaultState="overview"
      decisions={[
        { date: "01-19", content: "完成消息批处理队列 (MessageBatcher)" },
        { date: "01-18", content: "实现用户分析功能 (DAU/WAU/MAU)" },
        { date: "01-17", content: "Tauri 桌面应用完成" },
        { date: "01-16", content: "Claude Code SDK 集成完成" },
        { date: "01-15", content: "核心 Telegram Bot 功能完成" },
      ]}
      navItems={c2meNavTree}
      projectSlug="c2me"
      lastUpdated="2025-01-19"
    >
      {({ state }) => (
        <div className="space-y-6">
          {state === "overview" ? (
            <>
              {/* 核心价值 */}
              <section className="grid grid-cols-2 gap-4">
                {[
                  { icon: "📱", title: "随时随地编程", desc: "通过 Telegram 与 Claude Code 交互" },
                  { icon: "📁", title: "项目管理", desc: "支持 GitHub 仓库和本地目录" },
                  { icon: "🔐", title: "权限控制", desc: "灵活的工具使用审批机制" },
                  { icon: "🖥️", title: "桌面管理", desc: "Tauri 桌面应用实时监控" },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </section>

              {/* 技术栈 */}
              <section className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">技术栈</h3>
                <div className="flex flex-wrap gap-2">
                  {["TypeScript", "Node.js", "Telegraf", "Claude SDK", "BullMQ", "Redis", "Tauri", "React"].map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </section>

              {/* 完成状态 */}
              <section className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">验收标准</h3>
                <div className="space-y-2">
                  {[
                    { text: "核心 Telegram Bot 功能完成", done: true },
                    { text: "Claude Code SDK 集成", done: true },
                    { text: "Tauri 桌面应用完成", done: true },
                    { text: "消息批处理队列 (MessageBatcher)", done: true },
                    { text: "用户分析功能 (DAU/WAU/MAU)", done: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={item.done ? "text-green-500" : "text-gray-400"}>
                        {item.done ? "✅" : "⬜"}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            /* 架构图 */
            <section className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">系统架构</h3>
              <div className="font-mono text-sm text-gray-600 dark:text-gray-400 whitespace-pre">
{`┌─────────────────────────────────────────┐
│  Telegram Layer                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Telegram │──│ Telegraf │            │
│  │   API    │  │   Bot    │            │
│  └──────────┘  └────┬─────┘            │
└─────────────────────┼───────────────────┘
                      ▼
┌─────────────────────────────────────────┐
│  Handler Layer                          │
│  ┌────────────────────────────────────┐ │
│  │         TelegramHandler            │ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │ │
│  │  │ CMD │ │ MSG │ │ CB  │ │TOOL │  │ │
│  │  └─────┘ └─────┘ └─────┘ └─────┘  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────┐
│  Service Layer                          │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │Permission│ │  Stream  │ │Progress │ │
│  │ Manager  │ │ Manager  │ │ Manager │ │
│  └──────────┘ └──────────┘ └─────────┘ │
└─────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────┐
│  Storage Layer                          │
│  ┌──────────┐  ┌──────────┐            │
│  │  Redis   │  │  Memory  │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘`}
              </div>
            </section>
          )}
        </div>
      )}
    </DocLayout>
  );
}

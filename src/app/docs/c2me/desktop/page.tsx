"use client";

import { DocLayout } from "@/components/layout";
import { c2meNavTree } from "@/config/docs";

export default function DesktopPage() {
  return (
    <DocLayout
      title="Desktop 管理应用"
      description="Tauri 桌面应用，提供实时监控、日志查看、用户管理等功能。"
      versions={[{ id: "v1", label: "V1", date: "2025-01-19" }]}
      defaultVersion="v1"
      states={[{ id: "features", label: "功能模块" }]}
      defaultState="features"
      decisions={[
        { date: "01-17", content: "Tauri 桌面应用完成" },
        { date: "01-16", content: "支持深色/浅色主题" },
      ]}
      navItems={c2meNavTree}
      projectSlug="c2me"
      lastUpdated="2025-01-19"
    >
      {() => (
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: "📊", title: "实时监控", desc: "服务状态、消息统计、API 调用" },
            { icon: "📜", title: "日志查看", desc: "实时日志流、级别过滤、全文搜索" },
            { icon: "👥", title: "用户管理", desc: "活跃用户、DAU/WAU/MAU 统计" },
            { icon: "⚙️", title: "系统设置", desc: "主题切换、语言切换、开机自启" },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </DocLayout>
  );
}

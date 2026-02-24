"use client";

import { DocLayout } from "@/components/layout";
import { essaypassNavTree } from "@/config/docs";
import { EssayPassPrototype } from "@/components/prototypes";

export default function EssayPassOverviewPage() {
  return (
    <DocLayout
      title="EssayPass"
      description="AI 论文写作助手 - 从需求到成稿的一站式解决方案。支持多语言、AI 智能分析、Turnitin 查重服务。"
      versions={[
        { id: "v0.1.0", label: "V0.1.0 - Demo 版本", date: "2025-01-19" },
      ]}
      defaultVersion="v0.1.0"
      states={[
        { id: "desktop", label: "桌面端" },
        { id: "mobile", label: "移动端" },
      ]}
      defaultState="desktop"
      decisions={[
        { date: "01-19", content: "升级至 Next.js 16.1.3 + React 19.2.3" },
        { date: "01-19", content: "Header 添加 Web/Mobile 切换和 GitHub 图标" },
        { date: "01-18", content: "完成订单确认页全部交互" },
        { date: "01-17", content: "添加首次加载引导动画" },
        { date: "01-16", content: "完成 i18n 国际化支持（中/英文）" },
        { date: "01-15", content: "完成首页 Landing Page" },
        { date: "01-14", content: "项目初始化，选择 Next.js App Router 架构" },
      ]}
      navItems={essaypassNavTree}
      projectSlug="essaypass"
      lastUpdated="2025-01-19"
    >
      {() => <EssayPassPrototype />}
    </DocLayout>
  );
}

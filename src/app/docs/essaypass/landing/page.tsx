"use client";

import { DocLayout } from "@/components/layout";
import { essaypassNavTree } from "@/config/docs";
import { EssayPassPrototype } from "@/components/prototypes";

export default function LandingPage() {
  return (
    <DocLayout
      title="首页 Landing"
      description="EssayPass 首页设计，包含 Hero 区域、特性轮播、徽章展示。"
      versions={[
        { id: "v1", label: "V1 - 完整版", date: "2025-01-15" },
      ]}
      defaultVersion="v1"
      states={[
        { id: "default", label: "交互演示" },
      ]}
      defaultState="default"
      decisions={[
        { date: "01-15", content: "Hero 区域采用渐变背景 + 大标题设计" },
        { date: "01-15", content: "特性卡片使用轮播展示，支持自动切换" },
        { date: "01-14", content: "添加 AI 检测、学术格式、真实引用三大特性" },
      ]}
      navItems={essaypassNavTree}
      projectSlug="essaypass"
      lastUpdated="2025-01-15"
    >
      {() => <EssayPassPrototype />}
    </DocLayout>
  );
}

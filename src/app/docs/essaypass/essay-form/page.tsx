"use client";

import { DocLayout } from "@/components/layout";
import { essaypassNavTree } from "@/config/docs";
import { EssayPassPrototype } from "@/components/prototypes";

export default function EssayFormPage() {
  return (
    <DocLayout
      title="表单页"
      description="论文需求表单，包含主题、字数、引用格式等字段，支持 AI 智能分析自动填充。"
      versions={[
        { id: "v1", label: "V1 - 基础版", date: "2025-01-16" },
      ]}
      defaultVersion="v1"
      states={[
        { id: "default", label: "交互演示" },
      ]}
      defaultState="default"
      decisions={[
        { date: "01-16", content: "表单采用卡片式布局，Option A/B 双模式" },
        { date: "01-16", content: "AI 智能分析支持逐字段高亮填充动画" },
        { date: "01-15", content: "确定核心字段：主题、类型、字数、引用格式" },
      ]}
      navItems={essaypassNavTree}
      projectSlug="essaypass"
      lastUpdated="2025-01-16"
    >
      {() => <EssayPassPrototype />}
    </DocLayout>
  );
}

"use client";

import { DocLayout } from "@/components/layout";
import { c2meNavTree } from "@/config/docs";
import { TelegramProjectPrototype } from "@/components/prototypes";

export default function ProjectPage() {
  return (
    <DocLayout
      title="项目管理"
      description="支持 GitHub 仓库和本地目录两种项目类型的创建和管理。"
      versions={[{ id: "v1", label: "V1", date: "2025-01-19" }]}
      defaultVersion="v1"
      states={[{ id: "default", label: "交互演示" }]}
      defaultState="default"
      decisions={[
        { date: "01-16", content: "GitHub 仓库克隆成功" },
        { date: "01-15", content: "本地目录验证成功" },
      ]}
      navItems={c2meNavTree}
      projectSlug="c2me"
      lastUpdated="2025-01-19"
    >
      {() => <TelegramProjectPrototype />}
    </DocLayout>
  );
}

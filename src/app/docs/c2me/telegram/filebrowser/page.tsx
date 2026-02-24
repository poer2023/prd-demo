"use client";

import { DocLayout } from "@/components/layout";
import { c2meNavTree } from "@/config/docs";
import { TelegramFileBrowserPrototype } from "@/components/prototypes";

export default function FileBrowserPage() {
  return (
    <DocLayout
      title="文件浏览器"
      description="内置文件浏览器，支持通过 Telegram 键盘导航项目目录结构。"
      versions={[{ id: "v1", label: "V1", date: "2025-01-19" }]}
      defaultVersion="v1"
      states={[{ id: "default", label: "交互演示" }]}
      defaultState="default"
      decisions={[
        { date: "01-16", content: "正确显示目录结构" },
        { date: "01-15", content: "文件类型图标显示" },
      ]}
      navItems={c2meNavTree}
      projectSlug="c2me"
      lastUpdated="2025-01-19"
    >
      {() => <TelegramFileBrowserPrototype />}
    </DocLayout>
  );
}

"use client";

import { DocLayout } from "@/components/layout";
import { c2meNavTree } from "@/config/docs";
import { DesktopSimulatorPrototype } from "@/components/prototypes";

export default function SimulatorPage() {
  return (
    <DocLayout
      title="消息模拟器"
      description="Telegram 风格的消息查看器，用于预览和调试消息格式。"
      versions={[{ id: "v1", label: "V1", date: "2025-01-19" }]}
      defaultVersion="v1"
      states={[{ id: "default", label: "交互演示" }]}
      defaultState="default"
      decisions={[{ date: "01-16", content: "消息样式与 Telegram 一致" }]}
      navItems={c2meNavTree}
      projectSlug="c2me"
      lastUpdated="2025-01-19"
    >
      {() => <DesktopSimulatorPrototype />}
    </DocLayout>
  );
}

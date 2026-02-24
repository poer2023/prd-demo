"use client";

import { DocLayout } from "@/components/layout";
import { c2meNavTree } from "@/config/docs";
import { TelegramCommandsPrototype } from "@/components/prototypes";

export default function CommandsPage() {
  return (
    <DocLayout
      title="命令系统"
      description="Telegram Bot 命令系统，支持基础命令、项目管理命令和 Claude Code 功能命令。"
      versions={[
        { id: "v1", label: "V1 - 完整版", date: "2025-01-19" },
      ]}
      defaultVersion="v1"
      states={[
        { id: "default", label: "交互演示" },
      ]}
      defaultState="default"
      decisions={[
        { date: "01-15", content: "所有命令响应时间 < 500ms" },
        { date: "01-14", content: "命令错误时返回友好提示" },
      ]}
      navItems={c2meNavTree}
      projectSlug="c2me"
      lastUpdated="2025-01-19"
    >
      {() => <TelegramCommandsPrototype />}
    </DocLayout>
  );
}

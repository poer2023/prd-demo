"use client";

import { DocLayout } from "@/components/layout";
import { c2meNavTree } from "@/config/docs";
import { TelegramMessagesPrototype } from "@/components/prototypes";

export default function MessagesPage() {
  return (
    <DocLayout
      title="消息处理"
      description="支持文本消息、图片、文件等多种输入方式，使用 BullMQ 实现消息队列。"
      versions={[{ id: "v1", label: "V1", date: "2025-01-19" }]}
      defaultVersion="v1"
      states={[{ id: "default", label: "交互演示" }]}
      defaultState="default"
      decisions={[
        { date: "01-16", content: "消息处理延迟 < 200ms" },
        { date: "01-15", content: "支持 @file 语法引用文件" },
      ]}
      navItems={c2meNavTree}
      projectSlug="c2me"
      lastUpdated="2025-01-19"
    >
      {() => <TelegramMessagesPrototype />}
    </DocLayout>
  );
}
